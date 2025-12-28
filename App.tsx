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

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetAtmosphere = (type: AtmosphereType) => {
    if (type === 'STRANGER_THINGS') {
        setIsBreaking(true);
        setAtmosphere(type);
        setTheme('dark');
        // Stop breaking animation after 1 second
        setTimeout(() => {
            setIsBreaking(false);
        }, 1000);
    } else {
        setAtmosphere(type);
    }
  };

  return (
    <>
      <AtmosphereLayer type={atmosphere} />
      {isBreaking && <BreakingTransition />}
      
      {/* Main Content Wrapper - shakes when breaking, applies text flip when upside down */}
      <div className={`relative h-full w-full flex flex-col transition-transform ${isBreaking ? 'animate-shake-hard' : ''} ${atmosphere === 'STRANGER_THINGS' ? 'upside-down-mode' : ''}`}>
        
        {activeGame === 'DOTS' && (
          <DotsGame 
            onBackToLauncher={() => setActiveGame('LAUNCHER')} 
          />
        )}

        {activeGame === 'ZIP' && (
          <ZipGame 
            onBackToLauncher={() => setActiveGame('LAUNCHER')} 
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
    </>
  );
}

export default App;