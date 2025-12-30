import React, { useState, useCallback, useRef } from 'react';
import { DataConnection, Peer } from 'peerjs';
import { 
  PLAYER_X, 
  PLAYER_O, 
  Player 
} from '../constants';
import { GameState, LineType, GameConfig, NetworkMessage } from '../types';
import Grid from './Grid';
import ScoreBoard from './ScoreBoard';
import SetupScreen from './SetupScreen';
import MenuScreen from './MenuScreen';
import OnlineSetup from './OnlineSetup';

type ViewState = 'MENU' | 'SETUP_OFFLINE' | 'SETUP_ONLINE' | 'GAME';

const createInitialState = (rows: number, cols: number): GameState => {
  const hLines = Array(rows).fill(null).map(() => Array(cols - 1).fill(false));
  const vLines = Array(rows - 1).fill(null).map(() => Array(cols).fill(false));
  const squares = Array(rows - 1).fill(null).map(() => Array(cols - 1).fill(null));

  return {
    hLines,
    vLines,
    squares,
    currentPlayer: PLAYER_X,
    scores: { [PLAYER_X]: 0, [PLAYER_O]: 0 },
    winner: null,
    moveHistory: []
  };
};

interface DotsGameProps {
  onBackToLauncher: () => void;
}

const DotsGame: React.FC<DotsGameProps> = ({ onBackToLauncher }) => {
  const [view, setView] = useState<ViewState>('MENU');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  const connectionRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<Peer | null>(null);

  const processMove = (prev: GameState, type: LineType, r: number, c: number, rows: number, cols: number): GameState => {
      if (type === 'horizontal') {
        if (prev.hLines[r][c]) return prev; 
      } else {
        if (prev.vLines[r][c]) return prev;
      }

      const newHLines = prev.hLines.map(row => [...row]);
      const newVLines = prev.vLines.map(row => [...row]);
      const newSquares = prev.squares.map(row => [...row]);
      let newScores = { ...prev.scores };
      let squareCompleted = false;

      if (type === 'horizontal') newHLines[r][c] = true;
      else newVLines[r][c] = true;

      const ROWS = rows;
      const COLS = cols;

      if (type === 'horizontal') {
        if (r > 0 && newHLines[r-1][c] && newHLines[r][c] && newVLines[r-1][c] && newVLines[r-1][c+1]) {
            newSquares[r-1][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
        if (r < ROWS - 1 && newHLines[r][c] && newHLines[r+1][c] && newVLines[r][c] && newVLines[r][c+1]) {
            newSquares[r][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
      } else {
        if (c > 0 && newHLines[r][c-1] && newHLines[r+1][c-1] && newVLines[r][c-1] && newVLines[r][c]) {
            newSquares[r][c-1] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
        if (c < COLS - 1 && newHLines[r][c] && newHLines[r+1][c] && newVLines[r][c] && newVLines[r][c+1]) {
            newSquares[r][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
      }

      const totalSquares = (ROWS - 1) * (COLS - 1);
      const filledSquares = newScores[PLAYER_X] + newScores[PLAYER_O];
      let winner = null;
      if (filledSquares === totalSquares) {
        if (newScores[PLAYER_X] > newScores[PLAYER_O]) winner = PLAYER_X;
        else if (newScores[PLAYER_O] > newScores[PLAYER_X]) winner = PLAYER_O;
        else winner = 'Draw';
      }

      const nextPlayer = squareCompleted ? prev.currentPlayer : (prev.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);

      return {
        ...prev,
        hLines: newHLines,
        vLines: newVLines,
        squares: newSquares,
        scores: newScores,
        currentPlayer: nextPlayer,
        winner: winner as any
      };
  };

  const handleStartOffline = (config: { p1Name: string; p2Name: string; gridSize: number }) => {
    const fullConfig: GameConfig = { ...config, mode: 'OFFLINE' };
    setGameConfig(fullConfig);
    setGameState(createInitialState(config.gridSize, config.gridSize));
    setView('GAME');
  };

  const handleStartOnline = (config: GameConfig, conn: DataConnection, peer: Peer) => {
    connectionRef.current = conn;
    peerRef.current = peer;
    setGameConfig(config);
    setGameState(createInitialState(config.gridSize, config.gridSize));
    setView('GAME');

    conn.on('data', (data: any) => {
      const msg = data as NetworkMessage;
      if (msg.type === 'MOVE') {
        setGameState(prev => {
          if (!prev) return null;
          return processMove(prev, msg.lineType, msg.r, msg.c, config.gridSize, config.gridSize);
        });
      } else if (msg.type === 'RESTART') {
        setGameState(createInitialState(config.gridSize, config.gridSize));
      } else if (msg.type === 'QUIT') {
        alert('Opponent has left the game.');
        quitGame();
      }
    });

    conn.on('close', () => {
      alert('Connection lost.');
      quitGame();
    });
  };

  const quitGame = () => {
    if (connectionRef.current) {
      try { connectionRef.current.send({ type: 'QUIT' }); } catch(e) {}
      connectionRef.current.close();
      connectionRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setGameConfig(null);
    setGameState(null);
    setView('MENU');
  };

  const resetGame = () => {
    if (!gameConfig) return;
    
    if (gameConfig.mode === 'ONLINE') {
        if (window.confirm("Do you want to leave the game?")) {
            quitGame();
        }
       return;
    }

    setGameState(createInitialState(gameConfig.gridSize, gameConfig.gridSize));
  };

  const handleLineClick = useCallback((type: LineType, r: number, c: number) => {
    if (!gameConfig || !gameState) return;
    
    if (gameConfig.mode === 'ONLINE' && gameConfig.myPlayer !== gameState.currentPlayer) {
      return; 
    }

    setGameState(prev => {
      if (!prev) return null;
      const newState = processMove(prev, type, r, c, gameConfig.gridSize, gameConfig.gridSize);
      
      if (gameConfig.mode === 'ONLINE' && connectionRef.current) {
         if (newState !== prev) {
             const msg: NetworkMessage = { type: 'MOVE', lineType: type, r, c };
             connectionRef.current.send(msg);
         }
      }
      
      return newState;
    });
  }, [gameConfig, gameState]);
  
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <div className="absolute top-4 left-4 z-50">
       <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
          <span className="text-lg">←</span> Back
       </button>
    </div>
  );

  if (view === 'MENU') {
    return (
      <>
        <BackButton onClick={onBackToLauncher} />
        <MenuScreen onSelectMode={(mode) => setView(mode === 'ONLINE' ? 'SETUP_ONLINE' : 'SETUP_OFFLINE')} />
      </>
    );
  }

  if (view === 'SETUP_OFFLINE') {
    return (
      <>
        <BackButton onClick={() => setView('MENU')} />
        <SetupScreen onStart={handleStartOffline} />
      </>
    );
  }

  if (view === 'SETUP_ONLINE') {
    return (
      <>
        <BackButton onClick={() => setView('MENU')} />
        <OnlineSetup onStartGame={handleStartOnline} />
      </>
    );
  }

  if (!gameConfig || !gameState) return null;

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <button 
            onClick={quitGame}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 font-bold transition-all backdrop-blur shadow-sm"
          >
            ✕
        </button>
      </div>

      {gameConfig.mode === 'ONLINE' && (
             <div className="absolute right-4 top-4 z-30 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs font-bold text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                 Room: {gameConfig.roomId}
             </div>
      )}

      {/* Game Content Container - Allows scrolling of the grid while keeping header available */}
      <div className="flex flex-col h-full overflow-hidden pt-16 sm:pt-6">
        <ScoreBoard 
          scores={gameState.scores} 
          currentPlayer={gameState.currentPlayer} 
          winner={gameState.winner}
          onReset={resetGame}
          p1Name={gameConfig.p1Name}
          p2Name={gameConfig.p2Name}
          myPlayer={gameConfig.myPlayer}
        />

        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex items-start justify-center pb-8 px-4 game-scroll">
           <Grid 
             gameState={gameState} 
             onLineClick={handleLineClick} 
             rows={gameConfig.gridSize} 
             cols={gameConfig.gridSize} 
             disabled={gameConfig.mode === 'ONLINE' && gameState.currentPlayer !== gameConfig.myPlayer}
            />
        </div>
      </div>
    </div>
  );
}

export default DotsGame;