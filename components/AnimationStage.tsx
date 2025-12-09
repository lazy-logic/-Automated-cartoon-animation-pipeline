'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import AnimatedCharacterComponent from './AnimatedCharacter';
import { ANIMATED_CHARACTERS, getCharacterById } from '@/lib/characters';
import { BACKGROUND_TEMPLATES } from '@/lib/templates';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface StageCharacter {
  id: string;
  characterId: string;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
  animation: 'idle' | 'walk' | 'wave' | 'talk' | 'jump' | 'sit';
}

interface AnimationStageProps {
  backgroundId?: string;
  characters?: StageCharacter[];
  isPlaying?: boolean;
  showControls?: boolean;
  onCharacterClick?: (id: string) => void;
  selectedCharacterId?: string | null;
}

export default function AnimationStage({
  backgroundId = 'forest',
  characters = [],
  isPlaying = true,
  showControls = true,
  onCharacterClick,
  selectedCharacterId,
}: AnimationStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [internalPlaying, setInternalPlaying] = useState(isPlaying);
  const [time, setTime] = useState(0);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation loop for time
  useEffect(() => {
    if (!internalPlaying) return;

    const interval = setInterval(() => {
      setTime(t => t + 16);
    }, 16);

    return () => clearInterval(interval);
  }, [internalPlaying]);

  // Background configurations
  const BACKGROUND_CONFIGS: Record<string, { sky: string; ground: string; type: string }> = {
    forest: { sky: '#87CEEB', ground: '#228B22', type: 'nature' },
    park: { sky: '#87CEEB', ground: '#90EE90', type: 'nature' },
    meadow: { sky: '#87CEEB', ground: '#7CFC00', type: 'nature' },
    beach: { sky: '#87CEEB', ground: '#F4A460', type: 'nature' },
    night: { sky: '#1a1a2e', ground: '#2d3436', type: 'night' },
    classroom: { sky: '#F5F5DC', ground: '#DEB887', type: 'indoor' },
    bedroom: { sky: '#E6E6FA', ground: '#D2B48C', type: 'indoor' },
    city: { sky: '#87CEEB', ground: '#808080', type: 'urban' },
  };

  const bgConfig = BACKGROUND_CONFIGS[backgroundId] || BACKGROUND_CONFIGS.forest;

  // Render background gradient
  const renderBackground = () => {
    return (
      <>
        {/* Sky */}
        <div 
          className="absolute inset-0" 
          style={{ background: `linear-gradient(to bottom, ${bgConfig.sky}, ${bgConfig.sky}dd)` }} 
        />

        {/* Sun/Moon */}
        {bgConfig.type !== 'night' && bgConfig.type !== 'indoor' && (
          <div
            className="absolute w-20 h-20 rounded-full bg-yellow-200 shadow-lg"
            style={{
              top: '10%',
              right: '15%',
              boxShadow: '0 0 60px 20px rgba(255, 255, 200, 0.5)',
            }}
          />
        )}

        {/* Clouds */}
        {bgConfig.type === 'nature' && (
          <>
            <div className="absolute top-[15%] left-[10%] opacity-80">
              <svg width="120" height="60" viewBox="0 0 120 60">
                <ellipse cx="30" cy="40" rx="25" ry="15" fill="white" />
                <ellipse cx="55" cy="35" rx="30" ry="20" fill="white" />
                <ellipse cx="85" cy="40" rx="25" ry="15" fill="white" />
              </svg>
            </div>
            <div className="absolute top-[20%] right-[20%] opacity-60">
              <svg width="100" height="50" viewBox="0 0 100 50">
                <ellipse cx="25" cy="35" rx="20" ry="12" fill="white" />
                <ellipse cx="50" cy="30" rx="25" ry="15" fill="white" />
                <ellipse cx="75" cy="35" rx="20" ry="12" fill="white" />
              </svg>
            </div>
          </>
        )}

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30%]"
          style={{ backgroundColor: bgConfig.ground }}
        />

        {/* Trees for nature backgrounds */}
        {bgConfig.type === 'nature' && (
          <>
            <svg className="absolute bottom-[25%] left-[5%]" width="80" height="120" viewBox="0 0 80 120">
              <rect x="35" y="80" width="10" height="40" fill="#8B4513" />
              <ellipse cx="40" cy="50" rx="35" ry="45" fill="#228B22" />
              <ellipse cx="40" cy="40" rx="25" ry="30" fill="#32CD32" />
            </svg>
            <svg className="absolute bottom-[25%] right-[8%]" width="70" height="100" viewBox="0 0 70 100">
              <rect x="30" y="70" width="10" height="30" fill="#8B4513" />
              <ellipse cx="35" cy="45" rx="30" ry="40" fill="#228B22" />
              <ellipse cx="35" cy="35" rx="20" ry="25" fill="#32CD32" />
            </svg>
            <svg className="absolute bottom-[22%] left-[25%]" width="60" height="40" viewBox="0 0 60 40">
              <ellipse cx="15" cy="30" rx="15" ry="12" fill="#228B22" />
              <ellipse cx="30" cy="25" rx="18" ry="15" fill="#32CD32" />
              <ellipse cx="45" cy="30" rx="15" ry="12" fill="#228B22" />
            </svg>
          </>
        )}

        {/* Flowers */}
        {backgroundId === 'park' && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-[23%]"
                style={{ left: `${10 + i * 12}%` }}
              >
                <svg width="20" height="30" viewBox="0 0 20 30">
                  <line x1="10" y1="15" x2="10" y2="30" stroke="#228B22" strokeWidth="2" />
                  <circle cx="10" cy="10" r="6" fill={['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8E72'][i % 4]} />
                  <circle cx="10" cy="10" r="3" fill="#FFE66D" />
                </svg>
              </div>
            ))}
          </>
        )}

        {/* Stars for night */}
        {bgConfig.type === 'night' && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: `${5 + Math.random() * 40}%`,
                  left: `${5 + Math.random() * 90}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            <div
              className="absolute w-16 h-16 rounded-full bg-yellow-100"
              style={{
                top: '10%',
                right: '15%',
                boxShadow: '0 0 40px 10px rgba(255, 255, 200, 0.3)',
              }}
            />
          </>
        )}
      </>
    );
  };

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
      {/* Stage */}
      <div
        ref={stageRef}
        className="relative w-full h-full"
        style={{ aspectRatio: '16/9' }}
      >
        {/* Background */}
        {renderBackground()}

        {/* Characters */}
        <div className="absolute inset-0">
          {characters.map((char) => {
            const characterData = getCharacterById(char.characterId);
            if (!characterData) return null;

            // Convert percentage to pixels
            const xPos = (char.x / 100) * dimensions.width - (characterData.width * char.scale) / 2;
            const yPos = (char.y / 100) * dimensions.height - (characterData.height * char.scale);

            return (
              <div
                key={char.id}
                className="absolute"
                style={{
                  left: xPos,
                  top: yPos,
                }}
              >
                <AnimatedCharacterComponent
                  character={characterData}
                  animation={internalPlaying ? char.animation : 'idle'}
                  scale={char.scale}
                  flipX={char.flipX}
                  isSelected={selectedCharacterId === char.id}
                  onClick={() => onCharacterClick?.(char.id)}
                />
              </div>
            );
          })}
        </div>

        {/* Playback Controls */}
        {showControls && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
            <button
              onClick={() => setInternalPlaying(!internalPlaying)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {internalPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setTime(0)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-white/30" />
            <span className="text-white text-sm font-mono">
              {Math.floor(time / 1000)}:{String(Math.floor((time % 1000) / 10)).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
