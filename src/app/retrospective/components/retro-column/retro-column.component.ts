import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { CdkDropList, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
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
    DragDropModule,
    StickyNoteComponent,
    JiraControlModule
  ],
  template: `
    <div class="retro-column h-full">
      <nz-card 
        [nzTitle]="columnHeaderTemplate"
        [nzBodyStyle]="{ padding: '16px', height: 'calc(100% - 64px)', overflow: 'hidden' }"
        class="h-full"
      >
        <!-- Column Body -->
        <div 
          class="column-content h-full flex flex-col"
          cdkDropList
          [cdkDropListData]="stickyNotes"
          (cdkDropListDropped)="onNoteDrop($event)"
        >
          <!-- Add Note Button -->
          <div class="mb-4">
            <button 
              nz-button 
              nzType="dashed" 
              nzBlock
              (click)="showAddNoteModal()"
              class="flex items-center justify-center gap-2 h-10 text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
            >
              <span nz-icon nzType="plus" nzTheme="outline"></span>
              Add a note
            </button>
          </div>

          <!-- Sticky Notes List -->
          <div class="notes-container flex-1 overflow-y-auto space-y-3" *ngIf="stickyNotes.length > 0">
            <app-sticky-note
              *ngFor="let note of stickyNotes; trackBy: trackByNoteId"
              [note]="note"
              [currentUserId]="currentUserId"
              [currentPhase]="currentPhase"
              (noteChange)="onNoteChange($event)"
              (noteDelete)="onNoteDelete($event)"
              (noteVote)="onNoteVote($event)"
              cdkDrag
            ></app-sticky-note>
          </div>

          <!-- Empty State -->
          <div *ngIf="stickyNotes.length === 0" class="flex-1 flex items-center justify-center">
            <nz-empty 
              [nzNotFoundContent]="emptyTemplate"
              nzNotFoundImage="simple"
            ></nz-empty>
          </div>
        </div>
      </nz-card>
    </div>

    <!-- Column Header Template -->
    <ng-template #columnHeaderTemplate>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div 
            class="w-4 h-4 rounded-full"
            [style.background-color]="column.color"
          ></div>
          <div>
            <h3 class="text-lg font-semibold mb-0">{{ column.title }}</h3>
            <p class="text-sm text-gray-500 mb-0">{{ column.description }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {{ stickyNotes.length }}
          </span>
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

    <!-- Add Note Modal -->
    <nz-modal
      [(nzVisible)]="isAddNoteModalVisible"
      nzClosable="false"
      nzFooter="null"
      nzWidth="600px"
    >
      <ng-container *nzModalContent>
        <div class="px-8 py-5">
          <div class="flex items-center py-3 text-textDarkest">
            <div class="text-xl">
              Add New Note
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
              <label class="label">
                Note Content
              </label>
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
            
            <div class="mt-5 form-group form-action">
              <j-button className="btn-primary mr-2"
                        type="button"
                        [disabled]="!newNoteContent.trim()"
                        (click)="addNote()">
                Add Note
              </j-button>
              <j-button className="btn-empty"
                        (click)="cancelAddNote()">
                Cancel
              </j-button>
            </div>
          </form>
        </div>
      </ng-container>
    </nz-modal>
  `,
  styles: [`
    .retro-column {
      width: 100%;
      max-width: 400px;
      min-width: 320px;
    }

    .column-content {
      max-height: calc(100vh - 200px);
    }

    .notes-container {
      scrollbar-width: thin;
      scrollbar-color: #e5e7eb transparent;
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

    .cdk-drop-list {
      min-height: 100px;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list.cdk-drop-list-receiving .cdk-drag-placeholder {
      opacity: 0.3;
      background: #f3f4f6;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
    }

    ::ng-deep .ant-card-head {
      padding: 0 16px;
      min-height: 64px;
    }

    ::ng-deep .ant-card-head-title {
      padding: 16px 0;
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
  
  @Output() noteAdd = new EventEmitter<{ columnId: string, content: string, color: StickyNoteColor }>();
  @Output() noteChange = new EventEmitter<StickyNote>();
  @Output() noteDelete = new EventEmitter<string>();
  @Output() noteVote = new EventEmitter<string>();
  @Output() noteDrop = new EventEmitter<CdkDragDrop<StickyNote[]>>();

  isAddNoteModalVisible = false;
  newNoteContent = '';
  selectedColor: StickyNoteColor = StickyNoteColor.YELLOW;
  
  colorOptions = Object.values(StickyNoteColor);

  showAddNoteModal() {
    this.isAddNoteModalVisible = true;
    this.newNoteContent = '';
    this.selectedColor = StickyNoteColor.YELLOW;
    
    // Focus the textarea after modal opens
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }

  addNote() {
    console.log('addNote called, content:', this.newNoteContent);
    console.log('Column ID:', this.column.id);
    console.log('Selected color:', this.selectedColor);
    if (this.newNoteContent.trim()) {
      console.log('Emitting noteAdd event');
      this.noteAdd.emit({
        columnId: this.column.id,
        content: this.newNoteContent.trim(),
        color: this.selectedColor
      });
      this.cancelAddNote();
    } else {
      console.log('Content is empty, not adding note');
    }
  }

  cancelAddNote() {
    this.isAddNoteModalVisible = false;
    this.newNoteContent = '';
    this.selectedColor = StickyNoteColor.YELLOW;
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
    this.noteDrop.emit(event);
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
}