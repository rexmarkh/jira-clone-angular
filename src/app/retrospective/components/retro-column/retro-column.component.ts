import { Component, Input, Output, EventEmitter } from '@angular/core';
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
import { CdkDropList, CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
              cdkDrag
              [cdkDragData]="note"
              [cdkDragDisabled]="!canDragNotes()"
              class="note-item"
            ></app-sticky-note>
          </div>

          <!-- FAB Add Note Button -->
          <div class="fab-container">
            <button 
              nz-button 
              nzType="primary" 
              nzShape="circle"
              nzSize="default"
              (click)="showAddNoteModal()"
              [disabled]="!canAddNotes()"
              nz-tooltip
              [nzTooltipTitle]="canAddNotes() ? 'Add a note' : getAddNoteDisabledMessage()"
              nzTooltipPlacement="top"
              class="fab-button"
              [class.fab-disabled]="!canAddNotes()"
            >
              <span nz-icon nzType="plus" nzTheme="outline"></span>
            </button>
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
          <div 
            class="w-4 h-4 rounded-full"
            [style.background-color]="column.color"
          ></div>
          <div>
            <h3 class="text-lg font-semibold mb-0">{{ column.title }}</h3>
            <p class="text-sm text-gray-500 mb-0">{{ column.description }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {{ stickyNotes.length }}
          </span>
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

    <!-- Add Note Modal -->
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
              Add New Note
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
                        (click)="addNote()">
                Add Note
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
      padding: 0 4px 70px 4px; /* No top padding, extra bottom padding for FAB */
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

    .fab-container {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 10;
    }

    .fab-button {
      width: 40px;
      height: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
      border: none !important;
    }

    .fab-button:hover:not(.fab-disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .fab-button.fab-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #f5f5f5 !important;
      color: #bfbfbf !important;
    }

    .fab-button.fab-disabled:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .empty-state-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 60px; /* Leave space for FAB */
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
    }

    .cdk-drop-list {
      min-height: 100%;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .cdk-drop-list.cdk-drop-list-receiving {
      background-color: rgba(59, 130, 246, 0.02);
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
      transform: rotate(2deg) scale(1.02);
      opacity: 0.95;
      z-index: 1000;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      background: #f9fafb;
      border: 1px dashed #e5e7eb;
      border-radius: 8px;
      min-height: 120px;
      margin: 0 0 12px 0;
      transition: all 100ms ease;
    }

    .cdk-drag-animating {
      transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
    }

    .note-item {
      transition: transform 0.2s ease;
    }

    .note-item:hover {
      transform: translateY(-1px);
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

  isAddNoteModalVisible = false;
  newNoteContent = '';
  selectedColor: StickyNoteColor = StickyNoteColor.YELLOW;
  
  colorOptions = Object.values(StickyNoteColor);

  showAddNoteModal() {
    if (!this.canAddNotes()) {
      return;
    }
    
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

  cancelAddNote() {
    this.isAddNoteModalVisible = false;
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