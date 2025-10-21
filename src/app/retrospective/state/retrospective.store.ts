import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { RetrospectiveBoard } from '../interfaces/retrospective.interface';

export interface RetrospectiveState {
  currentBoard: RetrospectiveBoard | null;
  boards: RetrospectiveBoard[];
}

export function createInitialRetrospectiveState(): RetrospectiveState {
  return {
    currentBoard: null,
    boards: []
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'retrospective'
})
export class RetrospectiveStore extends Store<RetrospectiveState> {
  constructor() {
    super(createInitialRetrospectiveState());
  }
}