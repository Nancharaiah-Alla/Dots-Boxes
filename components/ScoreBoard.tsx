import React from 'react';
import { Player, PLAYER_X, PLAYER_O } from '../constants';

interface ScoreBoardProps {
  scores: Record<Player, number>;
  currentPlayer: Player;
  winner: Player | 'Draw' | null;
  onReset: () => void;
  p1Name: string;
  p2Name: string;
  myPlayer?: Player; 
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, currentPlayer, winner, onReset, p1Name, p2Name, myPlayer }) => {
  const isMyTurn = myPlayer ? currentPlayer === myPlayer : true;

  // Helper to determine active state styles
  const getPlayerStyles = (player: Player) => {
    const isActive = currentPlayer === player && !winner;
    const isWinner = winner === player;
    
    // Base styles
    let containerClass = "flex items-center gap-2 sm:gap-3 py-2 px-3 sm:px-4 rounded-2xl transition-all duration-300 relative overflow-hidden ";
    
    if (isWinner) {
      containerClass += "bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-400 scale-105 shadow-lg z-10";
    } else if (isActive) {
      if (player === PLAYER_X) containerClass += "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500 shadow-md scale-105 z-10";
      else containerClass += "bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500 shadow-md scale-105 z-10";
    } else {
      containerClass += "bg-transparent opacity-60 grayscale-[0.5] scale-95";
    }

    return containerClass;
  };

  return (
    <div className="w-full max-w-lg mx-auto mb-2 px-2 z-20 shrink-0">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xl p-1.5 flex items-stretch justify-between gap-1 sm:gap-4 transition-all duration-300">
        
        {/* Player X */}
        <div className={getPlayerStyles(PLAYER_X)}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-sm shrink-0">
            X
          </div>
          <div className="flex flex-col min-w-[40px] sm:min-w-[60px]">
             <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 leading-none mb-0.5 truncate max-w-[70px] sm:max-w-[100px]">
               {myPlayer === PLAYER_X ? 'YOU' : p1Name}
            </span>
            <span className="text-2xl sm:text-3xl font-black leading-none text-slate-800 dark:text-slate-100">
              {scores[PLAYER_X]}
            </span>
          </div>
        </div>

        {/* Center Info - Compact on Mobile */}
        <div className="flex flex-col items-center justify-center min-w-[60px] shrink-0">
          {winner ? (
            <div className="flex flex-col items-center animate-in">
               <span className="text-[10px] font-bold uppercase text-slate-400">Result</span>
               <span className={`text-xs sm:text-sm font-black text-center leading-tight ${winner === PLAYER_X ? 'text-blue-500' : winner === PLAYER_O ? 'text-red-500' : 'text-slate-500'}`}>
                 {winner === 'Draw' ? 'DRAW' : 'WINNER'}
               </span>
               <button onClick={onReset} className="mt-1 text-[10px] bg-slate-800 text-white px-2 py-1 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
                  RESTART
               </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Turn</span>
               <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-colors duration-300 ${currentPlayer === PLAYER_X ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`}></div>
            </div>
          )}
        </div>

        {/* Player O */}
        <div className={getPlayerStyles(PLAYER_O) + " text-right flex-row-reverse"}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-sm shrink-0">
            O
          </div>
          <div className="flex flex-col items-end min-w-[40px] sm:min-w-[60px]">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 leading-none mb-0.5 truncate max-w-[70px] sm:max-w-[100px]">
              {myPlayer === PLAYER_O ? 'YOU' : p2Name}
            </span>
            <span className="text-2xl sm:text-3xl font-black leading-none text-slate-800 dark:text-slate-100">
              {scores[PLAYER_O]}
            </span>
          </div>
        </div>

      </div>
      
      {myPlayer && !winner && (
         <div className={`text-center mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-opacity duration-300 ${isMyTurn ? 'opacity-100 text-green-600 dark:text-green-400' : 'opacity-50 text-slate-400'}`}>
           {isMyTurn ? "Your Turn" : "Opponent's Turn"}
         </div>
      )}
    </div>
  );
};

export default ScoreBoard;