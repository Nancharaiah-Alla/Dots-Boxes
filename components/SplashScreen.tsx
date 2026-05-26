import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  theme: 'light' | 'dark';
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, theme }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full flex-1 z-50">
      <div className="relative animate-bounce-in flex flex-col items-center justify-center">
        <h1 className="text-6xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tighter mb-4 text-shadow-sm">
          MindGrid
        </h1>
        <div className="w-16 h-1 mt-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default SplashScreen;
