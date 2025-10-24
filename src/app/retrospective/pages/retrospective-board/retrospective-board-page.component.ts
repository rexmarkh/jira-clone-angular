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
import { NzModalService } from 'ng-zorro-antd/modal';
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
          <!-- Top Row: Title & Actions -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ currentBoard.title }}</h1>
                <p class="text-sm text-gray-500">{{ currentBoard.description }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
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

              <!-- Settings -->
              <button 
                nz-button 
                nzType="default"
                (click)="showSettingsModal()"
                class="flex items-center gap-2"
              >
                <span nz-icon nzType="setting" nzTheme="outline"></span>
                Settings
              </button>
            </div>
          </div>

          <!-- Phase Navigation -->
          <div class="phase-navigation">
            <div class="phase-steps">
              <div 
                *ngFor="let phase of retroPhases; let i = index"
                class="phase-step"
                [class.active]="currentBoard.currentPhase === phase"
                [class.completed]="isPhaseCompleted(phase)"
                [class.clickable]="isPhaseClickable(phase)"
                [class.disabled]="!isPhaseClickable(phase)"
                (click)="isPhaseClickable(phase) && changePhase(phase)"
              >
                <!-- Step Number/Icon -->
                <div class="step-indicator">
                  <!-- Show number for all non-completed phases -->
                  <span *ngIf="!isPhaseCompleted(phase)" class="step-number">{{ i + 1 }}</span>
                  <!-- Show check icon only for completed phases -->
                  <span *ngIf="isPhaseCompleted(phase)" nz-icon nzType="check" nzTheme="outline" class="step-icon-check"></span>
                </div>

                <!-- Step Label -->
                <div class="step-content">
                  <div class="step-title">{{ getPhaseTitle(phase) }}</div>
                  <div class="step-description">
                    <span 
                      nz-icon 
                      nzType="info-circle" 
                      nzTheme="outline" 
                      class="info-icon"
                      [nz-tooltip]="getPhaseTooltip(phase)"
                      nzTooltipPlacement="bottom"
                    ></span>
                    {{ getPhaseShortDescription(phase) }}
                  </div>
                </div>

                <!-- Connector Line -->
                <div *ngIf="i < retroPhases.length - 1" class="step-connector"></div>
              </div>
            </div>
          </div>
        </nz-header>

        <!-- Board Content -->
        <!-- Board Content -->
        <nz-content class="p-4 overflow-hidden">
          <div class="h-full">
            <!-- Columns Grid -->
            <div 
              class="columns-grid h-full gap-6"
              cdkDropListGroup
            >
              <app-retro-column
                *ngFor="let column of currentBoard.columns; trackBy: trackByColumnId"
                [column]="column"
                [stickyNotes]="getStickyNotesForColumn(column.id)"
                [currentUserId]="getCurrentUserId()"
                [currentPhase]="currentBoard.currentPhase"
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

    <!-- Step Description Templates -->
    <ng-template #brainstormingDescTemplate>
      <div class="flex items-center gap-1">
        <span>Add your thoughts</span>
        <span 
          nz-icon 
          nzType="info-circle" 
          nzTheme="outline"
          [nz-tooltip]="getPhaseInstructions(RetroPhase.BRAINSTORMING)"
          nzTooltipPlacement="bottom"
          class="text-gray-400 hover:text-blue-500 cursor-help text-xs"
        ></span>
      </div>
    </ng-template>

    <ng-template #groupingDescTemplate>
      <div class="flex items-center gap-1">
        <span>Group similar ideas</span>
        <span 
          nz-icon 
          nzType="info-circle" 
          nzTheme="outline"
          [nz-tooltip]="getPhaseInstructions(RetroPhase.GROUPING)"
          nzTooltipPlacement="bottom"
          class="text-gray-400 hover:text-blue-500 cursor-help text-xs"
        ></span>
      </div>
    </ng-template>

    <ng-template #votingDescTemplate>
      <div class="flex items-center gap-1">
        <span>Vote on priority items</span>
        <span 
          nz-icon 
          nzType="info-circle" 
          nzTheme="outline"
          [nz-tooltip]="getPhaseInstructions(RetroPhase.VOTING)"
          nzTooltipPlacement="bottom"
          class="text-gray-400 hover:text-blue-500 cursor-help text-xs"
        ></span>
      </div>
    </ng-template>

    <ng-template #discussionDescTemplate>
      <div class="flex items-center gap-1">
        <span>Discuss top items</span>
        <span 
          nz-icon 
          nzType="info-circle" 
          nzTheme="outline"
          [nz-tooltip]="getPhaseInstructions(RetroPhase.DISCUSSION)"
          nzTooltipPlacement="bottom"
          class="text-gray-400 hover:text-blue-500 cursor-help text-xs"
        ></span>
      </div>
    </ng-template>

    <ng-template #actionItemsDescTemplate>
      <div class="flex items-center gap-1">
        <span>Define next steps</span>
        <span 
          nz-icon 
          nzType="info-circle" 
          nzTheme="outline"
          [nz-tooltip]="getPhaseInstructions(RetroPhase.ACTION_ITEMS)"
          nzTooltipPlacement="bottom"
          class="text-gray-400 hover:text-blue-500 cursor-help text-xs"
        ></span>
      </div>
    </ng-template>
  `,
  styles: [`
    .retrospective-board {
      background: #f8fafc;
    }

    .columns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 8px;
      padding-bottom: 16px;
    }

    .column-item {
      height: 100%;
      min-width: 320px;
    }

    .cdk-drop-list-group {
      display: contents;
    }

    .cdk-drag-preview {
      z-index: 1000;
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drag-animating {
      transition: transform 100ms cubic-bezier(0, 0, 0.2, 1);
    }

    ::ng-deep .ant-layout-header {
      line-height: 1.5;
    }

    ::ng-deep .ant-steps-small .ant-steps-item-title {
      font-size: 13px;
    }
    
    ::ng-deep .ant-steps-small .ant-steps-item-description {
      font-size: 11px;
    }

    ::ng-deep .ant-steps .ant-steps-item-description .anticon-info-circle {
      transition: color 0.2s ease;
    }

    /* Timeline/Progress Phase Navigation */
    .phase-navigation {
      margin-top: 24px;
      padding: 32px 24px;
      background: white;
      border-radius: 0;
      border: none;
    }

    .phase-steps {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      padding: 0;
    }

    /* No background line - we'll use individual connectors */

    .phase-step {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 0;
      background: transparent;
      border: none;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    .phase-step.clickable {
      cursor: pointer;
    }

    .phase-step.disabled {
      cursor: not-allowed;
      opacity: 0.9;
    }

    .phase-step.clickable:hover .step-indicator {
      transform: scale(1.15);
    }

    .phase-step.clickable:hover .step-title {
      color: #3b82f6;
    }

    .phase-step.disabled:hover .step-indicator {
      transform: none;
    }

    .phase-step.disabled:hover .step-title {
      color: inherit;
    }

    /* Node/Dot indicator */
    .step-indicator {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      background: #ffffff;
      border: 3px solid #e5e7eb;
      color: #9ca3af;
      transition: all 0.3s ease;
      position: relative;
      z-index: 10;
      box-shadow: 0 0 0 2px #ffffff;
    }

    /* Inactive/upcoming phase */
    .phase-step .step-indicator {
      background: #ffffff;
      border-color: #e5e7eb;
      color: #9ca3af;
      box-shadow: 0 0 0 2px #ffffff;
    }

    /* Active phase - filled dot with glow */
    .phase-step.active .step-indicator {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      transform: scale(1.1);
      z-index: 10;
    }

    /* Completed phase - filled green dot */
    .phase-step.completed .step-indicator {
      background: #10b981;
      border-color: #10b981;
      color: white;
      z-index: 10;
    }

    /* Connector line after each step (except last) */
    .phase-step:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 3px;
      background: #e5e7eb;
      z-index: 0;
      margin-left: 20px;
    }

    /* Green line after completed phases */
    .phase-step.completed:not(:last-child)::after {
      background: #10b981;
    }

    .step-number {
      display: block;
      font-size: 14px;
      font-weight: 600;
    }

    /* Active phase number should be white */
    .phase-step.active .step-number {
      color: white;
    }

    .step-icon-check {
      font-size: 16px;
    }

    .step-icon-active {
      font-size: 18px;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }

    .step-content {
      flex: 1;
      text-align: center;
      max-width: 150px;
    }

    .step-title {
      font-weight: 600;
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s ease;
    }

    .phase-step.active .step-title {
      color: #1e40af;
      font-weight: 700;
    }

    .phase-step.completed .step-title {
      color: #059669;
      font-weight: 600;
    }

    .step-description {
      font-size: 11px;
      color: #9ca3af;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .step-description .info-icon {
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .step-description .info-icon:hover {
      transform: scale(1.15);
    }

    .phase-step.active .step-description {
      color: #3b82f6;
    }

    .phase-step.active .step-description .info-icon {
      color: #3b82f6;
    }

    .phase-step.completed .step-description {
      color: #6b7280;
    }

    .phase-step.completed .step-description .info-icon {
      color: #6b7280;
    }

    .phase-step .step-description .info-icon {
      color: #9ca3af;
    }

    /* Modal Styles */
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
  
  // Make RetroPhase enum available in template
  RetroPhase = RetroPhase;
  
  currentBoard: RetrospectiveBoard | null = null;
  columnDataArrays: { [columnId: string]: StickyNote[] } = {};
  
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
    private authQuery: AuthQuery,
    private modal: NzModalService
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
          
          // Initialize column data arrays for drag & drop
          this.initializeColumnArrays();
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
    return this.columnDataArrays[columnId] || [];
  }

  private initializeColumnArrays() {
    if (!this.currentBoard) return;
    
    // Initialize empty arrays for each column
    this.columnDataArrays = {};
    this.currentBoard.columns.forEach(column => {
      this.columnDataArrays[column.id] = [];
    });
    
    // Populate arrays with current notes
    this.currentBoard.stickyNotes.forEach(note => {
      if (this.columnDataArrays[note.columnId]) {
        this.columnDataArrays[note.columnId].push(note);
      }
    });
    
    // Sort notes by position within each column
    Object.keys(this.columnDataArrays).forEach(columnId => {
      this.columnDataArrays[columnId].sort((a, b) => a.position.y - b.position.y);
    });
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

  getPhaseTitle(phase: RetroPhase): string {
    return this.getPhaseLabel(phase);
  }

  getPhaseShortDescription(phase: RetroPhase): string {
    const descriptions = {
      [RetroPhase.BRAINSTORMING]: 'Share thoughts & ideas',
      [RetroPhase.GROUPING]: 'Organize similar notes',
      [RetroPhase.VOTING]: 'Vote on key topics',
      [RetroPhase.DISCUSSION]: 'Discuss & collaborate',
      [RetroPhase.ACTION_ITEMS]: 'Create action plan',
      [RetroPhase.COMPLETED]: 'Review & complete'
    };
    return descriptions[phase] || '';
  }

  getPhaseTooltip(phase: RetroPhase): string {
    if (this.currentBoard?.currentPhase === phase) {
      return 'Current phase - ' + this.getPhaseInstructions(phase);
    }
    if (this.isPhaseCompleted(phase)) {
      return 'Completed - Click to return to this phase';
    }
    return 'Click to move to this phase - ' + this.getPhaseInstructions(phase);
  }

  isPhaseCompleted(phase: RetroPhase): boolean {
    if (!this.currentBoard) return false;
    
    const phaseOrder = [
      RetroPhase.BRAINSTORMING,
      RetroPhase.GROUPING,
      RetroPhase.VOTING,
      RetroPhase.DISCUSSION,
      RetroPhase.ACTION_ITEMS,
      RetroPhase.COMPLETED
    ];
    
    const currentIndex = phaseOrder.indexOf(this.currentBoard.currentPhase);
    const targetIndex = phaseOrder.indexOf(phase);
    
    return targetIndex < currentIndex;
  }

  canChangePhase(): boolean {
    // In a real app, you might check if the user is a facilitator
    return true;
  }

  isPhaseClickable(phase: RetroPhase): boolean {
    if (!this.currentBoard || !this.canChangePhase()) {
      return false;
    }

    // Current phase is not clickable (already there)
    if (this.currentBoard.currentPhase === phase) {
      return false;
    }

    // Get the phase order
    const phases = this.retroPhases;
    const currentPhaseIndex = phases.indexOf(this.currentBoard.currentPhase);
    const targetPhaseIndex = phases.indexOf(phase);

    // Can only move backward (to completed phases) or forward to immediate next phase
    return targetPhaseIndex < currentPhaseIndex || targetPhaseIndex === currentPhaseIndex + 1;
  }

  changePhase(phase: RetroPhase) {
    if (!this.isPhaseClickable(phase)) {
      return;
    }

    // Show confirmation modal
    this.modal.confirm({
      nzTitle: `Switch to ${this.getPhaseTitle(phase)} Phase?`,
      nzContent: this.getPhaseChangeWarning(phase),
      nzOkText: 'Yes, Switch Phase',
      nzOkType: 'primary',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        this.retrospectiveService.updatePhase(phase);
      }
    });
  }

  getPhaseChangeWarning(phase: RetroPhase): string {
    const currentPhase = this.currentBoard?.currentPhase;
    
    // Generate contextual warnings based on current and target phase
    const warnings: { [key: string]: string } = {
      [RetroPhase.BRAINSTORMING]: `
        <div style="margin-bottom: 12px;">
          <strong>Switching to Brainstorming phase will:</strong>
          <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Allow adding and editing notes</li>
            <li>Enable note deletion</li>
            <li>Disable voting functionality</li>
            <li>Hide author information for privacy</li>
          </ul>
        </div>
      `,
      [RetroPhase.GROUPING]: `
        <div style="margin-bottom: 12px;">
          <strong>Switching to Grouping phase will:</strong>
          <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Disable adding new notes</li>
            <li>Disable editing and deleting notes</li>
            <li>Allow moving notes between columns</li>
            <li>Keep author information hidden</li>
          </ul>
        </div>
      `,
      [RetroPhase.VOTING]: `
        <div style="margin-bottom: 12px;">
          <strong>Switching to Voting phase will:</strong>
          <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Disable editing and moving notes</li>
            <li>Enable voting on notes</li>
            <li>Keep author information hidden</li>
            <li>Focus on prioritizing key topics</li>
          </ul>
        </div>
      `,
      [RetroPhase.DISCUSSION]: `
        <div style="margin-bottom: 12px;">
          <strong>Switching to Discussion phase will:</strong>
          <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Disable all note modifications</li>
            <li>Reveal author information</li>
            <li>Show voting results</li>
            <li>Focus on discussing high-priority items</li>
          </ul>
        </div>
      `,
      [RetroPhase.ACTION_ITEMS]: `
        <div style="margin-bottom: 12px;">
          <strong>Switching to Action Items phase will:</strong>
          <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Disable all note modifications</li>
            <li>Show all author information</li>
            <li>Focus on creating action plans</li>
            <li>Prepare for retrospective completion</li>
          </ul>
        </div>
      `,
      [RetroPhase.COMPLETED]: `
        <div style="margin-bottom: 12px;">
          <strong>Completing this retrospective will:</strong>
          <ul style="margin-top: 8px; padding-left: 20px;">
            <li>Lock all modifications</li>
            <li>Make the board read-only</li>
            <li>Preserve all data for review</li>
            <li style="color: #ef4444; font-weight: 500;">⚠️ This cannot be easily undone</li>
          </ul>
        </div>
      `
    };

    return warnings[phase] || 'Are you sure you want to switch to this phase?';
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
    // Reinitialize arrays after adding note
    setTimeout(() => this.initializeColumnArrays(), 100);
  }

  onNoteChange(note: StickyNote) {
    this.retrospectiveService.updateStickyNote(note.id, note);
    setTimeout(() => this.initializeColumnArrays(), 100);
  }

  onNoteDelete(noteId: string) {
    this.retrospectiveService.deleteStickyNote(noteId);
    setTimeout(() => this.initializeColumnArrays(), 100);
  }

  onNoteVote(noteId: string) {
    this.retrospectiveService.voteOnStickyNote(noteId);
  }

  onNoteDrop(event: CdkDragDrop<StickyNote[]>) {
    const draggedNote = event.item.data as StickyNote;
    
    if (event.previousContainer === event.container) {
      // Same column - reorder notes
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update positions for all notes in the column
      event.container.data.forEach((note, index) => {
        this.retrospectiveService.updateStickyNote(note.id, {
          position: { x: note.position.x, y: index * 120 + 10 },
          updatedAt: new Date().toISOString()
        });
      });
    } else {
      // Different column - transfer note
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Get the new column ID from the container ID
      const newColumnId = event.container.id.replace('drop-list-', '');
      
      if (draggedNote && newColumnId && newColumnId !== draggedNote.columnId) {
        // Update the note's column and position
        this.retrospectiveService.updateStickyNote(draggedNote.id, {
          columnId: newColumnId,
          position: {
            x: 0,
            y: event.currentIndex * 120 + 10
          },
          updatedAt: new Date().toISOString()
        });
        
        // Update positions for all notes in both columns
        event.previousContainer.data.forEach((note, index) => {
          this.retrospectiveService.updateStickyNote(note.id, {
            position: { x: note.position.x, y: index * 120 + 10 },
            updatedAt: new Date().toISOString()
          });
        });
        
        event.container.data.forEach((note, index) => {
          this.retrospectiveService.updateStickyNote(note.id, {
            position: { x: note.position.x, y: index * 120 + 10 },
            updatedAt: new Date().toISOString()
          });
        });
      }
    }
  }

  // Phase management methods
  get retroPhases() {
    return Object.values(RetroPhase);
  }

  cancelPhaseChange() {
    this.isPhaseModalVisible = false;
    this.selectedPhase = this.currentBoard?.currentPhase || RetroPhase.BRAINSTORMING;
  }
}