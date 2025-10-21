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
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { StickyNote, StickyNoteColor } from '../../interfaces/retrospective.interface';
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
    DragDropModule,
    JiraControlModule
  ],
  template: `
    <div 
      class="sticky-note" 
      [style.background-color]="getBackgroundColor()"
      [style.border-left]="'4px solid ' + getBorderColor()"
      cdkDrag
      (cdkDragEnded)="onDragEnd($event)"
    >
      <nz-card 
        [nzBordered]="false"
        [nzBodyStyle]="{ padding: '12px', backgroundColor: 'transparent' }"
        class="h-full"
      >
        <!-- Note Header -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <j-avatar 
              [avatarUrl]="note.authorAvatar" 
              [name]="getInitials(note.authorName)"
              [size]="24"
              className="avatar-small"
            ></j-avatar>
            <span class="text-xs text-gray-600 font-medium">{{ note.authorName }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <!-- Color Picker -->
            <nz-popover 
              nzTitle="Change Color" 
              nzTrigger="click"
            >
              <button 
                nz-button 
                nzType="text" 
                nzSize="small"
                nz-popover
                class="opacity-60 hover:opacity-100"
              >
                <span nz-icon nzType="bg-colors" nzTheme="outline"></span>
              </button>
              <ng-template #nzPopoverContent>
                <div class="grid grid-cols-4 gap-2 p-2">
                  <div 
                    *ngFor="let color of colorOptions"
                    class="w-6 h-6 rounded cursor-pointer border-2 hover:scale-110 transition-transform"
                    [style.background-color]="getColorValue(color)"
                    [class.border-gray-800]="note.color === color"
                    [class.border-gray-300]="note.color !== color"
                    (click)="changeColor(color)"
                  ></div>
                </div>
              </ng-template>
            </nz-popover>

            <!-- More Actions -->
            <nz-popover 
              nzTitle="Actions" 
              nzTrigger="click"
            >
              <button 
                nz-button 
                nzType="text" 
                nzSize="small"
                nz-popover
                class="opacity-60 hover:opacity-100"
              >
                <span nz-icon nzType="more" nzTheme="outline"></span>
              </button>
              <ng-template #nzPopoverContent>
                <div class="flex flex-col gap-1">
                  <button 
                    nz-button 
                    nzType="text" 
                    nzSize="small"
                    (click)="startEditing()"
                    class="flex items-center gap-2 w-full justify-start"
                  >
                    <span nz-icon nzType="edit" nzTheme="outline"></span>
                    Edit
                  </button>
                  <button 
                    nz-button 
                    nzType="text" 
                    nzSize="small"
                    nzDanger
                    (click)="confirmDelete()"
                    class="flex items-center gap-2 w-full justify-start"
                  >
                    <span nz-icon nzType="delete" nzTheme="outline"></span>
                    Delete
                  </button>
                </div>
              </ng-template>
            </nz-popover>
          </div>
        </div>

        <!-- Note Content -->
        <div class="mb-3">
          <div 
            *ngIf="!isEditing" 
            class="text-sm leading-relaxed cursor-text min-h-[40px] p-2 rounded hover:bg-black hover:bg-opacity-5 transition-colors"
            (click)="startEditing()"
          >
            {{ note.content }}
          </div>
          
          <textarea
            *ngIf="isEditing"
            [(ngModel)]="editContent"
            class="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            cdkTextareaAutosize
            #cdkTextareaAutosize="cdkTextareaAutosize"
            [cdkAutosizeMinRows]="2"
            [cdkAutosizeMaxRows]="6"
            (blur)="saveEdit()"
            (keydown.enter)="$event.ctrlKey && saveEdit()"
            placeholder="Enter your note..."
            #editInput
          ></textarea>
        </div>

        <!-- Note Footer -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <!-- Vote Button -->
            <button 
              nz-button 
              nzType="text" 
              nzSize="small"
              [class]="hasUserVoted() ? 'text-blue-600' : 'text-gray-500'"
              (click)="onVote()"
              class="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <span nz-icon [nzType]="hasUserVoted() ? 'like' : 'like'" [nzTheme]="hasUserVoted() ? 'fill' : 'outline'"></span>
              <span class="text-xs">{{ note.votes }}</span>
            </button>

            <!-- Timestamp -->
            <span class="text-xs text-gray-400">
              {{ getTimeAgo() }}
            </span>
          </div>

          <!-- Drag Handle -->
          <div class="drag-handle opacity-40 hover:opacity-80 cursor-move">
            <span nz-icon nzType="drag" nzTheme="outline"></span>
          </div>
        </div>
      </nz-card>
    </div>
  `,
  styles: [`
    .sticky-note {
      width: 240px;
      min-height: 120px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      cursor: default;
    }

    .sticky-note:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .sticky-note.cdk-drag-preview {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      transform: rotate(3deg);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .drag-handle {
      cursor: grab;
    }

    .drag-handle:active {
      cursor: grabbing;
    }

    ::ng-deep .ant-card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class StickyNoteComponent implements OnInit, OnDestroy {
  @Input() note!: StickyNote;
  @Input() currentUserId: string = '';
  @Output() noteChange = new EventEmitter<StickyNote>();
  @Output() noteDelete = new EventEmitter<string>();
  @Output() noteVote = new EventEmitter<string>();
  @Output() positionChange = new EventEmitter<{ noteId: string, position: { x: number, y: number } }>();

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

  startEditing() {
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

  changeColor(color: StickyNoteColor) {
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
    // In a real app, you might want to show a confirmation modal
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteDelete.emit(this.note.id);
    }
  }

  onDragEnd(event: CdkDragDrop<any>) {
    if (event.distance.x !== 0 || event.distance.y !== 0) {
      const newPosition = {
        x: this.note.position.x + event.distance.x,
        y: this.note.position.y + event.distance.y
      };
      
      this.positionChange.emit({
        noteId: this.note.id,
        position: newPosition
      });
    }
  }
}