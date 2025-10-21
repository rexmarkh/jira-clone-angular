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
import { RetroColumn, StickyNote, StickyNoteColor } from '../../interfaces/retrospective.interface';
import { StickyNoteComponent } from '../sticky-note/sticky-note.component';

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
    StickyNoteComponent
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
              (noteChange)="onNoteChange($event)"
              (noteDelete)="onNoteDelete($event)"
              (noteVote)="onNoteVote($event)"
              (positionChange)="onPositionChange($event)"
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
      nzTitle="Add New Note"
      [nzOkDisabled]="!newNoteContent.trim()"
      nzOkText="Add Note"
      nzCancelText="Cancel"
      (nzOnOk)="addNote()"
      (nzOnCancel)="cancelAddNote()"
      nzWidth="500px"
    >
      <ng-container *nzModalContent>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Note Content</label>
            <textarea
              [(ngModel)]="newNoteContent"
              class="w-full p-3 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              cdkTextareaAutosize
              #cdkTextareaAutosize="cdkTextareaAutosize"
              [cdkAutosizeMinRows]="3"
              [cdkAutosizeMaxRows]="6"
              placeholder="What would you like to share?"
              #noteInput
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
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

    .cdk-drop-list.cdk-drop-list-receiving .cdk-drag {
      display: none;
    }

    ::ng-deep .ant-card-head {
      padding: 0 16px;
      min-height: 64px;
    }

    ::ng-deep .ant-card-head-title {
      padding: 16px 0;
    }
  `]
})
export class RetroColumnComponent {
  @Input() column!: RetroColumn;
  @Input() stickyNotes: StickyNote[] = [];
  @Input() currentUserId: string = '';
  
  @Output() noteAdd = new EventEmitter<{ columnId: string, content: string, color: StickyNoteColor }>();
  @Output() noteChange = new EventEmitter<StickyNote>();
  @Output() noteDelete = new EventEmitter<string>();
  @Output() noteVote = new EventEmitter<string>();
  @Output() noteDrop = new EventEmitter<CdkDragDrop<StickyNote[]>>();
  @Output() positionChange = new EventEmitter<{ noteId: string, position: { x: number, y: number } }>();

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
    if (this.newNoteContent.trim()) {
      this.noteAdd.emit({
        columnId: this.column.id,
        content: this.newNoteContent.trim(),
        color: this.selectedColor
      });
      this.cancelAddNote();
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

  onPositionChange(data: { noteId: string, position: { x: number, y: number } }) {
    this.positionChange.emit(data);
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