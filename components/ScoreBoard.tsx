import React from 'react';
import { Player, PLAYER_X, PLAYER_O } from '../constants';

interface ScoreBoardProps {
  scores: Record<Player, number>;
  currentPlayer: Player;
  winner: Player | 'Draw' | null;
  onReset: () => void;
  p1Name: string;
  p2Name: string;
  myPlayer?: Player; // 'X' or 'O' if online
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scores, currentPlayer, winner, onReset, p1Name, p2Name, myPlayer }) => {
  const isMyTurn = myPlayer ? currentPlayer === myPlayer : true;

  return (
    <div className="w-full max-w-2xl mx-auto mb-2 sm:mb-4 px-2 sm:px-4">
      <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-300 rounded-lg shadow-sm p-2 sm:p-4 flex flex-row items-center justify-between gap-2 sm:gap-4">
        
        {/* Player X Score */}
        <div className={`flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors duration-300 ${currentPlayer === PLAYER_X && !winner ? 'bg-blue-100 border-blue-200 border' : 'border border-transparent'}`}>
          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-lg sm:text-2xl font-bold text-blue-600">
            X
          </div>
          <div className="flex flex-col items-start min-w-[3rem] sm:min-w-[4rem]">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px]">
              {p1Name} {myPlayer === PLAYER_X ? '(You)' : ''}
            </span>
            <span className="text-xl sm:text-2xl font-bold leading-none">{scores[PLAYER_X]}</span>
          </div>
        </div>

        {/* Game Status */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {winner ? (
            <div className="text-sm sm:text-xl font-bold text-green-600 animate-bounce whitespace-nowrap">
              {winner === 'Draw' ? 'Draw!' : `${winner === PLAYER_X ? p1Name : p2Name} Wins!`}
            </div>
          ) : (
            <div className="text-sm sm:text-lg text-slate-600 whitespace-nowrap flex flex-col items-center justify-center">
              <div className="flex items-center gap-1">
                 <span className="font-bold text-slate-800 truncate max-w-[100px] sm:max-w-none">
                    {currentPlayer === PLAYER_X ? p1Name : p2Name}'s
                 </span> 
                 <span>Turn</span>
              </div>
              {myPlayer && (
                 <span className="text-xs font-medium text-slate-400">
                    {isMyTurn ? "Your move!" : "Waiting for opponent..."}
                 </span>
              )}
            </div>
          )}
          <button 
            onClick={onReset}
            className="mt-1 px-3 py-1 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full border border-slate-300 transition-colors whitespace-nowrap"
          >
            {myPlayer ? 'Leave Game' : 'Reset Game'}
          </button>
        </div>

        {/* Player O Score */}
        <div className={`flex items-center gap-1 sm:gap-3 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors duration-300 ${currentPlayer === PLAYER_O && !winner ? 'bg-red-100 border-red-200 border' : 'border border-transparent'}`}>
          <div className="flex flex-col items-end min-w-[3rem] sm:min-w-[4rem]">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px]">
              {p2Name} {myPlayer === PLAYER_O ? '(You)' : ''}
            </span>
            <span className="text-xl sm:text-2xl font-bold leading-none">{scores[PLAYER_O]}</span>
          </div>
          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-lg sm:text-2xl font-bold text-red-500">
            O
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScoreBoard;