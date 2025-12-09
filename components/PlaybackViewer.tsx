'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import AnimatedCharacterComponent from './AnimatedCharacter';
import { getCharacterById } from '@/lib/characters';
import { AnimationScene } from '@/lib/animation-engine';

interface PlaybackViewerProps {
  scenes: AnimationScene[];
  onClose?: () => void;
  autoPlay?: boolean;
  showControls?: boolean;
}

// Background configurations with gradients
const BACKGROUND_CONFIGS: Record<string, { 
  gradient: string; 
  groundColor: string; 
  elements: 'nature' | 'night' | 'indoor' | 'beach';
}> = {
  forest: { 
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #228B22 100%)', 
    groundColor: '#228B22',
    elements: 'nature'
  },
  park: { 
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #90EE90 100%)', 
    groundColor: '#7CFC00',
    elements: 'nature'
  },
  meadow: { 
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 40%, #90EE90 100%)', 
    groundColor: '#7CFC00',
    elements: 'nature'
  },
  beach: { 
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 40%, #00CED1 60%, #F4A460 100%)', 
    groundColor: '#F4A460',
    elements: 'beach'
  },
  night: { 
    gradient: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', 
    groundColor: '#1a1a2e',
    elements: 'night'
  },
  bedroom: { 
    gradient: 'linear-gradient(180deg, #E6E6FA 0%, #DDA0DD 50%, #D2B48C 100%)', 
    groundColor: '#D2B48C',
    elements: 'indoor'
  },
};

export default function PlaybackViewer({
  scenes,
  onClose,
  autoPlay = true,
  showControls = true,
}: PlaybackViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasSpokenRef = useRef<boolean>(false);

  // Ensure currentSceneIndex is valid
  const safeSceneIndex = Math.min(currentSceneIndex, scenes.length - 1);
  const currentScene = scenes[safeSceneIndex];
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
  const bgConfig = currentScene ? (BACKGROUND_CONFIGS[currentScene.background] || BACKGROUND_CONFIGS.meadow) : BACKGROUND_CONFIGS.meadow;

  // Speak narration
  const speakNarration = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to find a friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') || 
      v.name.includes('Female') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Scene change effect
  useEffect(() => {
    hasSpokenRef.current = false;
    setShowTitle(true);
    setIsTransitioning(true);
    
    const titleTimer = setTimeout(() => setShowTitle(false), 2000);
    const transitionTimer = setTimeout(() => setIsTransitioning(false), 500);
    
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(transitionTimer);
    };
  }, [currentSceneIndex]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setSceneProgress(prev => {
        const newProgress = prev + deltaTime;
        
        // Speak narration at the start of scene
        if (!hasSpokenRef.current && newProgress > 500) {
          speakNarration(currentScene.narration);
          hasSpokenRef.current = true;
        }
        
        if (newProgress >= currentScene.duration) {
          // Move to next scene
          const nextIndex = currentSceneIndex + 1;
          if (nextIndex < scenes.length) {
            setCurrentSceneIndex(nextIndex);
            hasSpokenRef.current = false; // Reset for next scene
            return 0;
          } else {
            // End of all scenes
            setIsPlaying(false);
            return currentScene.duration;
          }
        }
        
        return newProgress;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, currentScene, currentSceneIndex, scenes.length, speakNarration]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Toggle play/pause
  const togglePlay = () => {
    if (!isPlaying) {
      lastTimeRef.current = 0;
    }
    setIsPlaying(!isPlaying);
  };

  // Navigate scenes
  const goToScene = (index: number) => {
    window.speechSynthesis?.cancel();
    setCurrentSceneIndex(Math.max(0, Math.min(scenes.length - 1, index)));
    setSceneProgress(0);
    lastTimeRef.current = 0;
    hasSpokenRef.current = false;
  };

  // Restart
  const restart = () => {
    window.speechSynthesis?.cancel();
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(true);
    lastTimeRef.current = 0;
    hasSpokenRef.current = false;
  };

  // Calculate overall progress
  const overallProgress = scenes.slice(0, currentSceneIndex).reduce((sum, s) => sum + s.duration, 0) + sceneProgress;
  const progressPercent = (overallProgress / totalDuration) * 100;

  if (!currentScene) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl"
      ref={containerRef}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Main Stage */}
      <div className="relative aspect-video overflow-hidden">
        {/* Background - no AnimatePresence to prevent black screen */}
        <motion.div
          key={`bg-${safeSceneIndex}`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
          style={{ background: bgConfig.gradient }}
        >
            {/* Sun for day scenes */}
            {bgConfig.elements !== 'night' && bgConfig.elements !== 'indoor' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-[8%] right-[12%] w-20 h-20"
              >
                <div className="w-full h-full bg-yellow-200 rounded-full shadow-lg" 
                  style={{ boxShadow: '0 0 80px 30px rgba(255, 255, 150, 0.6)' }} 
                />
              </motion.div>
            )}

            {/* Moon and stars for night */}
            {bgConfig.elements === 'night' && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-[10%] right-[15%] w-16 h-16 bg-yellow-100 rounded-full"
                  style={{ boxShadow: '0 0 40px 10px rgba(255, 255, 200, 0.4)' }}
                />
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                    className="absolute w-1.5 h-1.5 bg-white rounded-full"
                    style={{ 
                      top: `${5 + (i * 7) % 45}%`, 
                      left: `${3 + (i * 13) % 94}%`,
                    }}
                  />
                ))}
              </>
            )}

            {/* Clouds for outdoor scenes */}
            {(bgConfig.elements === 'nature' || bgConfig.elements === 'beach') && (
              <>
                <motion.div
                  animate={{ x: [0, 30, 0] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-[15%] left-[10%] w-24 h-10 bg-white/80 rounded-full blur-sm"
                />
                <motion.div
                  animate={{ x: [0, -20, 0] }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-[20%] left-[60%] w-32 h-12 bg-white/70 rounded-full blur-sm"
                />
                <motion.div
                  animate={{ x: [0, 15, 0] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-[12%] left-[35%] w-20 h-8 bg-white/60 rounded-full blur-sm"
                />
              </>
            )}

            {/* Beach waves */}
            {bgConfig.elements === 'beach' && (
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-[28%] left-0 right-0 h-8 bg-gradient-to-t from-cyan-400/50 to-transparent"
              />
            )}

            {/* Ground */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[30%]"
              style={{ backgroundColor: bgConfig.groundColor }}
            >
              {/* Grass details for nature */}
              {bgConfig.elements === 'nature' && (
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-around">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 h-4 bg-green-600 rounded-t-full origin-bottom"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        {/* Characters */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`chars-${safeSceneIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute inset-0 flex items-end justify-center pb-[32%]"
          >
            <div className="flex items-end gap-16">
              {currentScene.characters.map((char, idx) => {
                const charData = getCharacterById(char.characterId);
                if (!charData) return null;
                
                const position = char.position || (idx === 0 ? -100 : 100);
                
                return (
                  <motion.div
                    key={`${char.characterId}-${idx}`}
                    initial={{ 
                      x: position < 0 ? -200 : position > 0 ? 200 : 0,
                      opacity: 0 
                    }}
                    animate={{ 
                      x: position,
                      opacity: 1 
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: idx * 0.2,
                      type: 'spring',
                      stiffness: 100
                    }}
                  >
                    <AnimatedCharacterComponent
                      character={charData}
                      animation={char.animation || 'idle'}
                      scale={0.7}
                      flipX={char.flipX}
                      showName={true}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Scene Title Overlay */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/60 backdrop-blur-md rounded-2xl"
            >
              <p className="text-white font-bold text-xl">{currentScene.title}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Narration Box */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`narration-${safeSceneIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="absolute bottom-6 left-6 right-6"
          >
            <div className="px-8 py-5 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10">
              <p className="text-white text-lg text-center leading-relaxed font-medium">
                {currentScene.narration}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Scene indicator */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-xl">
          <p className="text-white/80 text-sm font-medium">
            Scene {safeSceneIndex + 1} of {scenes.length}
          </p>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="bg-gradient-to-t from-black to-black/80 px-6 py-4">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/60">
              <span>{formatTime(overallProgress)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => goToScene(currentSceneIndex - 1)}
                disabled={currentSceneIndex === 0}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-40"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              
              <button
                onClick={() => goToScene(currentSceneIndex + 1)}
                disabled={currentSceneIndex === scenes.length - 1}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-40"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={restart}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scene thumbnails */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {scenes.map((scene, index) => (
              <button
                key={index}
                onClick={() => goToScene(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                  safeSceneIndex === index
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span className="text-xs font-medium">Scene {index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End screen */}
      <AnimatePresence>
        {!isPlaying && safeSceneIndex === scenes.length - 1 && sceneProgress >= currentScene.duration - 100 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-6"
              >
                🎬
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">The End!</h3>
              <p className="text-white/70 mb-8">Thanks for watching!</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={restart}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  Watch Again
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper function to format time
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
