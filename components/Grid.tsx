import React, { memo, useEffect, useState } from 'react';
import { PLAYER_X, CELL_SIZE, CORNER_SIZE } from '../constants';
import { GameState, LineType } from '../types';

interface GridProps {
  gameState: GameState;
  onLineClick: (type: LineType, row: number, col: number) => void;
  rows: number;
  cols: number;
}

// Helper to check if a line is filled
const isHLineFilled = (gameState: GameState, r: number, c: number) => gameState.hLines[r]?.[c];
const isVLineFilled = (gameState: GameState, r: number, c: number) => gameState.vLines[r]?.[c];

const Grid: React.FC<GridProps> = ({ gameState, onLineClick, rows, cols }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Calculate natural width of the grid board including padding
      // Grid has p-4 (16px*2) on mobile, sm:p-8 (32px*2) on desktop
      const gridPadding = window.innerWidth < 640 ? 32 : 64; 
      const boardWidth = cols * CORNER_SIZE + (cols - 1) * CELL_SIZE + gridPadding;
      
      // App container padding is p-4 (32px) + potential scrollbar buffer
      const availableWidth = window.innerWidth - 32; 

      if (boardWidth > availableWidth) {
        setScale(availableWidth / boardWidth);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cols]);

  // We construct the grid using a flex column layout of rows.
  // Each "Visual Row" consists of dots and Horizontal Lines.
  // Between Visual Rows, we have Vertical Lines and Squares.
  
  const renderHorizontalRow = (rowIndex: number) => {
    const items = [];
    for (let col = 0; col < cols; col++) {
      // The Dot
      items.push(
        <div 
          key={`dot-${rowIndex}-${col}`} 
          className="relative z-20 flex-shrink-0 flex items-center justify-center"
          style={{ width: CORNER_SIZE, height: CORNER_SIZE }}
        >
          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-800 shadow-sm transition-transform hover:scale-150" />
        </div>
      );

      // The Horizontal Line (if not last column)
      if (col < cols - 1) {
        const isFilled = isHLineFilled(gameState, rowIndex, col);

        items.push(
          <div 
            key={`h-${rowIndex}-${col}`}
            className="relative flex items-center justify-center flex-shrink-0"
            style={{ width: CELL_SIZE, height: CORNER_SIZE }} // Height matches corner size for alignment
            onClick={() => !isFilled && !gameState.winner && onLineClick('horizontal', rowIndex, col)}
          >
            {/* Hit area helper - Increased to h-10 for accessibility when scaled */}
            <div 
              className={`absolute left-0 right-0 h-10 cursor-pointer z-10 hover:bg-blue-200/30 rounded transition-colors ${!isFilled && !gameState.winner ? 'hover:opacity-100' : 'hover:opacity-0'} opacity-0`} 
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            
            {/* The visible line */}
            <div 
              className={`h-1 rounded-full transition-all duration-300 ease-out ${
                isFilled 
                  ? 'bg-slate-800 w-full opacity-100' 
                  : 'bg-slate-300 w-full opacity-0'
              }`}
            />
          </div>
        );
      }
    }
    return (
      <div key={`row-h-${rowIndex}`} className="flex items-center">
        {items}
      </div>
    );
  };

  const renderVerticalRow = (rowIndex: number) => {
    // This row contains Vertical Lines and Squares
    // rowIndex here corresponds to the square row index (0 to rows - 2)
    const items = [];

    for (let col = 0; col < cols; col++) {
      // Vertical Line
      const isFilled = isVLineFilled(gameState, rowIndex, col);
      
      items.push(
        <div 
          key={`v-${rowIndex}-${col}`}
          className="relative flex flex-col items-center justify-start flex-shrink-0"
          style={{ height: CELL_SIZE, width: CORNER_SIZE }} // Width matches CORNER_SIZE
          onClick={() => !isFilled && !gameState.winner && onLineClick('vertical', rowIndex, col)}
        >
          {/* Hit area helper - Increased to w-10 for accessibility when scaled */}
          <div 
            className={`absolute top-0 bottom-0 w-10 cursor-pointer z-10 hover:bg-blue-200/30 rounded transition-colors ${!isFilled && !gameState.winner ? 'hover:opacity-100' : 'hover:opacity-0'} opacity-0`}
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          />
          
          {/* The visible line */}
          <div 
            className={`w-1 rounded-full transition-all duration-300 ease-out ${
              isFilled 
                ? 'bg-slate-800 h-full opacity-100' 
                : 'bg-slate-300 h-full opacity-0'
            }`}
          />
        </div>
      );

      // The Square (if not last column)
      if (col < cols - 1) {
        const owner = gameState.squares[rowIndex]?.[col];
        items.push(
          <div 
            key={`sq-${rowIndex}-${col}`}
            className="flex items-center justify-center relative flex-shrink-0"
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          >
            {owner && (
              <span className={`text-2xl sm:text-3xl font-bold select-none animate-bounce-in ${
                owner === PLAYER_X ? 'text-blue-600' : 'text-red-500'
              }`}>
                {owner}
              </span>
            )}
          </div>
        );
      }
    }

    return (
      <div key={`row-v-${rowIndex}`} className="flex items-start">
        {items}
      </div>
    );
  };

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
      <div className="inline-block p-4 sm:p-8 bg-white border border-slate-200 shadow-xl rounded-sm select-none">
        {Array.from({ length: rows }).map((_, r) => (
          <React.Fragment key={r}>
            {renderHorizontalRow(r)}
            {r < rows - 1 && renderVerticalRow(r)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default memo(Grid);