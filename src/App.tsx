import React, { useState, useEffect } from 'react';
import { GameHubUI } from './components/GameHubUI';
import { GameView } from './components/GameView';
import { SoundProvider } from './context/SoundContext';

export type GameType = 'none' | 'runner' | 'shooter' | 'driving' | 'retro-all';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType>('none');

  return (
    <SoundProvider>
      <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-purple-500/30">
        {activeGame === 'none' ? (
          <GameHubUI onSelectGame={setActiveGame} />
        ) : (
          <GameView gameId={activeGame} onBack={() => setActiveGame('none')} />
        )}
      </div>
    </SoundProvider>
  );
}