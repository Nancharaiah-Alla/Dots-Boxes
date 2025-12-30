import React, { useState, useEffect } from 'react';
import DotsGame from './components/DotsGame';
import ZipGame from './components/ZipGame';
import GameLauncher from './components/GameLauncher';
import AtmosphereLayer from './components/AtmosphereLayer';
import BreakingTransition from './components/BreakingTransition';
import { AtmosphereType } from './types';

type AppState = 'LAUNCHER' | 'DOTS' | 'ZIP';

function App() {
  const [activeGame, setActiveGame] = useState<AppState>('LAUNCHER');
  
  // Theme State managed globally
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  const [atmosphere, setAtmosphere] = useState<AtmosphereType>('NONE');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Apply theme to document and update status bar color for PWA/TWA
  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (theme === 'dark') {
      root.classList.add('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
    } else {
      root.classList.remove('dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#fdfbf7');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Monitor network status, visibility for performance, and URL routing
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.documentElement.classList.add('paused');
      } else {
        document.documentElement.classList.remove('paused');
      }
    };
    
    // Simple routing logic for browser back button
    const handlePopState = () => {
       setActiveGame('LAUNCHER');
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetAtmosphere = (type: AtmosphereType) => {
    if (type === 'STRANGER_THINGS') {
        setIsBreaking(true);
        setAtmosphere(type);
        setTheme('dark');
        setTimeout(() => {
            setIsBreaking(false);
        }, 1000);
    } else {
        setAtmosphere(type);
    }
  };

  const navigateHome = () => {
    // Robustly handle History API
    // This prevents "Failed to execute 'pushState'" errors in restricted preview environments (blobs/iframes)
    const isStandardProtocol = ['http:', 'https:'].includes(window.location.protocol);
    
    if (isStandardProtocol) {
      try {
        if (window.location.pathname !== '/') {
           window.history.pushState({}, '', '/');
        }
      } catch (e) {
        // Suppress history errors in restricted environments
        console.debug('History API restricted, navigation handled internally.');
      }
    }
    setActiveGame('LAUNCHER');
  };

  return (
    <>
      <AtmosphereLayer type={atmosphere} />
      {isBreaking && <BreakingTransition />}
      
      {/* Main Content Wrapper */}
      <div className={`relative h-full w-full flex flex-col transition-transform ${isBreaking ? 'animate-shake-hard' : ''} ${atmosphere === 'STRANGER_THINGS' ? 'upside-down-mode' : ''}`}>
        
        {activeGame === 'DOTS' && (
          <DotsGame 
            onBackToLauncher={navigateHome} 
          />
        )}

        {activeGame === 'ZIP' && (
          <ZipGame 
            onBackToLauncher={navigateHome} 
            theme={theme}
          />
        )}

        {activeGame === 'LAUNCHER' && (
          <GameLauncher 
            onSelectGame={setActiveGame} 
            theme={theme} 
            onToggleTheme={toggleTheme}
            currentAtmosphere={atmosphere}
            onSetAtmosphere={handleSetAtmosphere}
          />
        )}
      </div>

      {/* Minimal Offline Banner */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-md px-4 py-3 flex items-center justify-center gap-3 shadow-lg border-t border-white/10 animate-in">
           <span className="text-lg">📡</span>
           <span className="text-xs sm:text-sm font-bold tracking-wide">You are currently offline. Online play is unavailable.</span>
        </div>
      )}
    </>
  );
}

export default App;