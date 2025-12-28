import React, { useState, useEffect } from 'react';
import DotsGame from './components/DotsGame';
import ZipGame from './components/ZipGame';
import GameLauncher from './components/GameLauncher';

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

  if (activeGame === 'DOTS') {
    return (
      <DotsGame 
        onBackToLauncher={() => setActiveGame('LAUNCHER')} 
      />
    );
  }

  if (activeGame === 'ZIP') {
    return (
      <ZipGame 
        onBackToLauncher={() => setActiveGame('LAUNCHER')} 
        theme={theme}
      />
    );
  }

  return (
    <GameLauncher 
      onSelectGame={setActiveGame} 
      theme={theme} 
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;