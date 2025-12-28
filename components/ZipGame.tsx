import React, { useState, useEffect } from 'react';

interface ZipGameProps {
  onBackToLauncher: () => void;
  theme: 'light' | 'dark';
}

type Level = 'EASY' | 'MEDIUM' | 'HARD';
type Point = { r: number; c: number };

const posKey = (r: number, c: number) => `${r},${c}`;

const ZipGame: React.FC<ZipGameProps> = ({ onBackToLauncher, theme }) => {
  const [view, setView] = useState<'MENU' | 'GAME'>('MENU');
  const [level, setLevel] = useState<Level>('EASY');
  const [gridSize, setGridSize] = useState(4);
  
  const [fixedCells, setFixedCells] = useState<Map<string, number>>(new Map());
  const [path, setPath] = useState<Point[]>([]); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [win, setWin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const getGridSize = (lvl: Level) => {
    switch(lvl) {
      case 'EASY': return 4;
      case 'MEDIUM': return 5;
      case 'HARD': return 6;
      default: return 4;
    }
  };

  const startGame = async (lvl: Level) => {
    const size = getGridSize(lvl);
    setGridSize(size);
    setLevel(lvl);
    setIsGenerating(true);
    setView('GAME');
    
    setTimeout(() => {
        generatePuzzle(size);
        setIsGenerating(false);
    }, 100);
  };

  const generatePuzzle = (size: number) => {
    const totalCells = size * size;
    const solutionPath: Point[] = [];
    const visited = new Set<string>();

    const isValid = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size;

    const findPath = (curr: Point): boolean => {
       solutionPath.push(curr);
       visited.add(posKey(curr.r, curr.c));

       if (solutionPath.length === totalCells) return true;

       const neighbors = [
         { r: curr.r - 1, c: curr.c },
         { r: curr.r + 1, c: curr.c },
         { r: curr.r, c: curr.c - 1 },
         { r: curr.r, c: curr.c + 1 },
       ].filter(n => isValid(n.r, n.c) && !visited.has(posKey(n.r, n.c)));

       for (let i = neighbors.length - 1; i > 0; i--) {
           const j = Math.floor(Math.random() * (i + 1));
           [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
       }

       for (const n of neighbors) {
           if (findPath(n)) return true;
       }

       visited.delete(posKey(curr.r, curr.c));
       solutionPath.pop();
       return false;
    };

    let attempts = 0;
    while(attempts < 50) {
        solutionPath.length = 0;
        visited.clear();
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if (findPath({r, c})) break;
        attempts++;
    }

    if (solutionPath.length !== totalCells) {
        setFixedCells(new Map());
        setPath([]);
        return;
    }

    const fixed = new Map<string, number>();
    fixed.set(posKey(solutionPath[0].r, solutionPath[0].c), 1);
    fixed.set(posKey(solutionPath[totalCells-1].r, solutionPath[totalCells-1].c), totalCells);

    const numHints = Math.floor(totalCells * 0.35); 
    for(let i = 0; i < numHints; i++) {
        const idx = Math.floor(Math.random() * (totalCells - 2)) + 1; 
        const p = solutionPath[idx];
        fixed.set(posKey(p.r, p.c), idx + 1);
    }

    setFixedCells(fixed);
    setPath([solutionPath[0]]);
    setWin(false);
  };

  const resetCurrentLevel = () => {
    let startKey: string | undefined;
    for (const [key, val] of fixedCells) {
      if (val === 1) {
        startKey = key;
        break;
      }
    }
    if (startKey) {
        const [rStr, cStr] = startKey.split(',');
        setPath([{ r: Number(rStr), c: Number(cStr) }]);
        setWin(false);
    }
  };

  const getPathIndex = (r: number, c: number) => {
    return path.findIndex(p => p.r === r && p.c === c);
  };

  const handlePointerDown = (r: number, c: number) => {
    if (win) return;
    const index = getPathIndex(r, c);
    if (index === path.length - 1) {
        setIsDrawing(true);
    }
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (!isDrawing || win) return;

    const lastPoint = path[path.length - 1];
    const index = getPathIndex(r, c);

    if (path.length > 1 && index === path.length - 2) {
      const currentVal = path.length;
      if (currentVal > 1) { 
         setPath(prev => prev.slice(0, -1));
      }
      return;
    }

    if (index === -1) {
      const isAdjacent = Math.abs(lastPoint.r - r) + Math.abs(lastPoint.c - c) === 1;
      
      if (isAdjacent) {
        const nextVal = path.length + 1;
        const key = posKey(r, c);
        
        if (fixedCells.has(key)) {
            const requiredVal = fixedCells.get(key);
            if (requiredVal !== nextVal) {
                return; 
            }
        }
        
        const newPath = [...path, { r, c }];
        setPath(newPath);

        if (newPath.length === gridSize * gridSize) {
          setWin(true);
          setIsDrawing(false);
        }
      }
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (win) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target) {
        const cell = target.closest('[data-cell]');
        if (cell) {
             const r = parseInt(cell.getAttribute('data-row') || '-1', 10);
             const c = parseInt(cell.getAttribute('data-col') || '-1', 10);
             if (r !== -1 && c !== -1) {
                 handlePointerEnter(r, c);
             }
        }
    }
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    // Also listen for touchend globally to stop drawing
    window.addEventListener('touchend', handlePointerUp);
    return () => {
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('touchend', handlePointerUp);
    }
  }, []);

  const getCellColor = (val: number) => {
    const total = gridSize * gridSize;
    const hue = 200 + ((val / total) * 120); // Blue to Pink/Purple
    return `hsl(${hue}, 85%, 60%)`;
  };

  if (view === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto animate-in">
         <div className="absolute top-4 left-4 z-50">
           <button onClick={onBackToLauncher} className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full text-slate-600 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
              <span className="text-lg">←</span> Back
           </button>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl shadow-2xl p-8 w-full text-center relative overflow-hidden transition-all group">
          
           {/* Decorative */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-slate-900/40 opacity-100"></div>
           <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-fuchsia-500/10 dark:bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse"></div>

           <div className="relative z-10">
              <div className="text-6xl mb-4">🌈</div>
              <h1 className="text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight text-shadow-sm">
                Number Slide
              </h1>
              <p className="text-slate-500 dark:text-slate-300 mb-10 font-medium text-lg">Connect the flow.</p>
              
              <div className="flex flex-col gap-4">
                {[
                  { id: 'EASY', label: 'Easy', size: '4x4', color: 'from-green-500 to-emerald-600', icon: '🌱' },
                  { id: 'MEDIUM', label: 'Medium', size: '5x5', color: 'from-blue-500 to-indigo-600', icon: '💧' },
                  { id: 'HARD', label: 'Hard', size: '6x6', color: 'from-fuchsia-500 to-purple-600', icon: '🔥' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => startGame(item.id as Level)} 
                    className={`w-full relative overflow-hidden bg-gradient-to-r ${item.color} text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] group`}
                  >
                    <div className="flex items-center justify-between px-6">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-lg tracking-wider uppercase">{item.label}</span>
                      <span className="text-sm opacity-80 bg-black/20 px-2 py-1 rounded">{item.size}</span>
                    </div>
                  </button>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full dark:text-slate-200 bg-slate-50 dark:bg-[#0b1120]">
      {/* Header */}
      <header className="pt-6 pb-4 px-6 flex items-center justify-between z-10">
        <button 
          onClick={() => setView('MENU')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-all backdrop-blur"
        >
          ←
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Number Slide
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
               {level} • {gridSize}x{gridSize}
            </span>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* Decorative BG for Game */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/30 rounded-full blur-[100px]"></div>
        </div>

        {isGenerating ? (
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
               <div className="text-lg font-bold text-slate-500 dark:text-slate-400 animate-pulse">Building Grid...</div>
            </div>
        ) : (
            <div className="relative z-10 flex flex-col items-center">
                
                <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                   <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Progress</div>
                   <div className="text-xl font-black text-slate-800 dark:text-white font-mono">
                      {path.length} <span className="text-slate-400 text-base">/ {gridSize * gridSize}</span>
                   </div>
                </div>

                <div 
                  className="bg-slate-900/5 dark:bg-black/40 p-3 rounded-2xl backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 touch-none select-none shadow-2xl"
                  style={{
                     display: 'grid',
                     gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                     gap: '8px',
                  }}
                  onTouchMove={handleTouchMove}
                >
                   {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                     const r = Math.floor(i / gridSize);
                     const c = i % gridSize;
                     const key = posKey(r, c);
                     
                     const pathIndex = getPathIndex(r, c);
                     const isVisited = pathIndex !== -1;
                     const visitNum = pathIndex + 1;
                     const fixedNum = fixedCells.get(key);
                     const isFixed = fixedNum !== undefined;
                     const isHead = isVisited && visitNum === path.length;

                     const displayNum = isVisited ? visitNum : (isFixed ? fixedNum : '');

                     return (
                       <div
                         key={key}
                         data-cell="true"
                         data-row={r}
                         data-col={c}
                         onPointerDown={(e) => {
                             e.preventDefault(); 
                             handlePointerDown(r, c);
                         }}
                         onPointerEnter={(e) => {
                             handlePointerEnter(r, c);
                         }}
                         className={`
                            relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-300
                            ${isVisited 
                                ? 'scale-100 text-white shadow-lg z-10' 
                                : 'scale-95 bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-sm'
                            }
                            ${isFixed && !isVisited ? 'border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500' : ''}
                            ${isHead ? 'scale-110 ring-4 ring-white/30 z-20' : ''}
                         `}
                         style={{
                            background: isVisited ? getCellColor(visitNum) : undefined,
                            boxShadow: isVisited ? `0 4px 12px ${getCellColor(visitNum).replace(')', ', 0.4)')}` : undefined,
                         }}
                       >
                         {displayNum}
                         {isHead && !win && (
                             <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></div>
                         )}
                       </div>
                     );
                   })}
                </div>

                {/* Controls */}
                <div className="mt-8 flex gap-4">
                     {win ? (
                        <div className="animate-bounce-in flex flex-col items-center gap-4">
                            <div className="px-6 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-lg border border-green-200 dark:border-green-800">
                                Level Complete! 🎉
                            </div>
                            <button 
                                onClick={() => generatePuzzle(gridSize)}
                                className="px-8 py-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                Next Puzzle →
                            </button>
                        </div>
                     ) : (
                        <>
                            <button 
                                onClick={resetCurrentLevel}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                                title="Restart Level"
                            >
                                ↺
                            </button>
                            <button 
                                onClick={() => generatePuzzle(gridSize)}
                                className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-sm"
                            >
                                Skip Puzzle
                            </button>
                        </>
                     )}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default ZipGame;