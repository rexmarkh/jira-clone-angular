import { Injectable } from '@angular/core';
import { RetrospectiveStore } from './retrospective.store';
import { RetrospectiveBoard, StickyNote, StickyNoteColor, RetroPhase, RetroColumn } from '../interfaces/retrospective.interface';
import { AuthQuery } from '../../project/auth/auth.query';

@Injectable({ providedIn: 'root' })
export class RetrospectiveService {
  constructor(
    private store: RetrospectiveStore,
    private authQuery: AuthQuery
  ) {}

  createBoard(title: string, description: string): RetrospectiveBoard {
    const user = this.authQuery.getValue();
    const boardId = this.generateId();
    
    const defaultColumns: RetroColumn[] = [
      {
        id: 'went-well',
        title: 'What went well?',
        description: 'Things that worked well in this sprint',
        color: '#4CAF50',
        position: 1
      },
      {
        id: 'improve',
        title: 'What can be improved?',
        description: 'Things that could be done better',
        color: '#FF9800',
        position: 2
      },
      {
        id: 'action-items',
        title: 'Action Items',
        description: 'Concrete actions for the next sprint',
        color: '#2196F3',
        position: 3
      }
    ];

    const newBoard: RetrospectiveBoard = {
      id: boardId,
      title,
      description,
      facilitatorId: user?.id || '',
      participants: [user?.id || ''],
      columns: defaultColumns,
      stickyNotes: [],
      isActive: true,
      currentPhase: RetroPhase.BRAINSTORMING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.update(state => ({
      ...state,
      currentBoard: newBoard,
      boards: [...state.boards, newBoard]
    }));

    return newBoard;
  }

  loadBoard(boardId: string) {
    const currentState = this.store.getValue();
    
    if (boardId === 'demo') {
      // Check if demo board already exists
      const existingDemoBoard = currentState.boards.find(board => board.id === 'demo');
      
      if (existingDemoBoard) {
        // Use existing demo board
        this.store.update(state => ({
          ...state,
          currentBoard: existingDemoBoard
        }));
      } else {
        // Create new demo board only if it doesn't exist
        this.createDemoBoard();
      }
    } else {
      // For other board IDs, find and load the board
      const board = currentState.boards.find(b => b.id === boardId);
      if (board) {
        this.store.update(state => ({
          ...state,
          currentBoard: board
        }));
      }
    }
  }

  addStickyNote(columnId: string, content: string, color: StickyNoteColor = StickyNoteColor.YELLOW, isAnonymous: boolean = false): void {
    console.log('addStickyNote called with:', { columnId, content, color, isAnonymous });
    const user = this.authQuery.getValue();
    const currentState = this.store.getValue();
    
    console.log('User from auth:', user);
    console.log('Current board:', currentState.currentBoard);
    
    if (!currentState.currentBoard || !user) {
      console.error('Missing current board or user');
      return;
    }

    // Calculate next note number based on existing notes
    const maxNoteNumber = currentState.currentBoard.stickyNotes.reduce((max, note) => {
      return Math.max(max, note.noteNumber || 0);
    }, 0);
    const nextNoteNumber = maxNoteNumber + 1;

    const newNote: StickyNote = {
      id: this.generateId(),
      noteNumber: nextNoteNumber,
      content,
      authorId: isAnonymous ? '' : user.id,
      authorName: isAnonymous ? 'Anonymous' : user.name,
      authorAvatar: isAnonymous ? '' : user.avatarUrl,
      columnId,
      color,
      position: { x: 0, y: 0 },
      votes: 0,
      voterIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('Created new note:', newNote);

    const updatedBoard = {
      ...currentState.currentBoard,
      stickyNotes: [...currentState.currentBoard.stickyNotes, newNote],
      updatedAt: new Date().toISOString()
    };

    console.log('Updated board:', updatedBoard);

    this.store.update(state => ({
      ...state,
      currentBoard: updatedBoard,
      boards: state.boards.map(board => 
        board.id === updatedBoard.id ? updatedBoard : board
      )
    }));

    console.log('Store updated successfully');
  }

  updateStickyNote(noteId: string, updates: Partial<StickyNote>): void {
    const currentState = this.store.getValue();
    
    if (!currentState.currentBoard) return;

    const updatedBoard = {
      ...currentState.currentBoard,
      stickyNotes: currentState.currentBoard.stickyNotes.map(note =>
        note.id === noteId 
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ),
      updatedAt: new Date().toISOString()
    };

    this.store.update(state => ({
      ...state,
      currentBoard: updatedBoard,
      boards: state.boards.map(board => 
        board.id === updatedBoard.id ? updatedBoard : board
      )
    }));
  }

  deleteStickyNote(noteId: string): void {
    const currentState = this.store.getValue();
    
    if (!currentState.currentBoard) return;

    const updatedBoard = {
      ...currentState.currentBoard,
      stickyNotes: currentState.currentBoard.stickyNotes.filter(note => note.id !== noteId),
      updatedAt: new Date().toISOString()
    };

    this.store.update(state => ({
      ...state,
      currentBoard: updatedBoard,
      boards: state.boards.map(board => 
        board.id === updatedBoard.id ? updatedBoard : board
      )
    }));
  }

  voteOnStickyNote(noteId: string): void {
    const user = this.authQuery.getValue();
    if (!user) return;

    const currentState = this.store.getValue();
    if (!currentState.currentBoard) return;

    const note = currentState.currentBoard.stickyNotes.find(n => n.id === noteId);
    if (!note) return;

    const hasVoted = note.voterIds.includes(user.id);
    const updatedNote = hasVoted 
      ? {
          ...note,
          votes: note.votes - 1,
          voterIds: note.voterIds.filter(id => id !== user.id)
        }
      : {
          ...note,
          votes: note.votes + 1,
          voterIds: [...note.voterIds, user.id]
        };

    this.updateStickyNote(noteId, updatedNote);
  }

  updatePhase(phase: RetroPhase): void {
    const currentState = this.store.getValue();
    
    if (!currentState.currentBoard) return;

    const updatedBoard = {
      ...currentState.currentBoard,
      currentPhase: phase,
      updatedAt: new Date().toISOString()
    };

    this.store.update(state => ({
      ...state,
      currentBoard: updatedBoard,
      boards: state.boards.map(board => 
        board.id === updatedBoard.id ? updatedBoard : board
      )
    }));
  }

  private createDemoBoard(): void {
    const user = this.authQuery.getValue();
    const currentState = this.store.getValue();
    
    // Remove any existing demo boards first to prevent duplicates
    const boardsWithoutDemo = currentState.boards.filter(board => board.id !== 'demo');
    
    const demoBoard: RetrospectiveBoard = {
      id: 'demo',
      title: 'Sprint 23 Retrospective',
      description: 'Team retrospective for Sprint 23 - Q4 2025',
      facilitatorId: user?.id || 'demo-user',
      participants: [user?.id || 'demo-user'],
      columns: [
        {
          id: 'went-well',
          title: 'What went well?',
          description: 'Things that worked well in this sprint',
          color: '#4CAF50',
          position: 1
        },
        {
          id: 'improve',
          title: 'What can be improved?',
          description: 'Things that could be done better',
          color: '#FF9800',
          position: 2
        },
        {
          id: 'action-items',
          title: 'Action Items',
          description: 'Concrete actions for the next sprint',
          color: '#2196F3',
          position: 3
        }
      ],
      stickyNotes: [
        {
          id: 'note-1',
          noteNumber: 1,
          content: 'Great team collaboration on the login feature',
          authorId: user?.id || 'demo-user',
          authorName: user?.name || 'Demo User',
          authorAvatar: user?.avatarUrl,
          columnId: 'went-well',
          color: StickyNoteColor.GREEN,
          position: { x: 10, y: 10 },
          votes: 3,
          voterIds: ['user-1', 'user-2', 'user-3'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'note-2',
          noteNumber: 2,
          content: 'Need better communication during code reviews',
          authorId: user?.id || 'demo-user',
          authorName: user?.name || 'Demo User',
          authorAvatar: user?.avatarUrl,
          columnId: 'improve',
          color: StickyNoteColor.ORANGE,
          position: { x: 10, y: 10 },
          votes: 1,
          voterIds: ['user-1'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      isActive: true,
      currentPhase: RetroPhase.BRAINSTORMING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.update(state => ({
      ...state,
      currentBoard: demoBoard,
      boards: [...boardsWithoutDemo, demoBoard]
    }));
  }

  updateNotePosition(noteId: string, position: { x: number; y: number }, newColumnId?: string): void {
    const currentState = this.store.getValue();
    
    if (!currentState.currentBoard) return;

    const updates: Partial<StickyNote> = {
      position,
      updatedAt: new Date().toISOString()
    };

    if (newColumnId) {
      updates.columnId = newColumnId;
    }

    this.updateStickyNote(noteId, updates);
  }

  updateNotesOrder(columnId: string, noteIds: string[]): void {
    const currentState = this.store.getValue();
    
    if (!currentState.currentBoard) return;

    const updatedNotes = currentState.currentBoard.stickyNotes.map(note => {
      if (note.columnId === columnId) {
        const orderIndex = noteIds.indexOf(note.id);
        if (orderIndex !== -1) {
          // Update position based on order (simple y-positioning)
          return {
            ...note,
            position: {
              ...note.position,
              y: orderIndex * 120 + 10 // Space notes vertically
            },
            updatedAt: new Date().toISOString()
          };
        }
      }
      return note;
    });

    const updatedBoard = {
      ...currentState.currentBoard,
      stickyNotes: updatedNotes,
      updatedAt: new Date().toISOString()
    };

    this.store.update(state => ({
      ...state,
      currentBoard: updatedBoard,
      boards: state.boards.map(board => 
        board.id === updatedBoard.id ? updatedBoard : board
      )
    }));
  }

  moveNoteBetweenColumns(noteId: string, fromColumnId: string, toColumnId: string, position: { x: number; y: number }): void {
    const currentState = this.store.getValue();
    
    if (!currentState.currentBoard) return;

    const note = currentState.currentBoard.stickyNotes.find(n => n.id === noteId);
    if (!note || note.columnId !== fromColumnId) return;

    this.updateNotePosition(noteId, position, toColumnId);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}