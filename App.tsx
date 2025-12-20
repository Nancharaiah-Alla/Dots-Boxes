import React, { useState, useCallback } from 'react';
import { 
  PLAYER_X, 
  PLAYER_O, 
  Player, 
  SquareOwner 
} from './constants';
import { GameState, LineType } from './types';
import Grid from './components/Grid';
import ScoreBoard from './components/ScoreBoard';
import SetupScreen from './components/SetupScreen';

interface GameConfig {
  p1Name: string;
  p2Name: string;
  gridSize: number;
}

// Initial state creation
const createInitialState = (rows: number, cols: number): GameState => {
  // H lines: rows x (cols - 1)
  const hLines = Array(rows).fill(null).map(() => Array(cols - 1).fill(false));
  
  // V lines: (rows - 1) x cols
  const vLines = Array(rows - 1).fill(null).map(() => Array(cols).fill(false));
  
  // Squares: (rows - 1) x (cols - 1)
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
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const startGame = (config: GameConfig) => {
    setGameConfig(config);
    setGameState(createInitialState(config.gridSize, config.gridSize));
    setIsGameEnded(false);
  };

  const resetGame = () => {
    // Go back to setup or restart with same config? 
    // Usually reset game means restart with same players.
    // If we want to go back to setup, we can add a different button.
    // Let's restart with same config for now.
    if (gameConfig) {
      setGameState(createInitialState(gameConfig.gridSize, gameConfig.gridSize));
      setIsGameEnded(false);
    }
  };

  const quitGame = () => {
    setGameConfig(null);
    setGameState(null);
  }

  const checkGameEnd = useCallback((squares: SquareOwner[][], scores: Record<Player, number>, rows: number, cols: number) => {
    const totalSquares = (rows - 1) * (cols - 1);
    const filledSquares = scores[PLAYER_X] + scores[PLAYER_O];
    
    if (filledSquares === totalSquares) {
      setIsGameEnded(true);
      if (scores[PLAYER_X] > scores[PLAYER_O]) return PLAYER_X;
      if (scores[PLAYER_O] > scores[PLAYER_X]) return PLAYER_O;
      return 'Draw';
    }
    return null;
  }, []);

  const handleLineClick = useCallback((type: LineType, r: number, c: number) => {
    if (!gameConfig) return;
    const { gridSize } = gameConfig;
    const ROWS = gridSize;
    const COLS = gridSize;

    setGameState(prev => {
      if (!prev) return null;

      // 1. Validate move
      if (type === 'horizontal') {
        if (prev.hLines[r][c]) return prev; // Already taken
      } else {
        if (prev.vLines[r][c]) return prev; // Already taken
      }

      // 2. Clone state deeper for mutation
      const newHLines = prev.hLines.map(row => [...row]);
      const newVLines = prev.vLines.map(row => [...row]);
      const newSquares = prev.squares.map(row => [...row]);
      let newScores = { ...prev.scores };
      let squareCompleted = false;

      // 3. Mark the line
      if (type === 'horizontal') {
        newHLines[r][c] = true;
      } else {
        newVLines[r][c] = true;
      }

      // 4. Check for completed squares
      if (type === 'horizontal') {
        // Check Square Above
        if (r > 0) {
          if (
            newHLines[r-1][c] && 
            newHLines[r][c] && 
            newVLines[r-1][c] && 
            newVLines[r-1][c+1]
          ) {
            newSquares[r-1][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
          }
        }
        // Check Square Below
        if (r < ROWS - 1) {
          if (
            newHLines[r][c] && 
            newHLines[r+1][c] && 
            newVLines[r][c] && 
            newVLines[r][c+1]
          ) {
            newSquares[r][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
          }
        }
      } 
      else { // Vertical
        // Check Square Left
        if (c > 0) {
          if (
            newHLines[r][c-1] && 
            newHLines[r+1][c-1] && 
            newVLines[r][c-1] && 
            newVLines[r][c]
          ) {
            newSquares[r][c-1] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
          }
        }
        // Check Square Right
        if (c < COLS - 1) {
          if (
            newHLines[r][c] && 
            newHLines[r+1][c] && 
            newVLines[r][c] && 
            newVLines[r][c+1]
          ) {
            newSquares[r][c] = prev.currentPlayer;
            newScores[prev.currentPlayer]++;
            squareCompleted = true;
          }
        }
      }

      // 5. Determine next player and winner
      const winner = checkGameEnd(newSquares, newScores, ROWS, COLS);
      const nextPlayer = squareCompleted ? prev.currentPlayer : (prev.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);

      return {
        ...prev,
        hLines: newHLines,
        vLines: newVLines,
        squares: newSquares,
        scores: newScores,
        currentPlayer: nextPlayer,
        winner: winner
      };
    });
  }, [gameConfig, checkGameEnd]);

  if (!gameConfig || !gameState) {
    return <SetupScreen onStart={startGame} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="pt-4 sm:pt-6 pb-2 px-4 text-center z-10 relative">
         {/* Quit/Back Button */}
        <button 
          onClick={quitGame}
          className="absolute left-4 top-4 sm:top-6 text-slate-400 hover:text-slate-600 font-bold text-sm sm:text-base"
        >
          ← Back
        </button>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
          Dots & Boxes
        </h1>
        <p className="text-slate-500 mt-2 text-lg hidden sm:block">Connect dots to claim squares!</p>
      </header>

      {/* Scoreboard */}
      <ScoreBoard 
        scores={gameState.scores} 
        currentPlayer={gameState.currentPlayer} 
        winner={gameState.winner}
        onReset={resetGame}
        p1Name={gameConfig.p1Name}
        p2Name={gameConfig.p2Name}
      />

      {/* Game Grid Container - Scrollable */}
      <main className="flex-1 game-scroll overflow-auto flex items-start justify-center p-4 sm:p-8">
         <Grid 
           gameState={gameState} 
           onLineClick={handleLineClick} 
           rows={gameConfig.gridSize} 
           cols={gameConfig.gridSize} 
          />
      </main>

      {/* Footer Instructions (Optional) */}
      <footer className="p-4 text-center text-slate-400 text-sm">
        {isGameEnded 
          ? "Game Over! Press Reset to play again." 
          : `Current Turn: ${gameState.currentPlayer === PLAYER_X ? gameConfig.p1Name : gameConfig.p2Name}`
        }
      </footer>
    </div>
  );
}

export default App;