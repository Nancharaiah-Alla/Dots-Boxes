import React from 'react';

interface MenuScreenProps {
  onSelectMode: (mode: 'OFFLINE' | 'ONLINE') => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto animate-in">
      <div className="bg-white/95 backdrop-blur-md border-2 border-slate-300 rounded-xl shadow-xl p-8 w-full text-center relative overflow-hidden">
        
        {/* Decorative Grid Background for Card */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-800 mb-2 tracking-tight relative z-10" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.05)' }}>
          Dots & Boxes
        </h1>
        <p className="text-slate-500 text-lg mb-10 font-medium relative z-10">Capture the squares!</p>

        <div className="flex flex-col gap-4 relative z-10">
          <button
            onClick={() => onSelectMode('OFFLINE')}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 transition-all text-xl flex items-center justify-center gap-3 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
            Pass & Play (Offline)
          </button>

          <button
            onClick={() => onSelectMode('ONLINE')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all text-xl flex items-center justify-center gap-3 group"
          >
             <span className="text-2xl group-hover:scale-110 transition-transform">🌐</span>
            Play Online
          </button>
        </div>

        <div className="mt-8 text-slate-400 text-sm">
          v1.2.0 • Web PWA
        </div>
      </div>
    </div>
  );
};

export default MenuScreen;