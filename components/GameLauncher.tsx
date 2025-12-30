import React, { useState, useRef, useEffect } from 'react';
import { AtmosphereType } from '../types';

interface GameLauncherProps {
  onSelectGame: (game: 'DOTS' | 'ZIP' | 'PRIVACY') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentAtmosphere: AtmosphereType;
  onSetAtmosphere: (type: AtmosphereType) => void;
}

const GameLauncher: React.FC<GameLauncherProps> = ({ 
    onSelectGame, 
    theme, 
    onToggleTheme, 
    currentAtmosphere, 
    onSetAtmosphere 
}) => {
  const [hoveredGame, setHoveredGame] = useState<'DOTS' | 'ZIP' | null>(null);
  const [isAtmosphereMenuOpen, setIsAtmosphereMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAtmosphereMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const atmosphereOptions: { id: AtmosphereType; label: string; icon: string; color: string }[] = [
    { id: 'NONE', label: 'Default', icon: '∅', color: 'bg-slate-200 text-slate-600' },
    { id: 'STRANGER_THINGS', label: 'Upside Down', icon: '🕸️', color: 'bg-red-900 text-red-200' },
    { id: 'SUMMER', label: 'Summer', icon: '☀️', color: 'bg-orange-100 text-orange-600' },
    { id: 'RAINY', label: 'Rainy', icon: '🌧️', color: 'bg-blue-900 text-blue-200' },
    { id: 'WINTER', label: 'Winter', icon: '❄️', color: 'bg-blue-50 text-blue-400' },
    { id: 'SPRING', label: 'Spring', icon: '🌸', color: 'bg-pink-100 text-pink-500' },
  ];

  return (
    <div 
      className="relative flex flex-col items-center justify-center min-h-full w-full overflow-hidden transition-colors duration-500 bg-transparent"
    >
      
      {/* Default Dynamic Background Pattern (Only visible if Atmosphere is NONE or subtle) */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 ${currentAtmosphere !== 'NONE' ? 'opacity-10' : 'opacity-60 dark:opacity-40'}`}>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: theme === 'light' 
              ? 'radial-gradient(#94a3b8 1px, transparent 1px)' 
              : 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
          }}
        />
        {currentAtmosphere === 'NONE' && (
            <>
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
            </>
        )}
      </div>

      {/* Theme Toggle - Absolute Top Right */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-50">
        <button
          onClick={onToggleTheme}
          className="relative group overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 sm:p-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <div className="relative z-10 text-lg sm:text-xl">
             {theme === 'light' ? '☀️' : '🌙'}
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200 to-orange-100 dark:from-indigo-900 dark:to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl px-4 sm:px-8 py-4 sm:py-0 h-full justify-center">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-16 space-y-1 sm:space-y-4 animate-in shrink-0">
          <h1 className="text-4xl sm:text-8xl font-black text-slate-800 dark:text-white tracking-tighter drop-shadow-sm">
            MindGrid
          </h1>
          <p className="text-sm sm:text-2xl text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Select a cartridge to start
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 sm:gap-6 lg:gap-8 w-full justify-center items-stretch perspective-1000">
          
          {/* --- DOTS CARD --- */}
          <div 
            className={`
              relative flex-1 group cursor-pointer transition-all duration-500 ease-out transform
              ${hoveredGame === 'ZIP' ? 'blur-sm scale-95 opacity-60 grayscale-[0.5]' : 'opacity-100 scale-100'}
              ${hoveredGame === 'DOTS' ? 'lg:-translate-y-4 lg:rotate-y-2' : ''}
            `}
            onMouseEnter={() => setHoveredGame('DOTS')}
            onMouseLeave={() => setHoveredGame(null)}
            onClick={() => onSelectGame('DOTS')}
          >
            {/* Card Body */}
            <div className="h-full bg-white dark:bg-[#1e293b] rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-slate-100 dark:border-slate-700 p-4 sm:p-10 shadow-xl sm:shadow-2xl relative overflow-hidden isolate flex flex-col">
              
              {/* Background Graph Pattern */}
              <div 
                className="absolute inset-0 opacity-10 dark:opacity-5 transition-opacity duration-500 group-hover:opacity-20"
                style={{ 
                  backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`, 
                  backgroundSize: '20px 20px' 
                }} 
              />
              
              {/* Animated Accent Blob */}
              <div className="absolute -right-20 -top-20 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150 group-hover:bg-blue-500/20" />

              {/* Icon / Graphic */}
              <div className="relative mb-3 sm:mb-8 transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 origin-center shrink-0">
                 <div className="w-12 h-12 sm:w-24 sm:h-24 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-6xl shadow-inner border border-blue-200 dark:border-blue-800">
                   🟦
                 </div>
                 {/* Floating elements */}
                 <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 text-xl sm:text-4xl animate-bounce delay-75">✏️</div>
              </div>

              {/* Text Content */}
              <div className="relative z-10 flex flex-col flex-1">
                <h2 className="text-lg sm:text-4xl font-black text-slate-800 dark:text-slate-100 mb-1 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                  Dots & Boxes
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-lg font-medium leading-relaxed mb-3 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                  The classic strategy game. Outsmart your opponent.
                </p>
                
                {/* CTA Button */}
                <div className="mt-auto flex items-center gap-2 sm:gap-3 font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-xl group-hover:translate-x-2 transition-transform duration-300">
                  <span className="hidden sm:inline">Play Strategy</span>
                  <span className="sm:hidden">Play</span>
                  <span className="text-lg sm:text-2xl">→</span>
                </div>
              </div>

              {/* Hover Border Glow */}
              <div className="absolute inset-0 border-4 border-blue-500/0 rounded-2xl sm:rounded-[2rem] transition-all duration-300 group-hover:border-blue-500/20 pointer-events-none" />
            </div>
          </div>


          {/* --- SLIDE CARD --- */}
          <div 
            className={`
              relative flex-1 group cursor-pointer transition-all duration-500 ease-out transform
              ${hoveredGame === 'DOTS' ? 'blur-sm scale-95 opacity-60 grayscale-[0.5]' : 'opacity-100 scale-100'}
              ${hoveredGame === 'ZIP' ? 'lg:-translate-y-4 lg:-rotate-y-2' : ''}
            `}
            onMouseEnter={() => setHoveredGame('ZIP')}
            onMouseLeave={() => setHoveredGame(null)}
            onClick={() => onSelectGame('ZIP')}
          >
            {/* Card Body */}
            <div className="h-full bg-white dark:bg-black rounded-2xl sm:rounded-[2rem] border-2 sm:border-4 border-slate-100 dark:border-slate-800 p-4 sm:p-10 shadow-xl sm:shadow-2xl relative overflow-hidden isolate flex flex-col">
              
              {/* Aurora Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 dark:from-indigo-900 dark:via-purple-900 dark:to-slate-900 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              
              {/* Moving Mesh Gradient */}
              <div className="absolute inset-0 opacity-10 dark:opacity-30 mix-blend-overlay bg-[length:400%_400%] bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 dark:from-rose-500 dark:via-fuchsia-500 dark:to-indigo-500 animate-[gradient_15s_ease_infinite]" />

              {/* Icon / Graphic */}
              <div className="relative mb-3 sm:mb-8 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 origin-center shrink-0">
                 <div className="w-12 h-12 sm:w-24 sm:h-24 bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl sm:text-6xl shadow-xl border border-white/50 dark:border-white/20">
                   🌈
                 </div>
                 {/* Floating numbers */}
                 <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-10 sm:h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg transform rotate-12 group-hover:rotate-45 transition-transform animate-bounce delay-100 text-xs sm:text-base">3</div>
                 <div className="absolute top-0 -left-2 sm:-left-4 w-4 h-4 sm:w-8 sm:h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg transform -rotate-12 group-hover:-rotate-45 transition-transform text-[10px] sm:text-base">1</div>
              </div>

              {/* Text Content */}
              <div className="relative z-10 flex flex-col flex-1">
                <h2 className="text-lg sm:text-4xl font-black text-slate-800 dark:text-white mb-1 sm:mb-3 group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-300 transition-colors text-shadow-sm leading-tight">
                  Number Slide
                </h2>
                <p className="text-slate-500 dark:text-slate-300 text-xs sm:text-lg font-medium leading-relaxed mb-3 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                  A vibrant flow puzzle. Paint with light.
                </p>
                
                {/* CTA Button */}
                <div className="mt-auto flex items-center gap-2 sm:gap-3 font-bold text-fuchsia-500 dark:text-fuchsia-400 text-sm sm:text-xl group-hover:translate-x-2 transition-transform duration-300">
                  <span className="hidden sm:inline">Play Puzzle</span>
                  <span className="sm:hidden">Play</span>
                  <span className="text-lg sm:text-2xl">→</span>
                </div>
              </div>

              {/* Hover Border Glow */}
              <div className="absolute inset-0 border-4 border-fuchsia-500/0 rounded-2xl sm:rounded-[2rem] transition-all duration-300 group-hover:border-fuchsia-500/20 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Footer Text with Privacy Link */}
        <div className="mt-6 sm:mt-16 text-slate-400 dark:text-slate-600 font-medium text-[10px] sm:text-sm tracking-widest uppercase opacity-50 shrink-0 flex flex-col items-center gap-2">
           <span>MindGrid • v1.0</span>
           <a 
             href="/privacy.html"
             className="hover:text-slate-600 dark:hover:text-slate-400 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 transition-all"
           >
             Privacy Policy
           </a>
        </div>
      </div>

       {/* Atmosphere Floating Action Button */}
       <div className="absolute bottom-4 right-4 z-50" ref={menuRef}>
         <div className={`absolute bottom-full right-0 mb-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 w-48 transition-all duration-200 origin-bottom-right ${isAtmosphereMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
             <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 py-2 border-b border-slate-200/50 dark:border-slate-700/50 mb-1">
               Atmosphere
             </div>
             <div className="max-h-64 overflow-y-auto space-y-1">
                {atmosphereOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                       onSetAtmosphere(option.id);
                       setIsAtmosphereMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                       currentAtmosphere === option.id 
                       ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' 
                       : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                     <span className={`w-6 h-6 flex items-center justify-center rounded text-xs ${option.color}`}>{option.icon}</span>
                     <span>{option.label}</span>
                  </button>
                ))}
             </div>
         </div>

         <button
            onClick={() => setIsAtmosphereMenuOpen(!isAtmosphereMenuOpen)}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 ${
              isAtmosphereMenuOpen 
              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 rotate-90' 
              : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
         >
            <span className="text-xl sm:text-2xl">✨</span>
         </button>
       </div>

    </div>
  );
};

export default GameLauncher;