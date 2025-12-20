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

    // Check if the event was already captured globally in index.html
    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
    }

    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Update global for consistency
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
      // Trigger the native install prompt
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
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto">
      <div className="bg-white/95 backdrop-blur-md border-2 border-slate-300 rounded-xl shadow-xl p-6 sm:p-8 w-full relative">
        
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 text-center mb-8 tracking-tight" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>
          Dots & Boxes
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Player Names */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-500 text-sm font-bold mb-2 uppercase tracking-wide">Player 1 (X)</label>
              <input 
                type="text" 
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                maxLength={12}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 font-bold text-slate-800 bg-blue-50 focus:bg-white transition-colors placeholder-slate-400"
                style={{ color: '#1e293b', backgroundColor: '#eff6ff' }} // Force colors inline to override any dark mode
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-sm font-bold mb-2 uppercase tracking-wide">Player 2 (O)</label>
              <input 
                type="text" 
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                maxLength={12}
                className="w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 font-bold text-slate-800 bg-red-50 focus:bg-white transition-colors placeholder-slate-400"
                style={{ color: '#1e293b', backgroundColor: '#fef2f2' }} // Force colors inline
                placeholder="Name"
              />
            </div>
          </div>

          {/* Grid Size Selection */}
          <div>
            <label className="block text-slate-500 text-sm font-bold mb-3 uppercase tracking-wide text-center">Select Grid Size</label>
            <div className="flex justify-between gap-3">
              {[6, 8, 10].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGridSize(size)}
                  className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all transform active:scale-95 ${
                    gridSize === size 
                      ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                  }`}
                  style={gridSize === size ? { backgroundColor: '#1e293b', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#64748b' }}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {/* Start Button */}
            <button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all text-xl uppercase tracking-wide"
              style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
            >
              Start Game
            </button>

            {/* Install Button - Render ONLY if prompt is available (Android/Desktop) and not installed */}
            {!isStandalone && installPrompt && (
              <div className="flex flex-col gap-2 animate-in">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl border-2 border-slate-200 transition-all text-base flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install App
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;