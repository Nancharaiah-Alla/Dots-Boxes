import React, { useState, useEffect, useRef } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { GameConfig } from '../types';
import { PLAYER_X, PLAYER_O } from '../constants';

interface OnlineSetupProps {
  onStartGame: (config: GameConfig, conn: DataConnection, peer: Peer) => void;
  onBack: () => void;
}

const OnlineSetup: React.FC<OnlineSetupProps> = ({ onStartGame, onBack }) => {
  const [activeTab, setActiveTab] = useState<'HOST' | 'JOIN'>('HOST');
  const [name, setName] = useState('');
  const [gridSize, setGridSize] = useState(6);
  const [roomId, setRoomId] = useState(''); 
  const [generatedId, setGeneratedId] = useState(''); 
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const isGameStartingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (peerRef.current && !isGameStartingRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const generateShortId = () => Math.floor(1000 + Math.random() * 9000).toString();

  const createRoom = () => {
    if (!name.trim()) {
      setStatus('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    setStatus('Initializing room...');

    const shortId = generateShortId();
    const fullPeerId = `db-game-${shortId}`;
    
    const peer = new Peer(fullPeerId);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setGeneratedId(shortId);
      setIsLoading(false);
      setStatus('Waiting for opponent...');
    });

    peer.on('error', (err) => {
      console.error(err);
      setStatus('Error creating room.');
      setIsLoading(false);
    });

    peer.on('connection', (conn) => {
      connRef.current = conn;
      conn.on('open', () => {
        conn.on('data', (data: any) => {
          if (data && data.type === 'JOIN') {
            const config: GameConfig = {
              p1Name: name, 
              p2Name: data.name || 'Opponent',
              gridSize,
              mode: 'ONLINE',
              roomId: shortId,
              myPlayer: PLAYER_X
            };
            conn.send({ type: 'START', config });
            isGameStartingRef.current = true;
            onStartGame(config, conn, peer);
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
    setStatus('Connecting...');

    const peer = new Peer(); 
    peerRef.current = peer;

    peer.on('open', () => {
      const targetPeerId = `db-game-${roomId}`; 
      const conn = peer.connect(targetPeerId);
      connRef.current = conn;

      conn.on('open', () => {
        setStatus('Connected! Joining...');
        conn.send({ type: 'JOIN', name });
      });

      conn.on('data', (data: any) => {
        if (data && data.type === 'START') {
          const config: GameConfig = {
             ...data.config,
             myPlayer: PLAYER_O
          };
          isGameStartingRef.current = true;
          onStartGame(config, conn, peer);
        }
      });

      conn.on('close', () => {
        if (!isGameStartingRef.current) {
            setStatus('Host closed connection.');
            setIsLoading(false);
        }
      });
      
      peer.on('error', (err) => {
         console.error(err);
         setStatus('Could not connect. Check Room ID.');
         setIsLoading(false);
      });
    });

    peer.on('error', (err) => {
      console.error(err);
      setStatus('Connection error.');
      setIsLoading(false);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedId);
    setStatus('Copied!');
    setTimeout(() => setStatus('Waiting for opponent...'), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 w-full max-w-md mx-auto animate-in">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 w-full relative transition-all">
        
        <div className="flex items-center justify-between mb-6">
           <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">←</button>
           <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Online Lobby</h2>
           <div className="w-10"></div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6">
          <button 
            onClick={() => { setActiveTab('HOST'); setStatus(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'HOST' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-300 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Create Room
          </button>
          <button 
             onClick={() => { setActiveTab('JOIN'); setStatus(''); }}
             className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'JOIN' ? 'bg-white dark:bg-slate-600 text-green-600 dark:text-green-300 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
          >
            Join Room
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-400 dark:focus:border-slate-500 rounded-xl font-bold text-slate-800 dark:text-slate-100 outline-none transition-all placeholder:text-slate-400"
            placeholder="Your Name"
            disabled={isLoading || !!generatedId}
          />
        </div>

        {activeTab === 'HOST' && (
          <div className="animate-in space-y-4">
             {!generatedId ? (
               <>
                <div>
                  <div className="flex justify-between gap-2">
                    {[6, 8, 10].map((size) => (
                      <button
                        key={size}
                        onClick={() => setGridSize(size)}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all text-sm ${
                          gridSize === size 
                            ? 'bg-blue-50 dark:bg-slate-800 border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Room'}
                </button>
               </>
             ) : (
               <div onClick={copyToClipboard} className="cursor-pointer flex flex-col items-center bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-2xl p-6 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                 <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Room Code</span>
                 <div className="text-6xl font-mono font-black text-blue-600 dark:text-blue-400 tracking-widest">
                   {generatedId}
                 </div>
                 <p className="text-xs text-blue-400 mt-2">Tap to copy</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'JOIN' && (
          <div className="animate-in space-y-4">
              <input 
                type="number"
                pattern="[0-9]*" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.slice(0, 4))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-green-400 dark:focus:border-green-500 rounded-xl font-mono font-bold text-center text-2xl tracking-widest text-slate-800 dark:text-slate-100 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans"
                placeholder="0000"
                disabled={isLoading}
              />
              <button 
                onClick={joinRoom}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Join Game'}
              </button>
          </div>
        )}

        {status && (
          <div className="mt-4 text-center text-sm font-bold text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 py-3 rounded-xl animate-in">
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineSetup;