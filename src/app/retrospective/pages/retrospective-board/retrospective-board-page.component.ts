import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

import { RetrospectiveService } from '../../state/retrospective.service';
import { RetrospectiveQuery } from '../../state/retrospective.query';
import { AuthQuery } from '../../../project/auth/auth.query';
import { RetrospectiveBoard, StickyNote, StickyNoteColor, RetroPhase, RetroColumn } from '../../interfaces/retrospective.interface';
import { RetroColumnComponent } from '../../components/retro-column/retro-column.component';
import { JiraControlModule } from '../../../jira-control/jira-control.module';

@Component({
  selector: 'app-retrospective-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TextFieldModule,
    NzLayoutModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzStepsModule,
    NzModalModule,
    NzInputModule,
    NzSelectModule,
    NzToolTipModule,
    NzDividerModule,
    DragDropModule,
    RetroColumnComponent,
    JiraControlModule
  ],
  template: `
    <div class="retrospective-board h-full" *ngIf="currentBoard">
      <!-- Header -->
      <nz-layout class="h-full">
        <nz-header class="bg-white border-b border-gray-200 px-6 h-auto py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button 
                nz-button 
                nzType="text" 
                nzSize="large"
                (click)="goBack()"
                class="flex items-center gap-2"
              >
                <span nz-icon nzType="arrow-left" nzTheme="outline"></span>
                Back
              </button>
              
              <nz-divider nzType="vertical"></nz-divider>
              
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ currentBoard.title }}</h1>
                <p class="text-sm text-gray-500">{{ currentBoard.description }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- Phase Indicator -->
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Phase:</span>
                <nz-tag [nzColor]="getPhaseColor(currentBoard.currentPhase)">
                  {{ getPhaseLabel(currentBoard.currentPhase) }}
                </nz-tag>
              </div>

              <!-- Participants -->
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-600">Team:</span>
                <div class="flex items-center -space-x-2">
                  <j-avatar 
                    *ngFor="let participantId of currentBoard.participants.slice(0, 5); let i = index"
                    [avatarUrl]="getParticipantAvatar(participantId)"
                    [name]="getParticipantInitials(participantId)"
                    [size]="24"
                    className="border-2 border-white rounded-full hover:z-10"
                    [ngStyle]="{ zIndex: 5 - i }"
                    [title]="getParticipantName(participantId)"
                  ></j-avatar>
                  <span *ngIf="currentBoard.participants.length > 5" 
                        class="text-xs text-gray-500 ml-2">
                    +{{ currentBoard.participants.length - 5 }} more
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button 
                  nz-button 
                  nzType="default"
                  (click)="showPhaseModal()"
                  class="flex items-center gap-2"
                >
                  <span nz-icon nzType="control" nzTheme="outline"></span>
                  Manage Phase
                </button>
                
                <button 
                  nz-button 
                  nzType="primary"
                  (click)="showSettingsModal()"
                  class="flex items-center gap-2"
                >
                  <span nz-icon nzType="setting" nzTheme="outline"></span>
                  Settings
                </button>
              </div>
            </div>
          </div>

          <!-- Phase Steps -->
          <div class="mt-4">
            <nz-steps 
              [nzCurrent]="getCurrentPhaseStep()" 
              nzSize="small"
              class="max-w-4xl"
            >
              <nz-step 
                nzTitle="Brainstorming" 
                nzDescription="Add your thoughts"
                nzIcon="bulb"
              ></nz-step>
              <nz-step 
                nzTitle="Grouping" 
                nzDescription="Group similar ideas"
                nzIcon="group"
              ></nz-step>
              <nz-step 
                nzTitle="Voting" 
                nzDescription="Vote on priority items"
                nzIcon="like"
              ></nz-step>
              <nz-step 
                nzTitle="Discussion" 
                nzDescription="Discuss top items"
                nzIcon="message"
              ></nz-step>
              <nz-step 
                nzTitle="Action Items" 
                nzDescription="Define next steps"
                nzIcon="check-circle"
              ></nz-step>
            </nz-steps>
          </div>
        </nz-header>

        <!-- Board Content -->
        <nz-content class="p-6 overflow-hidden">
          <div class="h-full">
            <!-- Phase Instructions -->
            <div class="mb-6">
              <nz-card nzSize="small" class="bg-blue-50 border-blue-200">
                <div class="flex items-start gap-3">
                  <span nz-icon [nzType]="getPhaseIcon(currentBoard.currentPhase)" nzTheme="outline" class="text-blue-600 text-lg mt-1"></span>
                  <div>
                    <h3 class="font-semibold text-blue-900 mb-1">{{ getPhaseLabel(currentBoard.currentPhase) }}</h3>
                    <p class="text-sm text-blue-700 mb-0">{{ getPhaseInstructions(currentBoard.currentPhase) }}</p>
                  </div>
                </div>
              </nz-card>
            </div>

            <!-- Columns Grid -->
            <div 
              class="columns-grid h-full"
              cdkDropListGroup
            >
              <app-retro-column
                *ngFor="let column of currentBoard.columns; trackBy: trackByColumnId"
                [column]="column"
                [stickyNotes]="getStickyNotesForColumn(column.id)"
                [currentUserId]="getCurrentUserId()"
                (noteAdd)="onNoteAdd($event)"
                (noteChange)="onNoteChange($event)"
                (noteDelete)="onNoteDelete($event)"
                (noteVote)="onNoteVote($event)"
                (noteDrop)="onNoteDrop($event)"
                class="column-item"
                [attr.data-column-id]="column.id"
              ></app-retro-column>
            </div>
          </div>
        </nz-content>
      </nz-layout>
    </div>

    <!-- Phase Management Modal -->
    <nz-modal
      [(nzVisible)]="isPhaseModalVisible"
      nzClosable="false"
      nzFooter="null"
      nzWidth="600px"
    >
      <ng-container *nzModalContent>
        <div class="px-8 py-5">
          <div class="flex items-center py-3 text-textDarkest">
            <div class="text-xl">
              Retrospective Phases
            </div>
            <div class="flex-auto"></div>
            <j-button icon="times"
                      [iconSize]="24"
                      (click)="cancelPhaseChange()"
                      [className]="'btn-empty'">
            </j-button>
          </div>
          <div class="phase-form retro-modal-form">
            <div class="form-group">
              <label class="label">
                Current Phase
              </label>
              <div class="space-y-3">
                <div 
                  *ngFor="let phase of retroPhases" 
                  class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors"
                  [class.bg-blue-50]="selectedPhase === phase"
                  [class.border-blue-300]="selectedPhase === phase"
                  (click)="selectedPhase = phase"
                >
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ getPhaseTitle(phase) }}</div>
                    <div class="text-sm text-gray-500">{{ getPhaseDescription(phase) }}</div>
                  </div>
                  <div 
                    *ngIf="selectedPhase === phase" 
                    class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                  >
                    <span nz-icon nzType="check" class="text-white text-xs"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-5 form-group form-action">
              <j-button className="btn-primary mr-2"
                        [disabled]="selectedPhase === currentBoard?.currentPhase"
                        (click)="updatePhase()">
                Update Phase
              </j-button>
              <j-button className="btn-empty"
                        (click)="cancelPhaseChange()">
                Cancel
              </j-button>
            </div>
          </div>
        </div>
      </ng-container>
    </nz-modal>

    <!-- Settings Modal -->
    <nz-modal
      [(nzVisible)]="isSettingsModalVisible"
      nzClosable="false"
      nzFooter="null"
      nzWidth="600px"
    >
      <ng-container *nzModalContent>
        <div class="px-8 py-5">
          <div class="flex items-center py-3 text-textDarkest">
            <div class="text-xl">
              Board Settings
            </div>
            <div class="flex-auto"></div>
            <j-button icon="times"
                      [iconSize]="24"
                      (click)="cancelSettings()"
                      [className]="'btn-empty'">
            </j-button>
          </div>
          <form class="settings-form retro-modal-form">
            <div class="form-group">
              <label class="label">
                Board Title
              </label>
              <input 
                [(ngModel)]="settingsTitle" 
                class="form-input"
                placeholder="Enter board title"
              />
            </div>
            
            <div class="mt-3 form-group">
              <label class="label">
                Description
              </label>
              <textarea
                [(ngModel)]="settingsDescription"
                class="form-input"
                cdkTextareaAutosize
                #cdkTextareaAutosize="cdkTextareaAutosize"
                [cdkAutosizeMinRows]="3"
                [cdkAutosizeMaxRows]="6"
                placeholder="Enter board description"
              ></textarea>
            </div>

            <div class="mt-5 form-group form-action">
              <j-button className="btn-primary mr-2"
                        (click)="saveSettings()">
                Save
              </j-button>
              <j-button className="btn-empty"
                        (click)="cancelSettings()">
                Cancel
              </j-button>
            </div>
          </form>
        </div>
      </ng-container>
    </nz-modal>

    <!-- Loading State -->
    <div *ngIf="!currentBoard" class="h-full flex items-center justify-center">
      <div class="text-center">
        <span nz-icon nzType="loading" nzTheme="outline" class="text-2xl text-gray-400 mb-4"></span>
        <p class="text-gray-500">Loading retrospective board...</p>
      </div>
    </div>
  `,
  styles: [`
    .retrospective-board {
      background: #f8fafc;
    }

    .columns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
      height: calc(100% - 120px);
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 16px;
    }

    .column-item {
      height: 100%;
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    ::ng-deep .ant-layout-header {
      line-height: 1.5;
    }

    ::ng-deep .ant-steps-small .ant-steps-item-title {
      font-size: 12px;
    }

    ::ng-deep .ant-steps-small .ant-steps-item-description {
      font-size: 11px;
    }

    // Modal form styles to match create issue modal
    .form-action {
      text-align: right;
    }

    .phase-form,
    .settings-form {
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
export class RetrospectiveBoardPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentBoard: RetrospectiveBoard | null = null;
  isPhaseModalVisible = false;
  isSettingsModalVisible = false;
  selectedPhase: RetroPhase = RetroPhase.BRAINSTORMING;
  settingsTitle = '';
  settingsDescription = '';

  phaseOptions = [
    { value: RetroPhase.BRAINSTORMING, label: 'Brainstorming', icon: 'bulb' },
    { value: RetroPhase.GROUPING, label: 'Grouping', icon: 'group' },
    { value: RetroPhase.VOTING, label: 'Voting', icon: 'like' },
    { value: RetroPhase.DISCUSSION, label: 'Discussion', icon: 'message' },
    { value: RetroPhase.ACTION_ITEMS, label: 'Action Items', icon: 'check-circle' },
    { value: RetroPhase.COMPLETED, label: 'Completed', icon: 'check' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private retrospectiveService: RetrospectiveService,
    private retrospectiveQuery: RetrospectiveQuery,
    private authQuery: AuthQuery
  ) {}

  ngOnInit() {
    // Get board ID from route
    const boardId = this.route.snapshot.paramMap.get('id');
    
    if (boardId) {
      this.retrospectiveService.loadBoard(boardId);
    }

    // Subscribe to current board
    this.retrospectiveQuery.currentBoard$
      .pipe(takeUntil(this.destroy$))
      .subscribe(board => {
        this.currentBoard = board;
        if (board) {
          this.selectedPhase = board.currentPhase;
          this.settingsTitle = board.title;
          this.settingsDescription = board.description;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.router.navigate(['/project/retrospective']);
  }

  getCurrentUserId(): string {
    return this.authQuery.getValue()?.id || '';
  }

  getStickyNotesForColumn(columnId: string): StickyNote[] {
    return this.retrospectiveQuery.getStickyNotesByColumn(columnId);
  }

  trackByColumnId(index: number, column: RetroColumn): string {
    return column.id;
  }

  // Phase Management
  getCurrentPhaseStep(): number {
    if (!this.currentBoard) return 0;
    
    const phaseSteps = {
      [RetroPhase.BRAINSTORMING]: 0,
      [RetroPhase.GROUPING]: 1,
      [RetroPhase.VOTING]: 2,
      [RetroPhase.DISCUSSION]: 3,
      [RetroPhase.ACTION_ITEMS]: 4,
      [RetroPhase.COMPLETED]: 4
    };
    
    return phaseSteps[this.currentBoard.currentPhase] || 0;
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

  getPhaseIcon(phase: RetroPhase): string {
    const icons = {
      [RetroPhase.BRAINSTORMING]: 'bulb',
      [RetroPhase.GROUPING]: 'group',
      [RetroPhase.VOTING]: 'like',
      [RetroPhase.DISCUSSION]: 'message',
      [RetroPhase.ACTION_ITEMS]: 'check-circle',
      [RetroPhase.COMPLETED]: 'check'
    };
    return icons[phase] || 'question';
  }

  getPhaseInstructions(phase: RetroPhase): string {
    const instructions = {
      [RetroPhase.BRAINSTORMING]: 'Add sticky notes with your thoughts about what went well, what could be improved, and action items for the next sprint.',
      [RetroPhase.GROUPING]: 'Group similar ideas together by dragging notes close to each other. This helps identify common themes.',
      [RetroPhase.VOTING]: 'Vote on the most important items by clicking the like button. Focus on what matters most to the team.',
      [RetroPhase.DISCUSSION]: 'Discuss the highest-voted items. Share perspectives and dive deeper into the key topics.',
      [RetroPhase.ACTION_ITEMS]: 'Define concrete action items based on your discussion. Assign owners and set deadlines.',
      [RetroPhase.COMPLETED]: 'Retrospective completed! Review the action items and plan for the next retrospective.'
    };
    return instructions[phase] || '';
  }

  getPhaseDescription(phase: RetroPhase): string {
    return this.getPhaseInstructions(phase);
  }

  showPhaseModal() {
    this.isPhaseModalVisible = true;
  }

  updatePhase() {
    this.retrospectiveService.updatePhase(this.selectedPhase);
    this.isPhaseModalVisible = false;
  }

  cancelPhaseUpdate() {
    this.isPhaseModalVisible = false;
    if (this.currentBoard) {
      this.selectedPhase = this.currentBoard.currentPhase;
    }
  }

  showSettingsModal() {
    this.isSettingsModalVisible = true;
  }

  saveSettings() {
    // In a real app, you would update the board settings via the service
    console.log('Saving settings:', { title: this.settingsTitle, description: this.settingsDescription });
    this.isSettingsModalVisible = false;
  }

  cancelSettings() {
    this.isSettingsModalVisible = false;
    if (this.currentBoard) {
      this.settingsTitle = this.currentBoard.title;
      this.settingsDescription = this.currentBoard.description;
    }
  }

  // Participant helpers
  getParticipantAvatar(participantId: string): string | undefined {
    // In a real app, you would look up participant details
    return undefined;
  }

  getParticipantInitials(participantId: string): string {
    // In a real app, you would look up participant details
    return participantId.slice(0, 2).toUpperCase();
  }

  getParticipantName(participantId: string): string {
    // In a real app, you would look up participant details
    return `User ${participantId}`;
  }

  // Note event handlers
  onNoteAdd(data: { columnId: string, content: string, color: StickyNoteColor }) {
    this.retrospectiveService.addStickyNote(data.columnId, data.content, data.color);
  }

  onNoteChange(note: StickyNote) {
    this.retrospectiveService.updateStickyNote(note.id, note);
  }

  onNoteDelete(noteId: string) {
    this.retrospectiveService.deleteStickyNote(noteId);
  }

  onNoteVote(noteId: string) {
    this.retrospectiveService.voteOnStickyNote(noteId);
  }

  onNoteDrop(event: CdkDragDrop<StickyNote[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the note's column
      const note = event.container.data[event.currentIndex];
      // Extract column ID from the container element
      const columnElement = event.container.element.nativeElement.closest('[data-column-id]');
      if (columnElement && note) {
        const newColumnId = columnElement.getAttribute('data-column-id');
        if (newColumnId) {
          this.retrospectiveService.updateStickyNote(note.id, { columnId: newColumnId });
        }
      }
    }
  }

  // Phase management methods
  get retroPhases() {
    return Object.values(RetroPhase);
  }

  getPhaseTitle(phase: RetroPhase): string {
    const titles = {
      [RetroPhase.BRAINSTORMING]: 'Brainstorming',
      [RetroPhase.GROUPING]: 'Grouping',
      [RetroPhase.VOTING]: 'Voting', 
      [RetroPhase.DISCUSSION]: 'Discussion',
      [RetroPhase.ACTION_ITEMS]: 'Action Items',
      [RetroPhase.COMPLETED]: 'Completed'
    };
    return titles[phase] || 'Unknown';
  }

  cancelPhaseChange() {
    this.isPhaseModalVisible = false;
    this.selectedPhase = this.currentBoard?.currentPhase || RetroPhase.BRAINSTORMING;
  }
}