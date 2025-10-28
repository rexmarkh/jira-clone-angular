import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';

import { RetrospectiveService } from '../../state/retrospective.service';
import { RetrospectiveQuery } from '../../state/retrospective.query';
import { AuthQuery } from '../../../project/auth/auth.query';
import { RetrospectiveBoard, RetroPhase } from '../../interfaces/retrospective.interface';
import { JiraControlModule } from '../../../jira-control/jira-control.module';

@Component({
  selector: 'app-retrospective-landing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextFieldModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzEmptyModule,
    NzTagModule,
    NzDividerModule,
    NzGridModule,
    JiraControlModule
  ],
  templateUrl: './retrospective-landing-page.component.html',
  styleUrls: ['./retrospective-landing-page.component.scss']
})
export class RetrospectiveLandingPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  boards: RetrospectiveBoard[] = [];
  isCreateModalVisible = false;
  newBoardTitle = '';
  newBoardDescription = '';
  favoriteBoards: Set<string> = new Set();

  constructor(
    private router: Router,
    private retrospectiveService: RetrospectiveService,
    private retrospectiveQuery: RetrospectiveQuery,
    private authQuery: AuthQuery
  ) {}

  ngOnInit() {
    // Subscribe to boards
    this.retrospectiveQuery.boards$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boards => {
        this.boards = boards;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Board Management
  showCreateBoardModal() {
    this.isCreateModalVisible = true;
    this.newBoardTitle = '';
    this.newBoardDescription = '';
    
    // Focus the title input after modal opens
    setTimeout(() => {
      const input = document.querySelector('input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  createBoard() {
    console.log('createBoard called, title:', this.newBoardTitle);
    console.log('User from auth:', this.authQuery.getValue());
    if (this.newBoardTitle.trim()) {
      console.log('Creating board with title:', this.newBoardTitle.trim());
      try {
        const board = this.retrospectiveService.createBoard(
          this.newBoardTitle.trim(),
          this.newBoardDescription.trim()
        );
        console.log('Board created:', board);
        this.cancelCreateBoard();
        this.openBoard(board.id);
      } catch (error) {
        console.error('Error creating board:', error);
      }
    } else {
      console.log('Title is empty, not creating board');
    }
  }

  cancelCreateBoard() {
    this.isCreateModalVisible = false;
    this.newBoardTitle = '';
    this.newBoardDescription = '';
  }

  openBoard(boardId: string) {
    this.router.navigate(['/project/retrospective/board', boardId]);
  }

  editBoard(board: RetrospectiveBoard) {
    // Implement edit functionality
    console.log('Edit board:', board);
  }

  deleteBoard(boardId: string) {
    if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      // Implement delete functionality
      console.log('Delete board:', boardId);
    }
  }

  joinBoardDemo() {
    this.router.navigate(['/project/retrospective/board', 'demo']);
  }

  // Utility Methods
  trackByBoardId(index: number, board: RetrospectiveBoard): string {
    return board.id;
  }

  getActiveBoards(): RetrospectiveBoard[] {
    return this.boards.filter(board => board.isActive);
  }

  getTotalParticipants(): number {
    const allParticipants = new Set<string>();
    this.boards.forEach(board => {
      board.participants.forEach(participant => allParticipants.add(participant));
    });
    return allParticipants.size;
  }

  getThisWeekBoards(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return this.boards.filter(board => 
      new Date(board.createdAt) >= weekAgo
    ).length;
  }

  getStickyNotesCount(boardId: string): number {
    const board = this.boards.find(b => b.id === boardId);
    return board ? board.stickyNotes.length : 0;
  }

  getPhaseColor(phase: RetroPhase): string {
    const colors = {
      [RetroPhase.BRAINSTORMING]: 'blue',
      [RetroPhase.GROUPING]: 'cyan',
      [RetroPhase.VOTING]: 'purple',
      [RetroPhase.DISCUSSION]: 'orange',
      [RetroPhase.ACTION_ITEMS]: 'green',
      [RetroPhase.COMPLETED]: 'default'
    };
    return colors[phase] || 'default';
  }

  getPhaseLabel(phase: RetroPhase): string {
    const labels = {
      [RetroPhase.BRAINSTORMING]: 'Brainstorming',
      [RetroPhase.GROUPING]: 'Grouping',
      [RetroPhase.VOTING]: 'Voting',
      [RetroPhase.DISCUSSION]: 'Discussion',
      [RetroPhase.ACTION_ITEMS]: 'Action Items',
      [RetroPhase.COMPLETED]: 'Completed'
    };
    return labels[phase] || 'Unknown';
  }

  getParticipantInitials(participantId: string): string {
    // In a real app, you would look up participant details
    return participantId.slice(0, 2).toUpperCase();
  }

  getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks}w ago`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Favorites
  toggleBoardFavorite(boardId: string) {
    if (this.favoriteBoards.has(boardId)) {
      this.favoriteBoards.delete(boardId);
    } else {
      this.favoriteBoards.add(boardId);
    }
  }

  isBoardFavorite(boardId: string): boolean {
    return this.favoriteBoards.has(boardId);
  }
}
