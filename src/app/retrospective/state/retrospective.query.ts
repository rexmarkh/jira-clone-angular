import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RetrospectiveState, RetrospectiveStore } from './retrospective.store';

@Injectable({ providedIn: 'root' })
export class RetrospectiveQuery extends Query<RetrospectiveState> {
  currentBoard$ = this.select('currentBoard');
  boards$ = this.select('boards');
  isLoading$ = this.selectLoading();

  constructor(protected store: RetrospectiveStore) {
    super(store);
  }

  getCurrentBoard() {
    return this.getValue().currentBoard;
  }

  getStickyNotesByColumn(columnId: string) {
    const currentBoard = this.getCurrentBoard();
    if (!currentBoard) return [];
    
    return currentBoard.stickyNotes.filter(note => note.columnId === columnId);
  }
}