import React, { useState, useEffect } from 'react';

interface SetupScreenProps {
  onStart: (config: { p1Name: string; p2Name: string; gridSize: number }) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState(6);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    
    checkStandalone();
    window.addEventListener('resize', checkStandalone);

    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      (window as any).deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('resize', checkStandalone);
    }
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
          (window as any).deferredPrompt = null;
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ p1Name, p2Name, gridSize });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto animate-in">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 w-full relative transition-all">
        
        <div className="mb-8 text-center">
           <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Game Setup</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Player Names */}
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500">
                <span className="font-bold text-lg">X</span>
              </div>
              <input 
                type="text" 
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                maxLength={12}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-750"
                placeholder="Player 1 Name"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                <span className="font-bold text-lg">O</span>
              </div>
              <input 
                type="text" 
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                maxLength={12}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-750"
                placeholder="Player 2 Name"
              />
            </div>
          </div>

          {/* Grid Size Selection */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest text-center">Grid Size</label>
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex justify-between relative">
              {[6, 8, 10].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGridSize(size)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 relative z-10 ${
                    gridSize === size 
                      ? 'text-white shadow-lg' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {size}x{size}
                  {gridSize === size && (
                    <div className="absolute inset-0 bg-slate-800 dark:bg-slate-600 rounded-xl -z-10 animate-in"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all text-lg tracking-wide"
            >
              Start Game
            </button>

            {!isStandalone && installPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>↓</span> Install App
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;