export const PLAYER_X = 'X';
export const PLAYER_O = 'O';

export type Player = typeof PLAYER_X | typeof PLAYER_O;
export type SquareOwner = Player | null;

// Visual styling constants
export const DOT_SIZE = 6; // px
export const LINE_THICKNESS = 4; // px
export const HIT_AREA = 20; // px, for easier clicking
export const CELL_SIZE = 36; // px, size of the square
export const CORNER_SIZE = 16; // px, width/height of the corners (dots/intersections)