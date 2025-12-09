'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MUSIC_TRACKS, MusicTrack, MusicMood } from '@/lib/background-music';

interface MusicPlayerProps {
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
  onMoodChange?: (mood: MusicMood) => void;
}

const MOOD_COLORS: Record<MusicMood, string> = {
  happy: 'from-yellow-400 to-orange-400',
  sad: 'from-blue-400 to-indigo-400',
  adventure: 'from-green-400 to-emerald-400',
  mystery: 'from-purple-400 to-violet-400',
  calm: 'from-cyan-400 to-blue-400',
  exciting: 'from-red-400 to-pink-400',
  romantic: 'from-pink-400 to-rose-400',
  scary: 'from-gray-600 to-gray-800',
  funny: 'from-amber-400 to-yellow-400',
  epic: 'from-orange-500 to-red-500',
};

export default function MusicPlayer({ 
  isMinimized = false, 
  onMinimizeToggle,
  onMoodChange 
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(MUSIC_TRACKS[0]);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(true);
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MusicMood | 'all'>('all');
  const [progress, setProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter tracks by mood
  const filteredTracks = selectedMood === 'all' 
    ? MUSIC_TRACKS 
    : MUSIC_TRACKS.filter(t => t.mood === selectedMood);

  // Simple procedural music using Web Audio API
  const startMusic = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    
    // Create a simple melody based on track mood
    const notes = getMoodNotes(currentTrack.mood);
    let noteIndex = 0;
    
    const playNote = () => {
      if (!isPlaying) return;
      
      // Clean up previous oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = notes[noteIndex % notes.length];
      
      gainNode.gain.value = isMuted ? 0 : volume * 0.3;
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start();
      
      // Envelope
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
      
      oscillator.stop(ctx.currentTime + 0.5);
      
      noteIndex++;
      setProgress((noteIndex % 32) / 32 * 100);
    };
    
    intervalRef.current = setInterval(playNote, (60 / currentTrack.bpm) * 1000);
    playNote();
  }, [currentTrack, volume, isMuted, isPlaying]);

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startMusic();
    } else {
      stopMusic();
    }
    
    return () => stopMusic();
  }, [isPlaying, startMusic, stopMusic]);

  // Update gain when volume changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume * 0.3;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = isShuffle 
      ? Math.floor(Math.random() * filteredTracks.length)
      : (currentIndex + 1) % filteredTracks.length;
    setCurrentTrack(filteredTracks[nextIndex]);
  };

  const handlePrev = () => {
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? filteredTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(filteredTracks[prevIndex]);
  };

  const handleMoodSelect = (mood: MusicMood | 'all') => {
    setSelectedMood(mood);
    if (mood !== 'all') {
      const moodTracks = MUSIC_TRACKS.filter(t => t.mood === mood);
      if (moodTracks.length > 0) {
        setCurrentTrack(moodTracks[0]);
        onMoodChange?.(mood);
      }
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${MOOD_COLORS[currentTrack.mood]} shadow-lg`}>
          <button onClick={handlePlayPause} className="p-1 text-white">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-white text-sm font-medium">{currentTrack.icon}</span>
          <span className="text-white text-sm">{currentTrack.name}</span>
          <button onClick={onMinimizeToggle} className="p-1 text-white/80 hover:text-white">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40 w-80"
    >
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${MOOD_COLORS[currentTrack.mood]}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Background Music</span>
            </div>
            <button onClick={onMinimizeToggle} className="p-1 text-white/80 hover:text-white">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Track */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${MOOD_COLORS[currentTrack.mood]} flex items-center justify-center text-2xl`}>
              {currentTrack.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{currentTrack.name}</h3>
              <p className="text-gray-400 text-sm truncate">{currentTrack.description}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${MOOD_COLORS[currentTrack.mood]}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={handlePrev} className="p-2 text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={handlePlayPause}
              className={`p-3 rounded-full bg-gradient-to-r ${MOOD_COLORS[currentTrack.mood]} text-white shadow-lg`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button onClick={handleNext} className="p-2 text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-full transition-colors ${isRepeat ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          
          {/* Volume */}
          <div className="flex items-center gap-3 mt-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
            />
          </div>
        </div>

        {/* Mood Selector */}
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-2">Select Mood</p>
          <div className="flex flex-wrap gap-2">
            {(['all', ...Object.keys(MOOD_COLORS)] as (MusicMood | 'all')[]).slice(0, 6).map(mood => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedMood === mood
                    ? mood === 'all' 
                      ? 'bg-white text-gray-900'
                      : `bg-gradient-to-r ${MOOD_COLORS[mood as MusicMood]} text-white`
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                {mood === 'all' ? '🎵 All' : `${MUSIC_TRACKS.find(t => t.mood === mood)?.icon || ''} ${mood}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper to get notes for each mood
function getMoodNotes(mood: MusicMood): number[] {
  const scales: Record<MusicMood, number[]> = {
    happy: [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50], // C Major
    sad: [440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00], // A Minor
    adventure: [587.33, 659.25, 783.99, 880.00, 987.77, 1174.66, 1318.51, 1567.98], // D Major
    mystery: [440.00, 466.16, 523.25, 554.37, 659.25, 698.46, 830.61, 880.00], // A Harmonic Minor
    calm: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99], // G Major
    exciting: [329.63, 369.99, 415.30, 440.00, 493.88, 554.37, 622.25, 659.25], // E Major
    romantic: [349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 622.25, 698.46], // F Major
    scary: [311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16], // Diminished
    funny: [523.25, 587.33, 659.25, 698.46, 783.99, 659.25, 587.33, 523.25], // Playful C
    epic: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99], // D Mixolydian
  };
  return scales[mood] || scales.happy;
}

export { MUSIC_TRACKS };
