export interface StickyNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  columnId: string;
  color: StickyNoteColor;
  position: {
    x: number;
    y: number;
  };
  votes: number;
  voterIds: string[];
  tags?: string[];
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum StickyNoteColor {
  YELLOW = 'yellow',
  PINK = 'pink',
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  ORANGE = 'orange'
}

export interface RetroColumn {
  id: string;
  title: string;
  description: string;
  color: string;
  position: number;
}

export interface RetrospectiveBoard {
  id: string;
  title: string;
  description: string;
  facilitatorId: string;
  participants: string[];
  columns: RetroColumn[];
  stickyNotes: StickyNote[];
  isActive: boolean;
  timerDuration?: number;
  currentPhase: RetroPhase;
  createdAt: string;
  updatedAt: string;
}

export enum RetroPhase {
  BRAINSTORMING = 'brainstorming',
  GROUPING = 'grouping', 
  VOTING = 'voting',
  DISCUSSION = 'discussion',
  ACTION_ITEMS = 'action-items',
  COMPLETED = 'completed'
}