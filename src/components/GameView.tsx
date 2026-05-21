import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import { GameType } from '../App';
import { useSound } from '../context/SoundContext';
import { createRunnerGame } from '../games/RunnerGame';
import { createShooterGame } from '../games/ShooterGame';
import { createDrivingGame } from '../games/DrivingGame';
import { createGamePro } from '../games/GamePro';
import { setHighScore } from '../utils/storage';

interface Props {
  gameId: GameType;
  onBack: () => void;
}

export const GameView: React.FC<Props> = ({ gameId, onBack }) => {
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  const gameRef1 = useRef<Phaser.Game | null>(null);
  const gameRef2 = useRef<Phaser.Game | null>(null);
  
  const { isMuted, toggleMute, playSfx } = useSound();
  const [isGameOver, setIsGameOver] = useState(false);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  useEffect(() => {
    const initGames = () => {
      if (gameId === 'retro-all') {
        if (containerRef1.current) {
          gameRef1.current = new Phaser.Game(createRunnerGame(containerRef1.current, {
            onGameOver: (s) => handleGameOver(s, 'runner'),
            onScore: (s) => setScore1(s),
            playSfx
          }));
        }
        if (containerRef2.current) {
          gameRef2.current = new Phaser.Game(createShooterGame(containerRef2.current, {
            onGameOver: (s) => handleGameOver(s, 'shooter'),
            onScore: (s) => setScore2(s),
            playSfx
          }));
        }
      } else {
        const container = containerRef1.current;
        if (!container) return;
        
        let config;
        switch(gameId) {
          case 'runner':
            config = createRunnerGame(container, { onGameOver: (s) => handleGameOver(s, 'runner'), onScore: setScore1, playSfx });
            break;
          case 'shooter':
            config = createShooterGame(container, { onGameOver: (s) => handleGameOver(s, 'shooter'), onScore: setScore1, playSfx });
            break;
          case 'driving':
            config = createDrivingGame(container, { onGameOver: (s) => handleGameOver(s, 'driving'), onScore: setScore1, playSfx });
            break;
          case 'gamepro':
            config = createGamePro(container, { onGameOver: (s) => handleGameOver(s, 'gamepro'), onScore: setScore1, playSfx });
            break;
          default:
            return;
        }
          
        gameRef1.current = new Phaser.Game(config);
      }
    };

    const handleGameOver = (finalScore: number, type: string) => {
      setIsGameOver(true);
      setHighScore(type, finalScore);
      playSfx('hit');
      if (gameId === 'retro-all') {
        gameRef1.current?.scene.scenes.forEach(s => s.physics.pause());
        gameRef2.current?.scene.scenes.forEach(s => s.physics.pause());
      }
    };

    initGames();

    return () => {
      gameRef1.current?.destroy(true);
      gameRef2.current?.destroy(true);
      gameRef1.current = null;
      gameRef2.current = null;
    };
  }, [gameId, playSfx]);

  const restartGame = () => {
    playSfx('click');
    setIsGameOver(false);
    setScore1(0);
    setScore2(0);
    gameRef1.current?.scene.scenes.forEach(scene => scene.scene.restart());
    gameRef2.current?.scene.scenes.forEach(scene => scene.scene.restart());
  };

  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-black">
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => { playSfx('click'); onBack(); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl backdrop-blur-md border border-slate-700 transition-all text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>Hub</span>
          </button>
          
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-indigo-600/90 rounded-xl backdrop-blur-md shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <span className="text-[10px] uppercase font-black text-indigo-200 block leading-none tracking-tighter">
                {gameId === 'retro-all' ? 'Runner' : 'Score'}
              </span>
              <span className="text-xl font-black">{score1}</span>
            </div>
            {gameId === 'retro-all' && (
              <div className="px-4 py-2 bg-purple-600/90 rounded-xl backdrop-blur-md shadow-lg shadow-purple-500/20 border border-purple-400/30">
                <span className="text-[10px] uppercase font-black text-purple-200 block leading-none tracking-tighter">Shooter</span>
                <span className="text-xl font-black">{score2}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={toggleMute}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl backdrop-blur-md border border-slate-700 transition-all"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Game Canvas Container(s) */}
      <div className={`flex-1 w-full flex ${gameId === 'retro-all' ? 'flex-col md:flex-row' : ''}`}>
        <div ref={containerRef1} className="flex-1 w-full h-full border-r border-white/5" />
        {gameId === 'retro-all' && (
          <div ref={containerRef2} className="flex-1 w-full h-full border-l border-white/5" />
        )}
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <Trophy size={40} className="text-white" />
            </div>
            <h2 className="text-4xl font-black mb-1 uppercase italic tracking-tighter">Pro Defeated</h2>
            <p className="text-indigo-400 uppercase tracking-widest text-[10px] font-black mb-8 italic">Score Authenticated</p>
            
            <div className="bg-slate-800/50 rounded-2xl p-4 mb-8 border border-slate-700">
              <span className="text-slate-500 text-[10px] font-black uppercase block mb-1">Total Score</span>
              <span className="text-3xl font-black text-white">{score1}</span>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={restartGame}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <RotateCcw size={18} />
                Try Again
              </button>
              <button 
                onClick={onBack}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest rounded-2xl border border-slate-700 transition-transform active:scale-95"
              >
                Exit to Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Touch Controls Helper */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-black/40 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
          {gameId === 'runner' ? 'TAP TO JUMP' : gameId === 'shooter' ? 'DRAG TO MOVE • TAP TO SHOOT' : gameId === 'driving' ? 'DRAG TO STEER • AVOID TRAFFIC' : gameId === 'gamepro' ? 'CURSOR FOLLOWS • CLICK TO BLAST' : 'SIMULTANEOUS RETRO CHALLENGE'}
        </p>
      </div>
    </div>
  );
};