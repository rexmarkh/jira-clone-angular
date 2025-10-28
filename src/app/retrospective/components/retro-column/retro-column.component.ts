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
import { NzSwitchModule } from 'ng-zorro-antd/switch';
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
    NzSwitchModule,
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
          <!-- AI Summary Note (if available) - Fixed at top -->
          <div 
            *ngIf="stickyNotes.length > 0"
            class="ai-summary-note"
            [class.expanded]="isAISummaryExpanded"
            [class.generating]="isGeneratingSummary"
          >
            <!-- Header -->
            <div class="ai-summary-header" (click)="toggleAISummary()">
              <div class="flex items-center gap-2">
                <span 
                  nz-icon 
                  [nzType]="isGeneratingSummary ? 'loading' : 'bulb'" 
                  nzTheme="filled"
                  class="ai-icon"
                ></span>
                <span class="ai-title">AI Summary</span>
                <span class="ai-badge">BETA</span>
              </div>
              <span 
                nz-icon 
                [nzType]="isAISummaryExpanded ? 'up' : 'down'" 
                nzTheme="outline"
                class="expand-icon"
              ></span>
            </div>
            
            <!-- Content -->
            <div 
              class="ai-summary-content" 
              [class.collapsed]="!isAISummaryExpanded"
            >
              <div *ngIf="isGeneratingSummary" class="ai-loading">
                <span nz-icon nzType="loading" nzTheme="outline"></span>
                <span class="ml-2">Analyzing {{ stickyNotes.length }} notes...</span>
              </div>
              <div *ngIf="!isGeneratingSummary && aiSummary" class="ai-result">
                <div class="ai-summary-text">{{ aiSummary }}</div>
                <button 
                  nz-button 
                  nzType="link" 
                  nzSize="small"
                  (click)="regenerateAISummary(); $event.stopPropagation()"
                  class="regenerate-btn"
                >
                  <span nz-icon nzType="reload" nzTheme="outline"></span>
                  <span class="ml-1">Regenerate</span>
                </button>
              </div>
              <div *ngIf="!isGeneratingSummary && !aiSummary" class="ai-empty">
                <p class="text-sm text-gray-500 mb-2">Get AI-powered insights from your notes</p>
                <button 
                  nz-button 
                  nzType="primary" 
                  nzSize="small"
                  (click)="generateAISummary(); $event.stopPropagation()"
                >
                  <span nz-icon nzType="thunderbolt" nzTheme="outline"></span>
                  <span class="ml-1">Generate Summary</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Scrollable Notes Container -->
          <div class="notes-wrapper">
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
        <div class="flex items-center gap-2">
          <!-- Count & Add Button -->
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
      [nzFooter]="noteModalFooter"
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
              <!--<label class="label">
                Note Content
              </label> -->
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
              <label class="label flex items-center justify-between">
                <span>Anonymous Note</span>
                <nz-switch 
                  [(ngModel)]="isAnonymous"
                  name="anonymous"
                  [nzCheckedChildren]="checkedTemplate"
                  [nzUnCheckedChildren]="unCheckedTemplate"
                ></nz-switch>
              </label>
              <div class="text-xs text-gray-500 mt-1">
                Your identity will be hidden for all phases
              </div>
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
          </form>
        </div>
      </ng-container>
      
      <ng-template #noteModalFooter>
        <div class="modal-footer-buttons">
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
      </ng-template>
    </nz-modal>

    <!-- Switch Templates -->
    <ng-template #checkedTemplate>
      <span nz-icon nzType="eye-invisible" nzTheme="outline"></span>
    </ng-template>
    <ng-template #unCheckedTemplate>
      <span nz-icon nzType="eye" nzTheme="outline"></span>
    </ng-template>
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
      display: flex;
      flex-direction: column;
    }

    /* AI Summary Note - Distinctive Design */
    .ai-summary-note {
      flex-shrink: 0;
      margin-bottom: 12px;
      border-radius: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      overflow: hidden;
      transition: all 0.3s ease;
      cursor: pointer;
      z-index: 10;
    }

    .ai-summary-note:hover {
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
    }

    .ai-summary-note.generating {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.85;
      }
    }

    .ai-summary-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      color: white;
      user-select: none;
    }

    .ai-icon {
      font-size: 20px;
      color: #ffd700;
    }

    .ai-title {
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
    }

    .ai-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 0;
      margin-left: 8px;
    }

    .expand-icon {
      font-size: 14px;
      transition: transform 0.3s ease;
    }

    .ai-summary-note.expanded .expand-icon {
      transform: rotate(180deg);
    }

    .ai-summary-content {
      background: white;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      max-height: 400px;
      opacity: 1;
      overflow: hidden;
      padding: 16px;
      transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
    }

    .ai-summary-content.collapsed {
      max-height: 0;
      opacity: 0;
      padding-top: 0;
      padding-bottom: 0;
      overflow: hidden;
    }

    .ai-summary-content:not(.collapsed) {
      overflow-y: auto;
    }

    .ai-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #667eea;
      font-size: 14px;
    }

    .ai-result {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ai-summary-text {
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .regenerate-btn {
      align-self: flex-start;
      padding: 4px 12px;
      height: auto;
      font-size: 13px;
      color: #667eea;
    }

    .regenerate-btn:hover {
      color: #764ba2;
    }

    .ai-empty {
      text-align: center;
      padding: 16px;
    }

    .ai-empty p {
      margin-bottom: 12px;
    }

    /* Notes Wrapper - Contains scrollable notes */
    .notes-wrapper {
      flex: 1;
      position: relative;
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

    // Modal footer buttons
    .modal-footer-buttons {
      text-align: right;
      padding: 16px 24px;
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
  
  @Output() noteAdd = new EventEmitter<{ columnId: string, content: string, color: StickyNoteColor, isAnonymous: boolean }>();
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
  isAnonymous = false;
  
  isAISummaryExpanded = false;
  isGeneratingSummary = false;
  aiSummary = '';
  
  colorOptions = Object.values(StickyNoteColor);

  constructor(private renderer: Renderer2) {}

  getRandomColor(): StickyNoteColor {
    const colors = Object.values(StickyNoteColor);
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  showAddNoteModal() {
    if (!this.canAddNotes()) {
      return;
    }
    
    this.isEditMode = false;
    this.editingNote = null;
    this.isAddNoteModalVisible = true;
    this.newNoteContent = '';
    this.selectedColor = this.getRandomColor();
    this.isAnonymous = false;
    
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
    console.log('Is anonymous:', this.isAnonymous);
    if (this.newNoteContent.trim()) {
      console.log('Emitting noteAdd event');
      this.noteAdd.emit({
        columnId: this.column.id,
        content: this.newNoteContent.trim(),
        color: this.selectedColor,
        isAnonymous: this.isAnonymous
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
    this.selectedColor = this.getRandomColor();
    this.isAnonymous = false;
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

  toggleAISummary() {
    if (!this.isAISummaryExpanded && !this.aiSummary && !this.isGeneratingSummary) {
      // Auto-generate on first expand if not already generated
      this.generateAISummary();
      // Don't toggle here since generateAISummary already sets isAISummaryExpanded = true
      return;
    }
    this.isAISummaryExpanded = !this.isAISummaryExpanded;
  }

  generateAISummary() {
    if (this.stickyNotes.length === 0 || this.isGeneratingSummary) {
      return;
    }

    this.isAISummaryExpanded = true;
    this.isGeneratingSummary = true;
    this.aiSummary = '';

    // Simulate AI processing (in real app, this would call an AI service)
    setTimeout(() => {
      const noteContents = this.stickyNotes.map(note => note.content);
      this.aiSummary = this.generateSummaryText(noteContents);
      this.isGeneratingSummary = false;
    }, 2000);
  }

  regenerateAISummary() {
    this.generateAISummary();
  }

  private generateSummaryText(notes: string[]): string {
    // This is a placeholder. In a real application, you would call an AI service
    const noteCount = notes.length;
    const totalWords = notes.join(' ').split(' ').length;
    const avgWordsPerNote = Math.round(totalWords / noteCount);

    // Group similar themes (simplified example)
    const themes: string[] = [];
    const commonWords = this.extractCommonWords(notes);
    
    if (commonWords.length > 0) {
      themes.push(`Main themes: ${commonWords.slice(0, 5).join(', ')}`);
    }

    const summary = `📊 Analysis of ${noteCount} note${noteCount !== 1 ? 's' : ''}:

${themes.length > 0 ? themes.join('\n') + '\n\n' : ''}Key Insights:
• Total contributions: ${noteCount} notes
• Average note length: ${avgWordsPerNote} words
• Most voted: ${this.getMostVotedNote()?.content || 'No votes yet'}

Summary: The team has shared ${noteCount} observation${noteCount !== 1 ? 's' : ''} in the "${this.column.title}" category. ${this.getPhaseSpecificInsight()}`;

    return summary;
  }

  private extractCommonWords(notes: string[]): string[] {
    const words = notes
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4); // Filter out short words

    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  }

  private getMostVotedNote(): StickyNote | undefined {
    return this.stickyNotes.length > 0
      ? this.stickyNotes.reduce((max, note) => note.votes > max.votes ? note : max)
      : undefined;
  }

  private getPhaseSpecificInsight(): string {
    switch (this.currentPhase) {
      case RetroPhase.BRAINSTORMING:
        return 'The team is actively brainstorming ideas.';
      case RetroPhase.GROUPING:
        return 'These items can be grouped to identify patterns.';
      case RetroPhase.VOTING:
        return 'Team members are voting on priorities.';
      case RetroPhase.DISCUSSION:
        return 'These topics are ready for team discussion.';
      case RetroPhase.ACTION_ITEMS:
        return 'Consider converting high-priority items into action items.';
      default:
        return 'Review complete.';
    }
  }
}