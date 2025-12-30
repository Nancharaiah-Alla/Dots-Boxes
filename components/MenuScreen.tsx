import React, { useState, useEffect } from 'react';

interface MenuScreenProps {
  onSelectMode: (mode: 'OFFLINE' | 'ONLINE') => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onSelectMode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto animate-in">
      
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl shadow-2xl p-8 w-full text-center relative overflow-hidden transition-all duration-300 transform hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20">
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <div className="mb-6 inline-block p-4 bg-blue-50 dark:bg-slate-800 rounded-2xl shadow-inner transform rotate-3">
             <span className="text-5xl">🟦</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
            Dots & Boxes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 font-medium">Master the grid.</p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => onSelectMode('OFFLINE')}
              className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
                <span className="text-lg tracking-wide">Pass & Play</span>
              </div>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

            <button
              onClick={() => isOnline && onSelectMode('ONLINE')}
              disabled={!isOnline}
              className={`w-full relative overflow-hidden font-bold py-4 rounded-xl shadow-sm transition-all border-2 group
                ${isOnline 
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-200 hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] cursor-pointer' 
                  : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-70'
                }`}
            >
               <div className="flex items-center justify-center gap-3 relative z-10">
                <span className={`text-2xl ${isOnline ? 'group-hover:scale-110 transition-transform' : 'grayscale'}`}>🌐</span>
                <span className={`text-lg tracking-wide ${isOnline ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors' : ''}`}>
                  {isOnline ? 'Play Online' : 'Online Unavailable'}
                </span>
              </div>
            </button>
          </div>

          <div className="mt-8 text-slate-400 dark:text-slate-600 text-xs font-bold tracking-widest uppercase opacity-60">
            Strategy • Classic
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;