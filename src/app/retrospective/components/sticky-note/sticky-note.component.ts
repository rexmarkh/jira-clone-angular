import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StickyNote, StickyNoteColor, RetroPhase } from '../../interfaces/retrospective.interface';
import { JiraControlModule } from '../../../jira-control/jira-control.module';

@Component({
  selector: 'app-sticky-note',
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
    NzPopoverModule,
    NzTagModule,
    NzToolTipModule,
    DragDropModule,
    JiraControlModule
  ],
  template: `
    <div 
      class="sticky-note" 
      [style.background-color]="getBackgroundColor()"
      [style.border-left]="'4px solid ' + getBorderColor()"
      [class.opacity-75]="!canEdit() && !canDelete()"
      [class.cdk-drag-disabled]="!canDrag()"
    >
      <nz-card 
        [nzBordered]="false"
        [nzBodyStyle]="{ padding: '16px', backgroundColor: 'transparent' }"
        class="h-full"
      >
        <!-- Action Buttons - Top Right -->
        <div class="absolute top-3 right-3 flex items-center gap-1 action-buttons">
          <!-- Color Picker -->
          <nz-popover 
            *ngIf="canEdit()"
            nzTitle="Change Color" 
            nzTrigger="click"
          >
            <button 
              nz-button 
              nzType="text" 
              nzSize="small"
              nz-popover
              nz-tooltip
              nzTooltipTitle="Change color"
              class="action-button"
            >
              <span nz-icon nzType="bg-colors" nzTheme="outline"></span>
            </button>
            <ng-template #nzPopoverContent>
              <div class="grid grid-cols-3 gap-2 p-2">
                <div 
                  *ngFor="let color of colorOptions"
                  class="w-7 h-7 rounded cursor-pointer border-2 hover:scale-110 transition-transform"
                  [style.background-color]="getColorValue(color)"
                  [class.border-gray-800]="note.color === color"
                  [class.border-gray-300]="note.color !== color"
                  (click)="changeColor(color)"
                ></div>
              </div>
            </ng-template>
          </nz-popover>

          <!-- Edit Icon -->
          <button 
            *ngIf="canEdit()"
            nz-button 
            nzType="text" 
            nzSize="small"
            (click)="startEditing()"
            nz-tooltip
            nzTooltipTitle="Edit note"
            nzTooltipPlacement="bottom"
            class="action-button"
          >
            <span nz-icon nzType="edit" nzTheme="outline"></span>
          </button>

          <!-- Delete Icon -->
          <button 
            *ngIf="canDelete()"
            nz-button 
            nzType="text" 
            nzSize="small"
            (click)="confirmDelete()"
            nz-tooltip
            nzTooltipTitle="Delete note"
            nzTooltipPlacement="bottom"
            class="action-button action-button-delete"
          >
            <span nz-icon nzType="delete" nzTheme="outline"></span>
          </button>
        </div>

        <!-- Note Content - Takes most space -->
        <div class="note-content-wrapper">
          <div 
            *ngIf="!isEditing" 
            class="note-content"
          >
            {{ note.content }}
          </div>
          
          <textarea
            *ngIf="isEditing"
            [(ngModel)]="editContent"
            name="editNoteContent"
            class="edit-textarea"
            cdkTextareaAutosize
            #cdkTextareaAutosize="cdkTextareaAutosize"
            [cdkAutosizeMinRows]="3"
            [cdkAutosizeMaxRows]="8"
            (blur)="saveEdit()"
            (keydown.enter)="$event.ctrlKey && saveEdit()"
            (keydown.escape)="cancelEdit()"
            placeholder="Enter your note..."
            #editInput
          ></textarea>
        </div>

        <!-- Note Footer - User info and actions -->
        <div class="note-footer">
          <!-- Left: User info (only shown from discussion phase onwards) -->
          <div class="flex items-center gap-2">
            <ng-container *ngIf="shouldShowAuthor()">
              <j-avatar 
                [avatarUrl]="note.authorAvatar" 
                [name]="getInitials(note.authorName)"
                [size]="24"
                className="avatar-small"
              ></j-avatar>
              <span class="text-xs text-gray-600 font-medium">{{ note.authorName }}</span>
            </ng-container>
            <ng-container *ngIf="!shouldShowAuthor()">
              <div class="flex items-center gap-2">
                <div class="anonymous-avatar">
                  <span nz-icon nzType="user" nzTheme="outline"></span>
                </div>
                <span class="text-xs text-gray-500 italic">Anonymous</span>
              </div>
            </ng-container>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-3">
            <!-- Vote Button -->
            <button 
              nz-button 
              nzType="text" 
              nzSize="small"
              [class]="hasUserVoted() ? 'vote-button-active' : 'vote-button'"
              (click)="onVote()"
              class="flex items-center gap-1.5"
            >
              <span 
                nz-icon 
                nzType="like" 
                [nzTheme]="hasUserVoted() ? 'fill' : 'outline'"
                class="vote-icon"
              ></span>
              <span class="text-xs font-medium">{{ note.votes }}</span>
            </button>

            <!-- Timestamp -->
            <span class="text-xs text-gray-400">
              {{ getTimeAgo() }}
            </span>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .sticky-note {
      width: 100%;
      min-height: 140px;
      border-radius: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
      cursor: default;
      position: relative;
      margin-bottom: 12px;
    }

    .sticky-note:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .sticky-note:hover .action-buttons {
      opacity: 1;
    }

    .sticky-note.cdk-drag-preview {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      transform: rotate(2deg) scale(1.03);
      z-index: 1000;
      opacity: 0.95;
      border: 2px solid rgba(59, 130, 246, 0.5);
    }

    .sticky-note.cdk-drag-disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      background: rgba(249, 250, 251, 0.9);
      border: 2px dashed #cbd5e1;
      min-height: 140px;
      border-radius: 0;
      margin-bottom: 12px;
    }

    .cdk-drag-animating {
      transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
    }

    /* Action Buttons */
    .action-buttons {
      opacity: 0;
      transition: opacity 0.2s ease;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 6px;
      padding: 2px;
      backdrop-filter: blur(4px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .action-button {
      width: 30px;
      height: 30px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: all 0.2s ease;
      border-radius: 4px;
    }

    .action-button:hover {
      opacity: 1;
      background-color: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .action-button-delete:hover {
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Content Area */
    .note-content-wrapper {
      min-height: 60px;
      margin-bottom: 12px;
      padding-top: 8px;
    }

    .note-content {
      font-size: 15px;
      line-height: 1.6;
      color: #1f2937;
      word-wrap: break-word;
      white-space: pre-wrap;
      padding: 4px 0;
    }

    .edit-textarea {
      width: 100%;
      padding: 10px;
      border: 2px solid #3b82f6;
      border-radius: 6px;
      font-size: 15px;
      line-height: 1.6;
      resize: none;
      background: rgba(255, 255, 255, 0.9);
      transition: all 0.2s ease;
    }

    .edit-textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Footer */
    .note-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      margin-top: auto;
    }

    .vote-button {
      color: #6b7280;
      transition: all 0.2s ease;
      padding: 6px 10px;
      border-radius: 6px;
      min-width: 48px;
    }

    .vote-button:hover {
      color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.08);
    }

    .vote-button-active {
      color: #3b82f6;
      transition: all 0.2s ease;
      padding: 6px 10px;
      border-radius: 6px;
      background-color: rgba(59, 130, 246, 0.12);
      min-width: 48px;
    }

    .vote-button-active:hover {
      background-color: rgba(59, 130, 246, 0.18);
    }

    .vote-icon {
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    ::ng-deep .ant-card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    ::ng-deep .ant-btn-sm {
      font-size: 14px;
    }

    /* Avatar sizing */
    ::ng-deep .avatar-small {
      flex-shrink: 0;
    }

    /* Anonymous Avatar */
    .anonymous-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 12px;
      flex-shrink: 0;
    }

    /* Ensure vote icon is visible */
    ::ng-deep .vote-button .anticon-like,
    ::ng-deep .vote-button-active .anticon-like {
      font-size: 16px !important;
      vertical-align: middle;
    }
  `]
})
export class StickyNoteComponent implements OnInit, OnDestroy {
  @Input() note!: StickyNote;
  @Input() currentUserId: string = '';
  @Input() currentPhase: RetroPhase = RetroPhase.BRAINSTORMING;
  @Output() noteChange = new EventEmitter<StickyNote>();
  @Output() noteDelete = new EventEmitter<string>();
  @Output() noteVote = new EventEmitter<string>();

  isEditing = false;
  editContent = '';

  colorOptions = Object.values(StickyNoteColor);

  ngOnInit() {
    this.editContent = this.note.content;
  }

  ngOnDestroy() {
    // Clean up any subscriptions if needed
  }

  getBackgroundColor(): string {
    return this.getColorValue(this.note.color);
  }

  getBorderColor(): string {
    const colorMap = {
      [StickyNoteColor.YELLOW]: '#f59e0b',
      [StickyNoteColor.GREEN]: '#10b981',
      [StickyNoteColor.BLUE]: '#3b82f6',
      [StickyNoteColor.PINK]: '#ec4899',
      [StickyNoteColor.PURPLE]: '#8b5cf6',
      [StickyNoteColor.ORANGE]: '#f97316'
    };
    return colorMap[this.note.color] || colorMap[StickyNoteColor.YELLOW];
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  hasUserVoted(): boolean {
    return this.note.voterIds.includes(this.currentUserId);
  }

  getTimeAgo(): string {
    const now = new Date();
    const created = new Date(this.note.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  // Permission methods
  canEdit(): boolean {
    // Edit is only allowed during brainstorming phase and for the note author or facilitator
    return this.currentPhase === RetroPhase.BRAINSTORMING && 
           (this.note.authorId === this.currentUserId);
  }

  canDelete(): boolean {
    // Delete is allowed during brainstorming phase for the note author
    return this.currentPhase === RetroPhase.BRAINSTORMING && 
           this.note.authorId === this.currentUserId;
  }

  canChangeColor(): boolean {
    // Color change is only allowed during brainstorming phase
    return this.currentPhase === RetroPhase.BRAINSTORMING && 
           this.note.authorId === this.currentUserId;
  }

  canDrag(): boolean {
    // Dragging is allowed during brainstorming and grouping phases
    return this.currentPhase === RetroPhase.BRAINSTORMING || 
           this.currentPhase === RetroPhase.GROUPING;
  }

  shouldShowAuthor(): boolean {
    // Author is revealed from discussion phase onwards for privacy
    return this.currentPhase === RetroPhase.DISCUSSION || 
           this.currentPhase === RetroPhase.ACTION_ITEMS ||
           this.currentPhase === RetroPhase.COMPLETED;
  }

  getDragDisabledMessage(): string {
    if (this.currentPhase === RetroPhase.VOTING) {
      return 'Notes cannot be moved during voting phase';
    } else if (this.currentPhase === RetroPhase.DISCUSSION) {
      return 'Notes cannot be moved during discussion phase';
    } else if (this.currentPhase === RetroPhase.ACTION_ITEMS) {
      return 'Notes cannot be moved during action items phase';
    } else if (this.currentPhase === RetroPhase.COMPLETED) {
      return 'Retrospective is completed - no changes allowed';
    }
    return 'Dragging not allowed in current phase';
  }

  startEditing() {
    if (!this.canEdit()) {
      return;
    }
    
    this.isEditing = true;
    this.editContent = this.note.content;
    
    // Focus the textarea after a brief delay to ensure it's rendered
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    }, 100);
  }

  saveEdit() {
    if (this.editContent.trim() && this.editContent !== this.note.content) {
      const updatedNote = {
        ...this.note,
        content: this.editContent.trim(),
        updatedAt: new Date().toISOString()
      };
      this.noteChange.emit(updatedNote);
    }
    this.isEditing = false;
  }

  cancelEdit() {
    this.editContent = this.note.content; // Reset to original content
    this.isEditing = false;
  }

  changeColor(color: StickyNoteColor) {
    if (!this.canChangeColor()) {
      return;
    }
    
    if (color !== this.note.color) {
      const updatedNote = {
        ...this.note,
        color,
        updatedAt: new Date().toISOString()
      };
      this.noteChange.emit(updatedNote);
    }
  }

  onVote() {
    this.noteVote.emit(this.note.id);
  }

  confirmDelete() {
    if (!this.canDelete()) {
      return;
    }
    
    // Show confirmation dialog with more context
    const confirmMessage = `Are you sure you want to delete this note?\n\n"${this.note.content}"\n\nThis action cannot be undone.`;
    if (confirm(confirmMessage)) {
      this.noteDelete.emit(this.note.id);
    }
  }
}