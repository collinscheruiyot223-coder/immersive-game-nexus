import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playSfx: (key: 'click' | 'score' | 'hit' | 'jump') => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SFX_URLS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  score: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  jump: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3',
};

const BGM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('gamehub_muted');
    return saved === 'true';
  });

  const [bgm, setBgm] = useState<Howl | null>(null);

  useEffect(() => {
    const sound = new Howl({
      src: [BGM_URL],
      loop: true,
      volume: 0.2,
      html5: true, // Better for long tracks
      mute: isMuted,
    });
    
    sound.play();
    setBgm(sound);

    return () => {
      sound.stop();
      sound.unload();
    };
  }, []);

  useEffect(() => {
    if (bgm) {
      bgm.mute(isMuted);
    }
    localStorage.setItem('gamehub_muted', String(isMuted));
  }, [isMuted, bgm]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const playSfx = useCallback((key: keyof typeof SFX_URLS) => {
    if (isMuted) return;
    const sound = new Howl({
      src: [SFX_URLS[key]],
      volume: 0.4,
    });
    sound.play();
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSfx }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};