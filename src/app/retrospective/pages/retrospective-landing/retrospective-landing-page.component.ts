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
  template: `
    <div class="retrospective-landing p-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Retrospective Boards</h1>
            <p class="text-lg text-gray-600">Reflect, learn, and improve together as a team</p>
          </div>
          
          <div class="flex items-center gap-3">
            <button 
              nz-button 
              nzType="default"
              nzSize="large"
              (click)="joinBoardDemo()"
              class="flex items-center gap-2"
            >
              <span nz-icon nzType="play-circle" nzTheme="outline"></span>
              Try Demo
            </button>
            
            <button 
              nz-button 
              nzType="primary"
              nzSize="large"
              (click)="showCreateBoardModal()"
              class="flex items-center gap-2"
            >
              <span nz-icon nzType="plus" nzTheme="outline"></span>
              Create Board
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="mb-8">
        <nz-row [nzGutter]="[16, 16]">
          <nz-col [nzSpan]="6">
            <nz-card nzSize="small" class="stat-card">
              <div class="flex items-center gap-3">
                <div class="stat-icon bg-blue-100 text-blue-600">
                  <span nz-icon nzType="project" nzTheme="outline"></span>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900">{{ boards.length }}</div>
                  <div class="text-sm text-gray-500">Total Boards</div>
                </div>
              </div>
            </nz-card>
          </nz-col>
          
          <nz-col [nzSpan]="6">
            <nz-card nzSize="small" class="stat-card">
              <div class="flex items-center gap-3">
                <div class="stat-icon bg-green-100 text-green-600">
                  <span nz-icon nzType="check-circle" nzTheme="outline"></span>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900">{{ getActiveBoards().length }}</div>
                  <div class="text-sm text-gray-500">Active Boards</div>
                </div>
              </div>
            </nz-card>
          </nz-col>
          
          <nz-col [nzSpan]="6">
            <nz-card nzSize="small" class="stat-card">
              <div class="flex items-center gap-3">
                <div class="stat-icon bg-purple-100 text-purple-600">
                  <span nz-icon nzType="team" nzTheme="outline"></span>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900">{{ getTotalParticipants() }}</div>
                  <div class="text-sm text-gray-500">Participants</div>
                </div>
              </div>
            </nz-card>
          </nz-col>
          
          <nz-col [nzSpan]="6">
            <nz-card nzSize="small" class="stat-card">
              <div class="flex items-center gap-3">
                <div class="stat-icon bg-orange-100 text-orange-600">
                  <span nz-icon nzType="calendar" nzTheme="outline"></span>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900">{{ getThisWeekBoards() }}</div>
                  <div class="text-sm text-gray-500">This Week</div>
                </div>
              </div>
            </nz-card>
          </nz-col>
        </nz-row>
      </div>

      <!-- Boards Grid -->
      <div class="boards-section">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Your Boards</h2>
          <div class="flex items-center gap-3">
            <!-- Add search and filter options here if needed -->
          </div>
        </div>

        <!-- Boards List -->
        <div *ngIf="boards.length > 0" class="boards-grid">
          <nz-card 
            *ngFor="let board of boards; trackBy: trackByBoardId"
            [nzActions]="[boardActionsTemplate]"
            [nzExtra]="boardExtraTemplate"
            class="board-card hover:shadow-lg transition-shadow cursor-pointer"
            (click)="openBoard(board.id)"
          >
            <nz-card-meta
              [nzTitle]="board.title"
              [nzDescription]="board.description"
            ></nz-card-meta>
            
            <div class="mt-4 space-y-3">
              <!-- Phase and Status -->
              <div class="flex items-center justify-between">
                <nz-tag [nzColor]="getPhaseColor(board.currentPhase)">
                  {{ getPhaseLabel(board.currentPhase) }}
                </nz-tag>
                <span class="text-xs text-gray-500">
                  {{ getTimeAgo(board.updatedAt) }}
                </span>
              </div>

              <!-- Participants -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">Team:</span>
                  <div class="flex items-center -space-x-2">
                    <j-avatar 
                      *ngFor="let participantId of board.participants.slice(0, 3)"
                      [name]="getParticipantInitials(participantId)"
                      [size]="20"
                      className="border-2 border-white rounded-full"
                    ></j-avatar>
                    <span *ngIf="board.participants.length > 3" 
                          class="text-xs text-gray-500 ml-2">
                      +{{ board.participants.length - 3 }}
                    </span>
                  </div>
                </div>
                <div class="text-xs text-gray-500">
                  {{ board.participants.length }} member{{ board.participants.length !== 1 ? 's' : '' }}
                </div>
              </div>

              <!-- Notes Count -->
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>{{ getStickyNotesCount(board.id) }} notes</span>
                <span>Created {{ formatDate(board.createdAt) }}</span>
              </div>
            </div>

            <ng-template #boardExtraTemplate>
              <button 
                nz-button 
                nzType="text" 
                nzSize="small"
                (click)="$event.stopPropagation(); toggleBoardFavorite(board.id)"
                class="text-gray-400 hover:text-yellow-500"
              >
                <span nz-icon nzType="star" [nzTheme]="isBoardFavorite(board.id) ? 'fill' : 'outline'"></span>
              </button>
            </ng-template>

            <ng-template #boardActionsTemplate>
              <span 
                nz-icon 
                nzType="eye" 
                nzTheme="outline"
                (click)="$event.stopPropagation(); openBoard(board.id)"
                class="action-icon"
              ></span>
              <span 
                nz-icon 
                nzType="edit" 
                nzTheme="outline"
                (click)="$event.stopPropagation(); editBoard(board)"
                class="action-icon"
              ></span>
              <span 
                nz-icon 
                nzType="delete" 
                nzTheme="outline"
                (click)="$event.stopPropagation(); deleteBoard(board.id)"
                class="action-icon text-red-500 hover:text-red-600"
              ></span>
            </ng-template>
          </nz-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="boards.length === 0" class="empty-state">
          <nz-empty 
            [nzNotFoundContent]="emptyTemplate"
            nzNotFoundImage="simple"
          ></nz-empty>
        </div>
      </div>
    </div>

    <!-- Empty State Template -->
    <ng-template #emptyTemplate>
      <div class="text-center py-12">
        <div class="mb-4">
          <span nz-icon nzType="project" nzTheme="outline" class="text-6xl text-gray-300"></span>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No retrospective boards yet</h3>
        <p class="text-gray-500 mb-6">Create your first board to start running retrospectives with your team</p>
        <button 
          nz-button 
          nzType="primary" 
          nzSize="large"
          (click)="showCreateBoardModal()"
          class="flex items-center gap-2 mx-auto"
        >
          <span nz-icon nzType="plus" nzTheme="outline"></span>
          Create Your First Board
        </button>
      </div>
    </ng-template>

    <!-- Create Board Modal -->
    <nz-modal
      [(nzVisible)]="isCreateModalVisible"
      nzClosable="false"
      nzFooter="null"
      nzWidth="700px"
    >
      <ng-container *nzModalContent>
        <div class="px-8 py-5">
          <div class="flex items-center py-3 text-textDarkest">
            <div class="text-xl">
              Create New Retrospective Board
            </div>
            <div class="flex-auto"></div>
            <j-button icon="times"
                      [iconSize]="24"
                      (click)="cancelCreateBoard()"
                      [className]="'btn-empty'">
            </j-button>
          </div>
          <form class="board-form retro-modal-form">
            <div class="form-group">
              <label class="label">
                Board Title *
              </label>
              <input
                [(ngModel)]="newBoardTitle"
                class="form-input"
                placeholder="e.g., Sprint 23 Retrospective"
                #titleInput
              />
            </div>
            
            <div class="mt-3 form-group">
              <label class="label">
                Description
              </label>
              <textarea
                [(ngModel)]="newBoardDescription"
                class="form-input"
                cdkTextareaAutosize
                #cdkTextareaAutosize="cdkTextareaAutosize"
                [cdkAutosizeMinRows]="3"
                [cdkAutosizeMaxRows]="6"
                placeholder="What will you be retrospecting on? (optional)"
              ></textarea>
            </div>

            <div class="mt-3 form-group">
              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-medium text-blue-900 mb-2">What's included:</h4>
                <ul class="text-sm text-blue-700 space-y-1">
                  <li>• Three default columns (What went well, What can be improved, Action items)</li>
                  <li>• Collaborative sticky notes with voting</li>
                  <li>• Guided retrospective phases</li>
                  <li>• Real-time team collaboration</li>
                </ul>
              </div>
            </div>

            <div class="mt-5 form-group form-action">
              <j-button className="btn-primary mr-2"
                        type="submit"
                        [disabled]="!newBoardTitle.trim()"
                        (click)="createBoard()">
                Create Board
              </j-button>
              <j-button className="btn-empty"
                        (click)="cancelCreateBoard()">
                Cancel
              </j-button>
            </div>
          </form>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .retrospective-landing {
      max-width: 1200px;
      margin: 0 auto;
      min-height: 100vh;
      background: #f8fafc;
    }

    .stat-card {
      border: 1px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      items-center: center;
      justify-content: center;
      font-size: 20px;
    }

    .boards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .board-card {
      transition: all 0.2s ease;
      border: 1px solid #e5e7eb;
    }

    .board-card:hover {
      transform: translateY(-2px);
      border-color: #3b82f6;
    }

    .action-icon {
      color: #6b7280;
      transition: color 0.2s ease;
    }

    .action-icon:hover {
      color: #3b82f6;
    }

    .empty-state {
      background: white;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    ::ng-deep .ant-card-meta-title {
      color: #111827;
      font-weight: 600;
    }

    ::ng-deep .ant-card-meta-description {
      color: #6b7280;
    }

    ::ng-deep .ant-card-actions > li {
      margin: 6px 0;
    }

    ::ng-deep .ant-card-actions > li > span:not(.ant-card-actions-separator) {
      padding: 8px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    ::ng-deep .ant-card-actions > li > span:hover {
      background-color: #f3f4f6;
    }

    // Modal form styles to match create issue modal
    .form-action {
      text-align: right;
    }

    .board-form {
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
        height: 32px !important;
        padding: 8px 11px !important;
        border-radius: 3px !important;
        border: 1px solid #dfe1e6 !important;
        background: #fafbfc !important;
        font-size: 14px !important;
        line-height: 1.42857143 !important;
        width: 100% !important;
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

        // Textarea specific styles
        &[cdkTextareaAutosize] {
          height: auto !important;
          resize: none !important;
        }
      }
    }
  `]
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
    if (this.newBoardTitle.trim()) {
      const board = this.retrospectiveService.createBoard(
        this.newBoardTitle.trim(),
        this.newBoardDescription.trim()
      );
      this.cancelCreateBoard();
      this.openBoard(board.id);
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