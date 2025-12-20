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
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    
    checkStandalone();
    window.addEventListener('resize', checkStandalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // If we captured the prompt, we can hide instructions if they were open
      setShowInstructions(false);
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
          setShowInstructions(false);
        }
      });
    } else {
      // If no prompt available (iOS or already installed/dismissed), show manual instructions
      setShowInstructions(prev => !prev);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ p1Name, p2Name, gridSize });
  };
  
  // Simple check for iOS to customize instructions
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-300 rounded-lg shadow-xl p-8 w-full relative">
        
        <h1 className="text-4xl font-bold text-slate-800 text-center mb-8" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
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
                className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 font-bold text-slate-700 bg-blue-50/50"
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
                className="w-full px-4 py-2 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-400 font-bold text-slate-700 bg-red-50/50"
                placeholder="Name"
              />
            </div>
          </div>

          {/* Grid Size Selection */}
          <div>
            <label className="block text-slate-500 text-sm font-bold mb-3 uppercase tracking-wide text-center">Select Grid Size</label>
            <div className="flex justify-between gap-2">
              {[6, 8, 10].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGridSize(size)}
                  className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all transform hover:-translate-y-1 ${
                    gridSize === size 
                      ? 'bg-slate-800 text-white border-slate-800 shadow-lg' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
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
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all text-xl"
            >
              Start Game
            </button>

            {/* Install Button - Render unless already in standalone mode */}
            {!isStandalone && (
              <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-300">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all text-lg flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Install App
                </button>

                {/* Instructions Helper */}
                {showInstructions && (
                  <div className="text-sm bg-blue-50 border border-blue-200 text-slate-700 p-3 rounded-md text-center">
                    {isIOS ? (
                      <p>
                        To install: tap <strong>Share</strong> <span className="inline-block align-middle"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg></span> then <strong>"Add to Home Screen"</strong>
                      </p>
                    ) : (
                      <p>
                        Tap your browser menu (⋮) and select <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;