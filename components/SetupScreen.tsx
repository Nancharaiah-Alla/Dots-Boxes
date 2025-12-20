import React, { useState } from 'react';

interface SetupScreenProps {
  onStart: (config: { p1Name: string; p2Name: string; gridSize: number }) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState(6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ p1Name, p2Name, gridSize });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-sm border-2 border-slate-300 rounded-lg shadow-xl p-8 w-full">
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

          {/* Start Button */}
          <button 
            type="submit"
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all text-xl"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;