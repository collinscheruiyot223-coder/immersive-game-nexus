import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Zap, Rocket, Volume2, VolumeX, Search, 
  Trophy, User, Star, Filter, Heart, Play, Car, Shield
} from 'lucide-react';
import { GameType } from '../App';
import { useSound } from '../context/SoundContext';
import { getHighScore, getUserName } from '../utils/storage';

interface Props {
  onSelectGame: (game: GameType) => void;
}

const CATEGORIES = ['All', 'Action', 'Arcade', 'Retro', 'Racing', 'Pro'];

const GAMES = [
  {
    id: 'runner' as GameType,
    title: 'Neon Runner',
    description: 'Jump over obstacles in a synthwave world. Speed increases over time!',
    icon: Zap,
    color: 'from-cyan-500 to-blue-600',
    category: 'Retro',
    rating: 4.8,
    players: '12K'
  },
  {
    id: 'shooter' as GameType,
    title: 'Star Guardian',
    description: 'Defend the galaxy from incoming asteroid swarms. Precise shooting required.',
    icon: Rocket,
    color: 'from-purple-500 to-pink-600',
    category: 'Retro',
    rating: 4.9,
    players: '8.5K'
  },
  {
    id: 'driving' as GameType,
    title: 'Highway Dash',
    description: 'Speed through traffic and avoid collisions in this high-octane driving game.',
    icon: Car,
    color: 'from-orange-500 to-red-600',
    category: 'Racing',
    rating: 4.7,
    players: '5.2K'
  },
  {
    id: 'gamepro' as GameType,
    title: 'Game Pro',
    description: 'Elite strategic defense. Protect the central hub from incoming geometric waves.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
    category: 'Pro',
    rating: 5.0,
    players: '1.2M'
  }
];

export const GameHubUI: React.FC<Props> = ({ onSelectGame }) => {
  const { isMuted, toggleMute, playSfx } = useSound();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const filteredGames = useMemo(() => {
    return GAMES.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleSelect = (id: GameType) => {
    playSfx('click');
    onSelectGame(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 transform hover:rotate-6 transition-transform">
            <Gamepad2 size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                Game<span className="text-indigo-500">Hub</span>
              </h1>
              <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                v2.5
              </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              50+ Premium Titles
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            />
          </div>
          
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all text-slate-300"
          >
            <User size={20} />
          </button>
          
          <button 
            onClick={toggleMute}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all text-slate-300"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-3 space-y-8">
          <div>
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter size={14} /> Categories
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all text-left ${
                    activeCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-6">
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy size={14} /> Hall of Fame
            </h3>
            <div className="space-y-4">
              {GAMES.map(game => (
                <div key={game.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${game.color}`} />
                    <span className="text-xs font-bold text-slate-300">{game.title}</span>
                  </div>
                  <span className="text-xs font-black text-white">{getHighScore(game.id)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black italic uppercase tracking-tight">
              {activeCategory} <span className="text-indigo-500">Games</span>
            </h2>
            <div className="text-slate-500 text-xs font-bold">
              SHOWING {filteredGames.length} OF {GAMES.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredGames.map((game, idx) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-500" />
                  
                  <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all flex flex-col h-full">
                    <div className={`h-32 bg-gradient-to-br ${game.color} opacity-20 relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <game.icon size={64} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">{game.title}</h3>
                        <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] font-black">{game.rating}</span>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                        {game.description}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-600 uppercase">Players</span>
                          <span className="text-xs font-bold text-slate-300">{game.players}</span>
                        </div>
                        <button 
                          onClick={() => handleSelect(game.id)}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 transform hover:-translate-y-0.5 transition-all"
                        >
                          Launch Game
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
        <div>&copy; 2026 GameHub Studio &bull; All Rights Reserved</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-2">
          POWERED BY <span className="text-indigo-500">PHASER 3 ENGINE</span>
        </div>
      </footer>
    </div>
  );
};