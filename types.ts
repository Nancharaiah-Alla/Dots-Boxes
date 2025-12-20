import { Player, SquareOwner } from './constants';

export interface GameState {
  hLines: boolean[][]; // [row][col] - horizontal lines
  vLines: boolean[][]; // [row][col] - vertical lines
  squares: SquareOwner[][]; // [row][col] - ownership of squares
  currentPlayer: Player;
  scores: Record<Player, number>;
  winner: Player | 'Draw' | null;
  moveHistory: string[]; // For potential undo or debug
}

export type LineType = 'horizontal' | 'vertical';