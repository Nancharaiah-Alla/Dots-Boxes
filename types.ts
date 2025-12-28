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

export type GameMode = 'OFFLINE' | 'ONLINE';

export interface GameConfig {
  p1Name: string;
  p2Name: string;
  gridSize: number;
  mode: GameMode;
  roomId?: string; // For online display
  myPlayer?: Player; // 'X' or 'O' (Only for online)
}

export type AtmosphereType = 'NONE' | 'STRANGER_THINGS' | 'SUMMER' | 'RAINY' | 'WINTER' | 'SPRING';

// Network Payload Types
export type NetworkMessage = 
  | { type: 'JOIN'; name: string }
  | { type: 'START'; config: GameConfig }
  | { type: 'MOVE'; lineType: LineType; r: number; c: number }
  | { type: 'RESTART' }
  | { type: 'QUIT' };