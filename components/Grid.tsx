import React, { memo, useEffect, useState } from 'react';
import { PLAYER_X, CELL_SIZE, CORNER_SIZE } from '../constants';
import { GameState, LineType } from '../types';

interface GridProps {
  gameState: GameState;
  onLineClick: (type: LineType, row: number, col: number) => void;
  rows: number;
  cols: number;
  disabled?: boolean;
}

const isHLineFilled = (gameState: GameState, r: number, c: number) => gameState.hLines[r]?.[c];
const isVLineFilled = (gameState: GameState, r: number, c: number) => gameState.vLines[r]?.[c];

const Grid: React.FC<GridProps> = ({ gameState, onLineClick, rows, cols, disabled = false }) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const gridPadding = 64; // Account for the p-8 padding
      const boardWidth = cols * CORNER_SIZE + (cols - 1) * CELL_SIZE + gridPadding;
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - 180; // Account for scoreboard

      // Calculate width scale
      let newScale = 1;
      if (boardWidth > availableWidth) {
        newScale = (availableWidth - 32) / boardWidth;
      }
      
      // Check height constraint
      const boardHeight = rows * CORNER_SIZE + (rows - 1) * CELL_SIZE + gridPadding;
      if (boardHeight > availableHeight && availableHeight > 0) {
          const hScale = availableHeight / boardHeight;
          if (hScale < newScale) newScale = hScale;
      }
      
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cols, rows]);

  const renderHorizontalRow = (rowIndex: number) => {
    const items = [];
    for (let col = 0; col < cols; col++) {
      // DOT
      items.push(
        <div 
          key={`dot-${rowIndex}-${col}`} 
          className="relative z-20 flex-shrink-0 flex items-center justify-center"
          style={{ width: CORNER_SIZE, height: CORNER_SIZE }}
        >
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-slate-800 dark:bg-slate-300 shadow-[0_0_0_2px_rgba(255,255,255,1)] dark:shadow-[0_0_0_2px_rgba(30,41,59,1)]" />
        </div>
      );

      // H-LINE
      if (col < cols - 1) {
        const isFilled = isHLineFilled(gameState, rowIndex, col);
        const isInteractive = !disabled && !isFilled && !gameState.winner;

        items.push(
          <div 
            key={`h-${rowIndex}-${col}`}
            className={`relative flex items-center justify-center flex-shrink-0 group ${!isFilled && !disabled ? 'cursor-pointer' : ''}`}
            style={{ width: CELL_SIZE, height: CORNER_SIZE }} 
            onClick={() => isInteractive && onLineClick('horizontal', rowIndex, col)}
          >
            {/* Hit area */}
            <div className={`absolute -top-3 -bottom-3 left-0 right-0 z-10 ${isInteractive ? 'hover:bg-blue-500/10 dark:hover:bg-blue-400/10 rounded' : ''}`} />

            {/* Visual Line */}
            <div 
              className={`h-2 rounded-full transition-all duration-300 ease-out ${
                isFilled 
                  ? 'bg-slate-800 dark:bg-slate-100 w-[115%] z-10 shadow-md scale-100' 
                  : 'bg-slate-200 dark:bg-slate-700 w-full scale-100 group-hover:bg-blue-300 dark:group-hover:bg-blue-700'
              }`}
            />
          </div>
        );
      }
    }
    return (
      <div key={`row-h-${rowIndex}`} className="flex items-center leading-none">
        {items}
      </div>
    );
  };

  const renderVerticalRow = (rowIndex: number) => {
    const items = [];
    for (let col = 0; col < cols; col++) {
      const isFilled = isVLineFilled(gameState, rowIndex, col);
      const isInteractive = !disabled && !isFilled && !gameState.winner;
      
      // V-LINE
      items.push(
        <div 
          key={`v-${rowIndex}-${col}`}
          className={`relative flex flex-col items-center justify-start flex-shrink-0 group ${!isFilled && !disabled ? 'cursor-pointer' : ''}`}
          style={{ height: CELL_SIZE, width: CORNER_SIZE }}
          onClick={() => isInteractive && onLineClick('vertical', rowIndex, col)}
        >
          {/* Hit area */}
          <div className={`absolute -left-3 -right-3 top-0 bottom-0 z-10 ${isInteractive ? 'hover:bg-blue-500/10 dark:hover:bg-blue-400/10 rounded' : ''}`} />
          
          {/* Visual Line */}
          <div 
            className={`w-2 rounded-full transition-all duration-300 ease-out ${
              isFilled 
                ? 'bg-slate-800 dark:bg-slate-100 h-[115%] z-10 shadow-md scale-100' 
                : 'bg-slate-200 dark:bg-slate-700 h-full scale-100 group-hover:bg-blue-300 dark:group-hover:bg-blue-700'
            }`}
          />
        </div>
      );

      // SQUARE
      if (col < cols - 1) {
        const owner = gameState.squares[rowIndex]?.[col];
        items.push(
          <div 
            key={`sq-${rowIndex}-${col}`}
            className="flex items-center justify-center relative flex-shrink-0"
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          >
            {owner && (
              <div className="w-full h-full p-1 animate-pop">
                 <div className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center ${
                    owner === PLAYER_X 
                      ? 'bg-blue-500 text-white shadow-blue-500/50' 
                      : 'bg-red-500 text-white shadow-red-500/50'
                 }`}>
                   <span className="text-xl font-black">
                     {owner}
                   </span>
                 </div>
              </div>
            )}
          </div>
        );
      }
    }

    return (
      <div key={`row-v-${rowIndex}`} className="flex items-start leading-none">
        {items}
      </div>
    );
  };

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }} className="my-auto transition-transform duration-300 ease-out">
      <div className={`inline-flex flex-col p-8 bg-white dark:bg-[#1e293b] shadow-2xl dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-[2rem] select-none transition-all duration-500 border-[6px] border-slate-100 dark:border-slate-600 ${disabled && !gameState.winner ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}`}>
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