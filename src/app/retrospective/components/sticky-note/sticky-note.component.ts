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
  templateUrl: './sticky-note.component.html',
  styleUrls: ['./sticky-note.component.scss']
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