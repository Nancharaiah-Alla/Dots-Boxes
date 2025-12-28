import React, { useMemo } from 'react';
import { AtmosphereType } from '../types';

interface AtmosphereLayerProps {
  type: AtmosphereType;
}

const AtmosphereLayer: React.FC<AtmosphereLayerProps> = ({ type }) => {
  // Generate random particles based on type
  const particles = useMemo(() => {
    // Increase count for Stranger Things since they are static distributed
    const count = type === 'NONE' ? 0 : (type === 'STRANGER_THINGS' ? 60 : 25);
    
    return Array.from({ length: count }).map((_, i) => {
      // Generate random polygon clip path for irregular shapes (Stranger Things / Ash mode)
      // Creates irregular quadrilaterals
      const p1x = Math.floor(Math.random() * 40);
      const p1y = Math.floor(Math.random() * 40);
      const p2x = Math.floor(60 + Math.random() * 40);
      const p2y = Math.floor(Math.random() * 40);
      const p3x = Math.floor(60 + Math.random() * 40);
      const p3y = Math.floor(60 + Math.random() * 40);
      const p4x = Math.floor(Math.random() * 40);
      const p4y = Math.floor(60 + Math.random() * 40);
      const polygon = `polygon(${p1x}% ${p1y}%, ${p2x}% ${p2y}%, ${p3x}% ${p3y}%, ${p4x}% ${p4y}%)`;

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`, // Added top for static positioning
        // Much slower animation for Stranger Things
        animationDuration: type === 'STRANGER_THINGS' 
            ? `${Math.random() * 20 + 20}s` 
            : `${Math.random() * 10 + 5}s`,
        animationDelay: `${Math.random() * 5}s`,
        size: type === 'STRANGER_THINGS' 
            ? Math.random() * 20 + 8  // Larger, irregular chunks for ash
            : Math.random() * 10 + 5,
        clipPath: polygon,
      };
    });
  }, [type]);

  if (type === 'NONE') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000">
      
      {/* 1. STRANGER THINGS (Updated to Ash/Grey style) */}
      {type === 'STRANGER_THINGS' && (
        <>
          {/* Grey background matching the requested reference image */}
          <div className="absolute inset-0 bg-slate-500/90 dark:bg-slate-600/90 transition-colors duration-1000"></div>
          
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute bg-slate-700 dark:bg-slate-800 shadow-sm"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                clipPath: p.clipPath, // Irregular polygonal shape
                animation: `suspended-ash ${p.animationDuration} ease-in-out infinite alternate`,
                animationDelay: p.animationDelay,
                opacity: 0.6
              }}
            />
          ))}
        </>
      )}

      {/* 2. SUMMER */}
      {type === 'SUMMER' && (
        <>
          {/* Light: Bright warm haze. Dark: Rich warm sunset/night glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-300/40 via-yellow-200/20 to-blue-300/10 dark:from-orange-900/40 dark:via-red-900/20 dark:to-slate-900/50"></div>
          
          {/* Heat Haze Lines - Darker in light mode to be seen, subtle in dark mode */}
          {particles.slice(0, 10).map((p) => (
            <div
              key={p.id}
              className="absolute bottom-0 w-20 h-40 bg-orange-500/10 dark:bg-orange-500/10 blur-xl rounded-full"
              style={{
                left: p.left,
                animation: `heat-wave 3s ease-in-out infinite`,
                animationDelay: p.animationDelay,
              }}
            />
          ))}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/20 dark:bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        </>
      )}

      {/* 3. RAINY */}
      {type === 'RAINY' && (
        <>
          {/* Stronger gray overlay in Light mode to simulate storm clouds and contrast the rain */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-400/60 to-slate-500/60 dark:from-slate-900/70 dark:to-black/80"></div>
          {particles.map((p) => (
            <div
              key={p.id}
              // Dark blue rain for Light mode (contrast against gray), Light blue for Dark mode
              className="absolute w-[2px] bg-blue-800/60 dark:bg-blue-400/50"
              style={{
                left: p.left,
                height: p.size * 2,
                top: -50,
                animation: `rain 1s linear infinite`,
                animationDelay: `${Math.random()}s`, // Fast random rain
                opacity: 0.8
              }}
            />
          ))}
        </>
      )}

      {/* 4. WINTER */}
      {type === 'WINTER' && (
        <>
          {/* Cool gray/blue overlay in Light mode to make white snow visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-300/60 to-blue-200/40 dark:from-slate-900/60 dark:to-blue-950/30"></div>
          {particles.map((p) => (
            <div
              key={p.id}
              // White snow with a slight shadow helps visibility
              className="absolute bg-white rounded-full blur-[0.5px] shadow-sm"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                top: -20,
                animation: `fall ${p.animationDuration} linear infinite`,
                animationDelay: p.animationDelay,
              }}
            >
                {/* Sway wrapper */}
               <div style={{ animation: `sway 3s ease-in-out infinite alternate` }}></div>
            </div>
          ))}
        </>
      )}

      {/* 5. SPRING */}
      {type === 'SPRING' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-pink-100/30 via-green-50/20 to-blue-50/20 dark:from-pink-900/10 dark:via-slate-900 dark:to-slate-900"></div>
          {particles.map((p) => (
            <div
              key={p.id}
              className={`absolute rounded-tl-none rounded-br-none rounded-tr-full rounded-bl-full ${
                  p.id % 2 === 0 ? 'bg-pink-400/60 dark:bg-pink-300/60' : 'bg-green-500/40 dark:bg-green-300/40'
              }`}
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                top: -20,
                animation: `fall ${p.animationDuration} linear infinite, float-ash 5s ease-in-out infinite alternate`, // Reusing float-ash for rotation
                animationDelay: p.animationDelay,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default AtmosphereLayer;