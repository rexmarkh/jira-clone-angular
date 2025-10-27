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
          <div class="note-content">
            {{ note.content }}
          </div>
        </div>

        <!-- Single Row Footer - Tags + Metadata -->
        <div class="note-footer">
          <!-- Left: Tags (if present) -->
          <div class="footer-left">
            <div *ngIf="note.tags && note.tags.length > 0" class="note-tags-inline">
              <span 
                *ngFor="let tag of note.tags" 
                class="note-tag"
                [style.background-color]="getTagBackgroundColor(tag)"
                [style.color]="getTagTextColor(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Right: User + Vote -->
          <div class="footer-right">
            <!-- User Avatar with tooltip -->
            <ng-container *ngIf="shouldShowAuthor()">
              <j-avatar 
                [avatarUrl]="note.authorAvatar" 
                [name]="getInitials(note.authorName)"
                [size]="18"
                className="avatar-small"
                nz-tooltip
                [nzTooltipTitle]="note.authorName"
                nzTooltipPlacement="top"
              ></j-avatar>
            </ng-container>
            <ng-container *ngIf="!shouldShowAuthor()">
              <div 
                class="anonymous-avatar"
                nz-tooltip
                nzTooltipTitle="Anonymous"
                nzTooltipPlacement="top"
              >
                <span nz-icon nzType="user" nzTheme="outline"></span>
              </div>
            </ng-container>

            <!-- Vote Button -->
            <button 
              nz-button 
              nzType="text" 
              nzSize="small"
              [class]="hasUserVoted() ? 'vote-button-active' : 'vote-button'"
              (click)="onVote()"
              class="flex items-center gap-1"
            >
              <span 
                nz-icon 
                nzType="like" 
                [nzTheme]="hasUserVoted() ? 'fill' : 'outline'"
                class="vote-icon"
              ></span>
              <span class="text-xs font-semibold">{{ note.votes }}</span>
            </button>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .sticky-note {
      width: 100%;
      min-height: 100px;
      border-radius: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
      cursor: grab;
      position: relative;
      margin-bottom: 12px;
      touch-action: manipulation;
    }

    .sticky-note:hover:not(.cdk-drag-dragging) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .sticky-note:hover .action-buttons {
      opacity: 1;
    }

    .sticky-note.cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 0;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
      cursor: grabbing !important;
    }

    .sticky-note.cdk-drag-disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      background: rgba(249, 250, 251, 0.9);
      border: 2px dashed #cbd5e1;
      min-height: 100px;
      border-radius: 0;
      margin-bottom: 12px;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
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
      margin-bottom: 6px;
      padding-top: 8px;
      flex: 1;
    }

    .note-content {
      font-size: 15px;
      line-height: 1.6;
      color: #1f2937;
      word-wrap: break-word;
      white-space: pre-wrap;
      padding: 4px 0;
    }

    /* Single Row Footer - Everything inline */
    .note-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      margin-top: auto;
      min-height: 28px;
    }

    .footer-left {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* Tags inline in footer */
    .note-tags-inline {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .note-tag {
      font-size: 9px;
      padding: 2px 5px;
      border-radius: 3px;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      display: inline-block;
      line-height: 1.2;
      white-space: nowrap;
    }

    .vote-button {
      color: #6b7280;
      transition: all 0.2s ease;
      padding: 3px 6px;
      border-radius: 4px;
      min-width: 36px;
      height: 22px;
    }

    .vote-button:hover {
      color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.08);
    }

    .vote-button-active {
      color: #3b82f6;
      transition: all 0.2s ease;
      padding: 3px 6px;
      border-radius: 4px;
      background-color: rgba(59, 130, 246, 0.12);
      min-width: 36px;
      height: 22px;
    }

    .vote-button-active:hover {
      background-color: rgba(59, 130, 246, 0.18);
    }

    .vote-icon {
      font-size: 13px;
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
      cursor: pointer;
    }

    /* Anonymous Avatar - Super compact with tooltip */
    .anonymous-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      font-size: 10px;
      flex-shrink: 0;
      cursor: pointer;
    }

    /* Ensure vote icon is visible */
    ::ng-deep .vote-button .anticon-like,
    ::ng-deep .vote-button-active .anticon-like {
      font-size: 13px !important;
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
  @Output() noteEdit = new EventEmitter<StickyNote>();

  colorOptions = Object.values(StickyNoteColor);

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    // Clean up any subscriptions if needed
  }

  getBackgroundColor(): string {
    return this.getColorValue(this.note.color);
  }

  getBorderColor(): string {
    const colorMap = {
      [StickyNoteColor.YELLOW]: '#fbbf24',
      [StickyNoteColor.GREEN]: '#34d399',
      [StickyNoteColor.BLUE]: '#60a5fa',
      [StickyNoteColor.PINK]: '#f472b6',
      [StickyNoteColor.PURPLE]: '#a78bfa',
      [StickyNoteColor.ORANGE]: '#fb923c'
    };
    return colorMap[this.note.color] || colorMap[StickyNoteColor.YELLOW];
  }

  getColorValue(color: StickyNoteColor): string {
    const colorMap = {
      [StickyNoteColor.YELLOW]: '#fef9c3',
      [StickyNoteColor.GREEN]: '#d1fae5',
      [StickyNoteColor.BLUE]: '#e0f2fe',
      [StickyNoteColor.PINK]: '#fce7f3',
      [StickyNoteColor.PURPLE]: '#ede9fe',
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
    
    // Emit event to parent to open edit modal
    this.noteEdit.emit(this.note);
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

  getTagColor(tag: string): string {
    const tagColors: { [key: string]: string } = {
      'Communication': 'blue',
      'Process': 'cyan',
      'Technical': 'purple',
      'Team': 'green',
      'Documentation': 'geekblue',
      'Time': 'orange',
      'Quality': 'lime',
      'Planning': 'magenta',
      'Tools': 'volcano',
      'Blocker': 'red',
      'General': 'default'
    };
    
    return tagColors[tag] || 'default';
  }

  getTagBackgroundColor(tag: string): string {
    const bgColors: { [key: string]: string } = {
      'Communication': '#e0f2fe',
      'Process': '#cffafe',
      'Technical': '#ede9fe',
      'Team': '#dcfce7',
      'Documentation': '#dbeafe',
      'Time': '#fed7aa',
      'Quality': '#ecfccb',
      'Planning': '#fce7f3',
      'Tools': '#fee2e2',
      'Blocker': '#fecaca',
      'General': '#f3f4f6'
    };
    
    return bgColors[tag] || '#f3f4f6';
  }

  getTagTextColor(tag: string): string {
    const textColors: { [key: string]: string } = {
      'Communication': '#0369a1',
      'Process': '#0891b2',
      'Technical': '#7c3aed',
      'Team': '#15803d',
      'Documentation': '#1e40af',
      'Time': '#c2410c',
      'Quality': '#4d7c0f',
      'Planning': '#be185d',
      'Tools': '#b91c1c',
      'Blocker': '#dc2626',
      'General': '#6b7280'
    };
    
    return textColors[tag] || '#6b7280';
  }
}