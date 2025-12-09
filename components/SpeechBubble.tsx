'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type BubbleStyle = 'speech' | 'thought' | 'shout' | 'whisper' | 'narration';

interface SpeechBubbleProps {
  text: string;
  style?: BubbleStyle;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isVisible?: boolean;
  characterName?: string;
  className?: string;
}

const bubbleStyles: Record<BubbleStyle, {
  bg: string;
  border: string;
  text: string;
  tail: string;
  animation: object;
}> = {
  speech: {
    bg: 'bg-white',
    border: 'border-2 border-gray-800',
    text: 'text-gray-800',
    tail: 'speech',
    animation: { scale: [0.8, 1.05, 1], opacity: [0, 1] },
  },
  thought: {
    bg: 'bg-white/90',
    border: 'border-2 border-gray-400 border-dashed',
    text: 'text-gray-600 italic',
    tail: 'thought',
    animation: { scale: [0.9, 1], opacity: [0, 0.5, 1] },
  },
  shout: {
    bg: 'bg-yellow-100',
    border: 'border-3 border-red-500',
    text: 'text-red-600 font-bold uppercase',
    tail: 'shout',
    animation: { scale: [1.2, 0.95, 1.1, 1], rotate: [-2, 2, -1, 0] },
  },
  whisper: {
    bg: 'bg-gray-100/80',
    border: 'border border-gray-300',
    text: 'text-gray-500 text-sm italic',
    tail: 'whisper',
    animation: { scale: [0.95, 1], opacity: [0, 0.8, 1] },
  },
  narration: {
    bg: 'bg-gradient-to-r from-purple-500/90 to-pink-500/90',
    border: 'border-0',
    text: 'text-white',
    tail: 'none',
    animation: { y: [10, 0], opacity: [0, 1] },
  },
};

export default function SpeechBubble({
  text,
  style = 'speech',
  position = 'top',
  isVisible = true,
  characterName,
  className = '',
}: SpeechBubbleProps) {
  const bubbleStyle = bubbleStyles[style];
  
  // Position classes
  const positionClasses = {
    top: 'bottom-full mb-3 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-3 left-1/2 -translate-x-1/2',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };

  // Tail SVG based on style and position
  const renderTail = () => {
    if (bubbleStyle.tail === 'none') return null;
    
    const tailPositions = {
      top: 'top-full left-1/2 -translate-x-1/2',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 rotate-180',
      left: 'left-full top-1/2 -translate-y-1/2 rotate-90',
      right: 'right-full top-1/2 -translate-y-1/2 -rotate-90',
    };
    
    if (bubbleStyle.tail === 'thought') {
      return (
        <div className={`absolute ${tailPositions[position]} flex flex-col items-center gap-1`}>
          <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-400" />
          <div className="w-2 h-2 rounded-full bg-white border-2 border-gray-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-white border border-gray-400" />
        </div>
      );
    }
    
    if (bubbleStyle.tail === 'shout') {
      return (
        <svg 
          className={`absolute ${tailPositions[position]} w-6 h-4`}
          viewBox="0 0 24 16"
        >
          <path 
            d="M0 0 L12 16 L24 0" 
            fill="#FEF3C7" 
            stroke="#EF4444" 
            strokeWidth="3"
          />
        </svg>
      );
    }
    
    // Default speech tail
    return (
      <svg 
        className={`absolute ${tailPositions[position]} w-5 h-3`}
        viewBox="0 0 20 12"
      >
        <path 
          d="M0 0 Q10 0 10 12 Q10 0 20 0" 
          fill="white" 
          stroke="#1F2937" 
          strokeWidth="2"
        />
      </svg>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`absolute ${positionClasses[position]} z-50 ${className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={bubbleStyle.animation}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div 
            className={`relative px-4 py-3 rounded-2xl shadow-lg max-w-xs ${bubbleStyle.bg} ${bubbleStyle.border}`}
          >
            {characterName && (
              <div className="text-xs font-semibold text-purple-600 mb-1">
                {characterName}:
              </div>
            )}
            <p className={`text-sm leading-relaxed ${bubbleStyle.text}`}>
              {text}
            </p>
            {renderTail()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Quick bubble presets for common scenarios
export const BubblePresets = {
  greeting: (name: string) => ({ text: `Hi there!`, style: 'speech' as BubbleStyle, characterName: name }),
  thinking: (thought: string) => ({ text: thought, style: 'thought' as BubbleStyle }),
  excited: (text: string, name: string) => ({ text: text.toUpperCase() + '!', style: 'shout' as BubbleStyle, characterName: name }),
  whispered: (secret: string) => ({ text: `(${secret})`, style: 'whisper' as BubbleStyle }),
  narration: (text: string) => ({ text, style: 'narration' as BubbleStyle }),
};
