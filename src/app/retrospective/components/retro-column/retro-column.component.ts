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
  templateUrl: './retro-column.component.html',
  styleUrls: ['./retro-column.component.scss']
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