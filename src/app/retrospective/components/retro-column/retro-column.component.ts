import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CdkDropList, CdkDragDrop, CdkDragStart, CdkDragEnd, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RetroColumn, StickyNote, StickyNoteColor, RetroPhase } from '../../interfaces/retrospective.interface';
import { StickyNoteComponent } from '../sticky-note/sticky-note.component';
import { JiraControlModule } from '../../../jira-control/jira-control.module';

@Component({
  selector: 'app-retro-column',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextFieldModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzEmptyModule,
    NzToolTipModule,
    DragDropModule,
    StickyNoteComponent,
    JiraControlModule
  ],
  template: `
    <div class="retro-column h-full">
      <nz-card 
        [nzTitle]="columnHeaderTemplate"
        [nzBodyStyle]="{ padding: '16px', display: 'flex', 'flex-direction': 'column', height: 'calc(100% - 64px)' }"
        class="h-full"
      >
        <!-- Column Body -->
        <div class="column-content">
          <!-- Sticky Notes List with Drop Zone -->
          <div 
            class="notes-container" 
            #notesContainer
            cdkDropList
            [id]="'drop-list-' + column.id"
            [cdkDropListData]="stickyNotes"
            (cdkDropListDropped)="onNoteDrop($event)"
          >
            <app-sticky-note 
              *ngFor="let note of stickyNotes; trackBy: trackByNoteId"
              [note]="note" 
              [currentUserId]="currentUserId"
              [currentPhase]="currentPhase"
              (noteChange)="onNoteChange($event)"
              (noteDelete)="onNoteDelete($event)"
              (noteVote)="onNoteVote($event)"
              (noteEdit)="onNoteEdit($event)"
              cdkDrag
              [cdkDragData]="note"
              [cdkDragDisabled]="!canDragNotes()"
              (cdkDragStarted)="onDragStarted($event)"
              (cdkDragEnded)="onDragEnded($event)"
              class="note-item"
            ></app-sticky-note>
          </div>

          <!-- Empty State - OUTSIDE the drop list so it doesn't interfere -->
          <div 
            *ngIf="stickyNotes.length === 0" 
            class="empty-state-overlay"
          >
            <nz-empty 
              [nzNotFoundContent]="emptyTemplate"
              nzNotFoundImage="simple"
            ></nz-empty>
          </div>
        </div>
      </nz-card>
    </div>

    <!-- Column Header Template -->
    <ng-template #columnHeaderTemplate>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div>
            <h3 
              class="text-lg font-semibold mb-0"
              [style.color]="column.color"
            >
              {{ column.title }}
            </h3>
            <p class="text-sm text-gray-500 mb-0">{{ column.description }}</p>
          </div>
        </div>
        <div 
          class="split-button-container"
          [style.--column-color]="column.color"
        >
          <!-- Count Badge (Left Side) -->
          <div 
            class="split-button-count"
            [style.background-color]="column.color"
          >
            {{ stickyNotes.length }}
          </div>
          <!-- Add Button (Right Side) -->
          <button 
            class="split-button-action"
            [style.background-color]="column.color"
            (click)="showAddNoteModal()"
            [disabled]="!canAddNotes()"
          >
            <span nz-icon nzType="plus" nzTheme="outline" class="plus-icon"></span>
          </button>
        </div>
      </div>
    </ng-template>

    <!-- Empty State Template -->
    <ng-template #emptyTemplate>
      <div class="text-center">
        <p class="text-gray-400 mb-2">No notes yet</p>
        <p class="text-xs text-gray-300">Click "Add a note" to get started</p>
      </div>
    </ng-template>

    <!-- Add/Edit Note Modal -->
    <nz-modal
      [(nzVisible)]="isAddNoteModalVisible"
      nzClosable="false"
      nzFooter="null"
      nzWidth="600px"
    >
      <ng-container *nzModalContent>
        <div class="px-8 py-5">
          <div class="flex items-center py-3 text-textDarkest">
            <div class="text-xl">
              {{ isEditMode ? 'Edit Note' : 'Add New Note' }}
            </div>
            <div class="flex-auto"></div>
            <j-button icon="times"
                      [iconSize]="24"
                      (click)="cancelAddNote()"
                      [className]="'btn-empty'">
            </j-button>
          </div>
          <form class="note-form retro-modal-form">
            <div class="form-group">
              <label class="label">
                Note Content
              </label>
              <textarea
                [(ngModel)]="newNoteContent"
                name="noteContent"
                class="form-input"
                cdkTextareaAutosize
                #cdkTextareaAutosize="cdkTextareaAutosize"
                [cdkAutosizeMinRows]="3"
                [cdkAutosizeMaxRows]="6"
                placeholder="What would you like to share?"
                #noteInput
              ></textarea>
            </div>
            
            <div class="mt-3 form-group">
              <label class="label">
                Color
              </label>
              <div class="flex gap-2">
                <div 
                  *ngFor="let color of colorOptions"
                  class="w-8 h-8 rounded-lg cursor-pointer border-2 hover:scale-110 transition-transform"
                  [style.background-color]="getColorValue(color)"
                  [class.border-gray-800]="selectedColor === color"
                  [class.border-gray-300]="selectedColor !== color"
                  (click)="selectedColor = color"
                ></div>
              </div>
            </div>
            
            <div class="mt-5 form-group form-action">
              <j-button className="btn-primary mr-2"
                        type="button"
                        [disabled]="!newNoteContent.trim()"
                        (click)="isEditMode ? saveEditedNote() : addNote()">
                {{ isEditMode ? 'Save Changes' : 'Add Note' }}
              </j-button>
              <j-button className="btn-empty"
                        (click)="cancelAddNote()">
                Cancel
              </j-button>
            </div>
          </form>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .retro-column {
      width: 100%;
      min-width: 320px;
    }

    .column-content {
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    .notes-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb transparent;
      padding: 0 4px 12px 4px; /* Reduced bottom padding since FAB is removed */
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      will-change: scroll-position;
    }

    .notes-container::-webkit-scrollbar {
      width: 6px;
    }

    .notes-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .notes-container::-webkit-scrollbar-thumb {
      background-color: #e5e7eb;
      border-radius: 3px;
    }

    .notes-container::-webkit-scrollbar-thumb:hover {
      background-color: #d1d5db;
    }

    /* Hide scrollbar during drag - multiple approaches for cross-browser compatibility */
    .notes-container.cdk-drop-list-dragging::-webkit-scrollbar {
      width: 0 !important;
      display: none !important;
    }

    .notes-container.cdk-drop-list-dragging {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    /* Also hide when any child is being dragged */
    .cdk-drop-list-dragging.notes-container::-webkit-scrollbar,
    .notes-container:has(.cdk-drag-dragging)::-webkit-scrollbar {
      width: 0 !important;
      display: none !important;
    }

    .cdk-drop-list-dragging.notes-container,
    .notes-container:has(.cdk-drag-dragging) {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }

    /* Split Pill Button - Unified count and add button */
    .split-button-container {
      display: inline-flex;
      align-items: stretch;
      height: 32px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      position: relative;
    }

    .split-button-container:hover {
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .split-button-count {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      padding: 0 12px;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      cursor: default;
      user-select: none;
      position: relative;
    }

    .split-button-count::after {
      content: '';
      position: absolute;
      right: 0;
      top: 20%;
      bottom: 20%;
      width: 1px;
      background-color: rgba(255, 255, 255, 0.3);
    }

    .split-button-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      color: #ffffff;
    }

    .split-button-action:hover:not(:disabled) {
      background-color: #ffffff !important;
      color: var(--column-color);
    }

    .split-button-action:active:not(:disabled) {
      background-color: #ffffff !important;
      color: var(--column-color);
      opacity: 0.9;
    }

    .split-button-action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .split-button-action .plus-icon {
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease;
    }

    .empty-state-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
    }

    .cdk-drop-list {
      min-height: 100%;
      border-radius: 8px;
    }

    .cdk-drop-list-dragging {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list.cdk-drop-list-receiving {
      background-color: rgba(59, 130, 246, 0.02);
    }

    .cdk-drag {
      cursor: grab;
      touch-action: manipulation;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 0;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
      cursor: grabbing !important;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      background: #f9fafb;
      border: 2px dashed #e5e7eb;
      border-radius: 0;
      min-height: 120px;
      margin: 0 0 12px 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .note-item {
      margin-bottom: 12px;
    }

    ::ng-deep .ant-card-head {
      padding: 0 16px;
      min-height: 64px;
    }

    ::ng-deep .ant-card-head-title {
      padding: 16px 0;
    }

    // Modal form styles to match create issue modal
    .form-action {
      text-align: right;
    }

    .note-form {
      .form-group {
        margin-bottom: 1rem;
        
        .label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.8125rem;
          color: #5e6c84;
          display: block;
        }
      }

      // Consistent input styling
      .form-input {
        height: auto !important;
        padding: 8px 11px !important;
        border-radius: 3px !important;
        border: 1px solid #dfe1e6 !important;
        background: #fafbfc !important;
        font-size: 14px !important;
        line-height: 1.42857143 !important;
        width: 100% !important;
        resize: none !important;
        transition: background 0.1s, border-color 0.1s !important;
        
        &:hover {
          background: #ebecf0 !important;
          border-color: #c1c7d0 !important;
        }
        
        &:focus {
          background: #fff !important;
          border-color: #4c9aff !important;
          box-shadow: 0 0 0 1px #4c9aff !important;
          outline: none !important;
        }
      }
    }
  `]
})
export class RetroColumnComponent {
  @Input() column!: RetroColumn;
  @Input() stickyNotes: StickyNote[] = [];
  @Input() currentUserId: string = '';
  @Input() currentPhase!: RetroPhase;
  
  @Output() noteAdd = new EventEmitter<{ columnId: string, content: string, color: StickyNoteColor }>();
  @Output() noteChange = new EventEmitter<StickyNote>();
  @Output() noteDelete = new EventEmitter<string>();
  @Output() noteVote = new EventEmitter<string>();
  @Output() noteDrop = new EventEmitter<CdkDragDrop<StickyNote[]>>();

  @ViewChild('notesContainer') notesContainer!: ElementRef;

  isAddNoteModalVisible = false;
  isEditMode = false;
  editingNote: StickyNote | null = null;
  newNoteContent = '';
  selectedColor: StickyNoteColor = StickyNoteColor.YELLOW;
  
  colorOptions = Object.values(StickyNoteColor);

  constructor(private renderer: Renderer2) {}

  showAddNoteModal() {
    if (!this.canAddNotes()) {
      return;
    }
    
    this.isEditMode = false;
    this.editingNote = null;
    this.isAddNoteModalVisible = true;
    this.newNoteContent = '';
    this.selectedColor = StickyNoteColor.YELLOW;
    
    // Focus the textarea after modal opens
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }

  onNoteEdit(note: StickyNote) {
    this.isEditMode = true;
    this.editingNote = note;
    this.isAddNoteModalVisible = true;
    this.newNoteContent = note.content;
    this.selectedColor = note.color;
    
    // Focus the textarea after modal opens
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    }, 100);
  }

  addNote() {
    console.log('addNote called, content:', this.newNoteContent);
    console.log('Column ID:', this.column.id);
    console.log('Selected color:', this.selectedColor);
    if (this.newNoteContent.trim()) {
      console.log('Emitting noteAdd event');
      this.noteAdd.emit({
        columnId: this.column.id,
        content: this.newNoteContent.trim(),
        color: this.selectedColor
      });
      this.cancelAddNote();
    } else {
      console.log('Content is empty, not adding note');
    }
  }

  saveEditedNote() {
    if (this.editingNote && this.newNoteContent.trim()) {
      const updatedNote: StickyNote = {
        ...this.editingNote,
        content: this.newNoteContent.trim(),
        color: this.selectedColor,
        updatedAt: new Date().toISOString()
      };
      this.noteChange.emit(updatedNote);
      this.cancelAddNote();
    }
  }

  cancelAddNote() {
    this.isAddNoteModalVisible = false;
    this.isEditMode = false;
    this.editingNote = null;
    this.newNoteContent = '';
    this.selectedColor = StickyNoteColor.YELLOW;
  }

  onNoteChange(note: StickyNote) {
    this.noteChange.emit(note);
  }

  onNoteDelete(noteId: string) {
    this.noteDelete.emit(noteId);
  }

  onNoteVote(noteId: string) {
    this.noteVote.emit(noteId);
  }

  onNoteDrop(event: CdkDragDrop<StickyNote[]>) {
    // Always pass the event to parent - let it handle both same column and cross-column logic
    this.noteDrop.emit(event);
  }

  onDragStarted(event: CdkDragStart) {
    // Hide scrollbar during drag for cleaner visual
    if (this.notesContainer?.nativeElement) {
      this.renderer.setStyle(this.notesContainer.nativeElement, 'overflow', 'hidden');
    }
  }

  onDragEnded(event: CdkDragEnd) {
    // Restore scrollbar after drag completes
    if (this.notesContainer?.nativeElement) {
      this.renderer.setStyle(this.notesContainer.nativeElement, 'overflow-y', 'auto');
    }
  }

  trackByNoteId(index: number, note: StickyNote): string {
    return note.id;
  }

  getColorValue(color: StickyNoteColor): string {
    const colorMap = {
      [StickyNoteColor.YELLOW]: '#fef3c7',
      [StickyNoteColor.GREEN]: '#d1fae5',
      [StickyNoteColor.BLUE]: '#dbeafe',
      [StickyNoteColor.PINK]: '#fce7f3',
      [StickyNoteColor.PURPLE]: '#e7d5fa',
      [StickyNoteColor.ORANGE]: '#fed7aa'
    };
    return colorMap[color] || colorMap[StickyNoteColor.YELLOW];
  }

  canDragNotes(): boolean {
    // Notes can be dragged during brainstorming and grouping phases
    return this.currentPhase === RetroPhase.BRAINSTORMING || 
           this.currentPhase === RetroPhase.GROUPING;
  }

  canAddNotes(): boolean {
    // Notes can only be added during brainstorming phase
    return this.currentPhase === RetroPhase.BRAINSTORMING;
  }

  getAddNoteDisabledMessage(): string {
    if (this.currentPhase === RetroPhase.GROUPING) {
      return 'Notes cannot be added during grouping phase - only moved and grouped';
    } else if (this.currentPhase === RetroPhase.VOTING) {
      return 'Notes cannot be added during voting phase';
    } else if (this.currentPhase === RetroPhase.DISCUSSION) {
      return 'Notes cannot be added during discussion phase';
    } else if (this.currentPhase === RetroPhase.ACTION_ITEMS) {
      return 'Notes cannot be added during action items phase';
    } else if (this.currentPhase === RetroPhase.COMPLETED) {
      return 'Retrospective is completed - no changes allowed';
    }
    return 'Adding notes not allowed in current phase';
  }
}