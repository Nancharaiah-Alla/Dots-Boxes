import React, { useState, useEffect, useRef } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { GameConfig } from '../types';
import { PLAYER_X, PLAYER_O } from '../constants';

interface OnlineSetupProps {
  onStartGame: (config: GameConfig, conn: DataConnection) => void;
  onBack: () => void;
}

const OnlineSetup: React.FC<OnlineSetupProps> = ({ onStartGame, onBack }) => {
  const [activeTab, setActiveTab] = useState<'HOST' | 'JOIN'>('HOST');
  const [name, setName] = useState('');
  const [gridSize, setGridSize] = useState(6);
  const [roomId, setRoomId] = useState(''); // User input for joining
  const [generatedId, setGeneratedId] = useState(''); // Host ID
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  // Cleanup peer on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const generateShortId = () => {
    // Generate a random 4-character string
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const createRoom = () => {
    if (!name.trim()) {
      setStatus('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setStatus('Initializing room...');

    const shortId = generateShortId();
    const fullPeerId = `db-game-${shortId}`;
    
    // Create Peer
    const peer = new Peer(fullPeerId);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setGeneratedId(shortId);
      setIsLoading(false);
      setStatus('Waiting for opponent to join...');
    });

    peer.on('error', (err) => {
      console.error(err);
      setStatus('Error creating room. Please try again.');
      setIsLoading(false);
    });

    peer.on('connection', (conn) => {
      // Host receives connection
      connRef.current = conn;
      
      conn.on('open', () => {
        // Wait for 'JOIN' message from guest
        conn.on('data', (data: any) => {
          if (data && data.type === 'JOIN') {
            // Start Game!
            const config: GameConfig = {
              p1Name: name, // Host is always P1 (X)
              p2Name: data.name || 'Opponent',
              gridSize,
              mode: 'ONLINE',
              roomId: shortId,
              myPlayer: PLAYER_X
            };
            
            // Send start config to guest
            conn.send({ type: 'START', config });
            
            // Start local
            onStartGame(config, conn);
          }
        });
      });
    });
  };

  const joinRoom = () => {
    if (!name.trim()) {
      setStatus('Please enter your name');
      return;
    }
    if (!roomId.trim()) {
      setStatus('Please enter a Room ID');
      return;
    }

    setIsLoading(true);
    setStatus('Connecting to room...');

    const peer = new Peer(); // Auto-gen ID for guest
    peerRef.current = peer;

    peer.on('open', () => {
      const targetPeerId = `db-game-${roomId.toUpperCase()}`;
      const conn = peer.connect(targetPeerId);
      connRef.current = conn;

      conn.on('open', () => {
        setStatus('Connected! Joining game...');
        // Send my name
        conn.send({ type: 'JOIN', name });
      });

      conn.on('data', (data: any) => {
        if (data && data.type === 'START') {
          // Received start config from Host
          // I am Player 2 (O)
          const config: GameConfig = {
             ...data.config,
             myPlayer: PLAYER_O
          };
          onStartGame(config, conn);
        }
      });

      conn.on('close', () => {
        setStatus('Connection closed by host.');
        setIsLoading(false);
      });
      
      // Handle connection errors (e.g., ID not found)
      peer.on('error', (err) => {
         console.error(err);
         setStatus('Could not connect. Check Room ID.');
         setIsLoading(false);
      });
    });

    peer.on('error', (err) => {
      console.error(err);
      setStatus('Connection error. Please try again.');
      setIsLoading(false);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    setStatus('Room ID copied!');
    setTimeout(() => setStatus('Waiting for opponent to join...'), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto animate-in">
      <div className="bg-white/95 backdrop-blur-md border-2 border-slate-300 rounded-xl shadow-xl p-6 sm:p-8 w-full relative">
        <button onClick={onBack} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 font-bold">← Back</button>
        
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-6 mt-2">Online Lobby</h2>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button 
            onClick={() => { setActiveTab('HOST'); setStatus(''); }}
            className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'HOST' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Create Room
          </button>
          <button 
             onClick={() => { setActiveTab('JOIN'); setStatus(''); }}
             className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${activeTab === 'JOIN' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Join Room
          </button>
        </div>

        {/* Common Name Input */}
        <div className="mb-4">
          <label className="block text-slate-500 text-xs font-bold mb-1 uppercase">Your Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 font-bold text-slate-800 bg-slate-50"
            placeholder="Enter name"
            disabled={isLoading || !!generatedId}
          />
        </div>

        {activeTab === 'HOST' && (
          <div className="animate-in">
             {!generatedId ? (
               <>
                <div className="mb-6">
                  <label className="block text-slate-500 text-xs font-bold mb-3 uppercase text-center">Grid Size</label>
                  <div className="flex justify-between gap-2">
                    {[6, 8, 10].map((size) => (
                      <button
                        key={size}
                        onClick={() => setGridSize(size)}
                        className={`flex-1 py-2 rounded-lg border-2 font-bold transition-all ${
                          gridSize === size 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                        disabled={isLoading}
                      >
                        {size}x{size}
                      </button>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={createRoom}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Room'}
                </button>
               </>
             ) : (
               <div className="flex flex-col items-center bg-blue-50 border-2 border-blue-100 rounded-xl p-6 mb-4">
                 <span className="text-slate-500 text-xs font-bold uppercase mb-2">Room Code</span>
                 <div className="text-5xl font-mono font-bold text-blue-600 tracking-wider mb-2" onClick={copyToClipboard}>
                   {generatedId}
                 </div>
                 <p className="text-xs text-blue-400 mb-4">Share this code with your friend</p>
                 <div className="flex items-center gap-2 text-slate-500 text-sm">
                   <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                   Waiting for player...
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'JOIN' && (
          <div className="animate-in">
             <div className="mb-6">
                <label className="block text-slate-500 text-xs font-bold mb-1 uppercase">Room Code</label>
                <input 
                  type="text" 
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-green-400 font-bold text-slate-800 bg-slate-50 font-mono tracking-widest text-center text-xl uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-300"
                  placeholder="e.g. A4K9"
                  disabled={isLoading}
                />
              </div>
              <button 
                onClick={joinRoom}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Join Game'}
              </button>
          </div>
        )}

        {status && (
          <div className="mt-4 text-center text-sm font-bold text-slate-500 bg-slate-100 py-2 rounded-lg animate-in">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineSetup;