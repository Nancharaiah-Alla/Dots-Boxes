import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DataConnection, Peer } from 'peerjs';
import { 
  PLAYER_X, 
  PLAYER_O, 
  Player, 
  SquareOwner 
} from './constants';
import { GameState, LineType, GameConfig, NetworkMessage } from './types';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import SetupScreen from './components/SetupScreen';
import MenuScreen from './components/MenuScreen';
import OnlineSetup from './components/OnlineSetup';

type ViewState = 'MENU' | 'SETUP_OFFLINE' | 'SETUP_ONLINE' | 'GAME';

// Initial state creation
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

function App() {
  const [view, setView] = useState<ViewState>('MENU');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  
  // PeerJS Connection References
  const connectionRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<Peer | null>(null);

  // Helper to process a move on the state
  const processMove = (prev: GameState, type: LineType, r: number, c: number, rows: number, cols: number): GameState => {
      // 1. Validate move (basic check, caller should also check)
      if (type === 'horizontal') {
        if (prev.hLines[r][c]) return prev; 
      } else {
        if (prev.vLines[r][c]) return prev;
      }

      // 2. Clone state
      const newHLines = prev.hLines.map(row => [...row]);
      const newVLines = prev.vLines.map(row => [...row]);
      const newSquares = prev.squares.map(row => [...row]);
      let newScores = { ...prev.scores };
      let squareCompleted = false;

      // 3. Mark the line
      if (type === 'horizontal') newHLines[r][c] = true;
      else newVLines[r][c] = true;

      // 4. Check for completed squares
      const ROWS = rows;
      const COLS = cols;

      if (type === 'horizontal') {
        // Above
        if (r > 0 && newHLines[r-1][c] && newHLines[r][c] && newVLines[r-1][c] && newVLines[r-1][c+1]) {
            newSquares[r-1][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
        // Below
        if (r < ROWS - 1 && newHLines[r][c] && newHLines[r+1][c] && newVLines[r][c] && newVLines[r][c+1]) {
            newSquares[r][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
      } else {
        // Left
        if (c > 0 && newHLines[r][c-1] && newHLines[r+1][c-1] && newVLines[r][c-1] && newVLines[r][c]) {
            newSquares[r][c-1] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
        // Right
        if (c < COLS - 1 && newHLines[r][c] && newHLines[r+1][c] && newVLines[r][c] && newVLines[r][c+1]) {
            newSquares[r][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
        }
      }

      // 5. Determine winner
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

    // Setup listener for incoming moves
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
    // If online, close connection and destroy peer
    if (connectionRef.current) {
      // Try send quit message
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

    // Offline Reset
    setGameState(createInitialState(gameConfig.gridSize, gameConfig.gridSize));
  };

  const handleLineClick = useCallback((type: LineType, r: number, c: number) => {
    if (!gameConfig || !gameState) return;
    
    // Online check: Is it my turn?
    if (gameConfig.mode === 'ONLINE' && gameConfig.myPlayer !== gameState.currentPlayer) {
      return; // Not your turn
    }

    setGameState(prev => {
      if (!prev) return null;
      const newState = processMove(prev, type, r, c, gameConfig.gridSize, gameConfig.gridSize);
      
      // If state changed and Online, send move
      if (gameConfig.mode === 'ONLINE' && connectionRef.current) {
         // Only send if move was valid (state changed, essentially check if lines differ)
         if (newState !== prev) {
             const msg: NetworkMessage = { type: 'MOVE', lineType: type, r, c };
             connectionRef.current.send(msg);
         }
      }
      
      return newState;
    });
  }, [gameConfig, gameState]);


  // RENDER LOGIC
  
  if (view === 'MENU') {
    return <MenuScreen onSelectMode={(mode) => setView(mode === 'ONLINE' ? 'SETUP_ONLINE' : 'SETUP_OFFLINE')} />;
  }

  if (view === 'SETUP_OFFLINE') {
    return <SetupScreen onStart={handleStartOffline} onBack={() => setView('MENU')} />;
  }

  if (view === 'SETUP_ONLINE') {
    return <OnlineSetup onStartGame={handleStartOnline} onBack={() => setView('MENU')} />;
  }

  // GAME VIEW
  if (!gameConfig || !gameState) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="pt-4 sm:pt-6 pb-2 px-4 text-center z-10 relative">
        <button 
          onClick={quitGame}
          className="absolute left-4 top-4 sm:top-6 text-slate-400 hover:text-slate-600 font-bold text-sm sm:text-base"
        >
          ← Quit
        </button>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
          Dots & Boxes
        </h1>
        {gameConfig.mode === 'ONLINE' && (
             <div className="text-xs text-blue-500 font-mono mt-1">
                 Room: {gameConfig.roomId}
             </div>
        )}
      </header>

      {/* Scoreboard */}
      <ScoreBoard 
        scores={gameState.scores} 
        currentPlayer={gameState.currentPlayer} 
        winner={gameState.winner}
        onReset={resetGame}
        p1Name={gameConfig.p1Name}
        p2Name={gameConfig.p2Name}
        myPlayer={gameConfig.myPlayer}
      />

      {/* Game Grid */}
      <main className="flex-1 game-scroll overflow-auto flex items-start justify-center p-4 sm:p-8">
         <Grid 
           gameState={gameState} 
           onLineClick={handleLineClick} 
           rows={gameConfig.gridSize} 
           cols={gameConfig.gridSize} 
           disabled={gameConfig.mode === 'ONLINE' && gameState.currentPlayer !== gameConfig.myPlayer}
          />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-slate-400 text-sm">
        {gameState.winner
          ? "Game Over!" 
          : gameConfig.mode === 'ONLINE' 
             ? (gameState.currentPlayer === gameConfig.myPlayer ? "It's your turn!" : `Waiting for ${gameState.currentPlayer === PLAYER_X ? gameConfig.p1Name : gameConfig.p2Name}...`)
             : `Current Turn: ${gameState.currentPlayer === PLAYER_X ? gameConfig.p1Name : gameConfig.p2Name}`
        }
      </footer>
    </div>
  );
}

export default App;