import React from 'react';

const BreakingTransition: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
      <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Thunder Lines - Red/Orange with Glow */}
        <g filter="url(#glow)" stroke="#FF2400" fill="none">
          {/* Top Left Crack */}
          <path 
            d="M 50 50 L 45 40 L 48 30 L 40 20 L 42 10 L 30 0" 
            className="animate-crack" 
            style={{ animationDelay: '0ms' }}
          />
          
          {/* Top Right Crack */}
          <path 
            d="M 50 50 L 55 42 L 52 32 L 60 22 L 58 12 L 70 0" 
            className="animate-crack" 
            style={{ animationDelay: '50ms' }}
          />
          
          {/* Bottom Left Crack */}
          <path 
            d="M 50 50 L 42 55 L 35 52 L 25 60 L 28 75 L 10 90 L 0 100" 
            className="animate-crack" 
            style={{ animationDelay: '100ms' }}
          />
          
          {/* Bottom Right Crack */}
          <path 
            d="M 50 50 L 58 58 L 54 65 L 65 72 L 62 85 L 80 92 L 90 100" 
            className="animate-crack" 
            style={{ animationDelay: '20ms' }}
          />
           
           {/* Side Cracks for extra chaos */}
           <path 
             d="M 50 50 L 60 50 L 70 45 L 85 55 L 100 40"
             className="animate-crack"
             style={{ animationDelay: '150ms' }}
           />
           <path 
             d="M 50 50 L 40 50 L 30 45 L 15 55 L 0 45"
             className="animate-crack"
             style={{ animationDelay: '120ms' }}
           />
        </g>
      </svg>
      
      {/* Optional flash overlay */}
      <div className="absolute inset-0 bg-red-500/10 animate-pulse mix-blend-overlay"></div>
    </div>
  );
};

export default BreakingTransition;