'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type TransitionType = 
  | 'none'
  | 'fade'
  | 'fade-black'
  | 'fade-white'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'wipe-left'
  | 'wipe-right'
  | 'wipe-up'
  | 'wipe-down'
  | 'circle-in'
  | 'circle-out'
  | 'star-wipe'
  | 'heart-wipe'
  | 'dissolve'
  | 'pixelate'
  | 'blur'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'page-turn'
  | 'curtain';

interface SceneTransitionProps {
  type: TransitionType;
  isTransitioning: boolean;
  duration?: number;
  onComplete?: () => void;
  color?: string;
  children?: React.ReactNode;
}

// Transition overlay component
export default function SceneTransition({
  type,
  isTransitioning,
  duration = 500,
  onComplete,
  color = '#000000',
  children,
}: SceneTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'entering' | 'exiting'>('idle');

  useEffect(() => {
    if (isTransitioning) {
      setPhase('entering');
      const timer = setTimeout(() => {
        setPhase('exiting');
        setTimeout(() => {
          setPhase('idle');
          onComplete?.();
        }, duration / 2);
      }, duration / 2);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, duration, onComplete]);

  if (type === 'none' || phase === 'idle') {
    return <>{children}</>;
  }

  const getTransitionElement = () => {
    const isEntering = phase === 'entering';
    const halfDuration = duration / 2 / 1000;

    switch (type) {
      case 'fade':
      case 'fade-black':
        return (
          <motion.div
            className="fixed inset-0 z-50 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: isEntering ? 1 : 0 }}
            transition={{ duration: halfDuration }}
          />
        );

      case 'fade-white':
        return (
          <motion.div
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: isEntering ? 1 : 0 }}
            transition={{ duration: halfDuration }}
          />
        );

      case 'slide-left':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: color }}
            initial={{ x: '100%' }}
            animate={{ x: isEntering ? '0%' : '-100%' }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'slide-right':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: color }}
            initial={{ x: '-100%' }}
            animate={{ x: isEntering ? '0%' : '100%' }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'slide-up':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: color }}
            initial={{ y: '100%' }}
            animate={{ y: isEntering ? '0%' : '-100%' }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'slide-down':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: color }}
            initial={{ y: '-100%' }}
            animate={{ y: isEntering ? '0%' : '100%' }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'wipe-left':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformOrigin: 'right center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isEntering ? 1 : 0 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'wipe-right':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformOrigin: 'left center',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isEntering ? 1 : 0 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'wipe-up':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformOrigin: 'center bottom',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isEntering ? 1 : 0 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'wipe-down':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformOrigin: 'center top',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: isEntering ? 1 : 0 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'circle-in':
        return (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'transparent' }}
          >
            <motion.div
              className="rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0, height: 0 }}
              animate={{ 
                width: isEntering ? '300vmax' : 0, 
                height: isEntering ? '300vmax' : 0 
              }}
              transition={{ duration: halfDuration, ease: 'easeInOut' }}
            />
          </motion.div>
        );

      case 'circle-out':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              clipPath: `circle(${isEntering ? '0%' : '150%'} at center)`,
            }}
          >
            <motion.div
              className="w-full h-full"
              style={{ backgroundColor: color }}
              animate={{
                clipPath: isEntering 
                  ? 'circle(150% at center)' 
                  : 'circle(0% at center)',
              }}
              transition={{ duration: halfDuration, ease: 'easeInOut' }}
            />
          </motion.div>
        );

      case 'star-wipe':
        return (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.svg
              viewBox="0 0 100 100"
              className="w-[300vmax] h-[300vmax]"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: isEntering ? 1 : 0,
                rotate: isEntering ? 180 : 0,
              }}
              transition={{ duration: halfDuration, ease: 'easeInOut' }}
            >
              <polygon
                points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
                fill={color}
              />
            </motion.svg>
          </motion.div>
        );

      case 'heart-wipe':
        return (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.svg
              viewBox="0 0 100 100"
              className="w-[300vmax] h-[300vmax]"
              initial={{ scale: 0 }}
              animate={{ scale: isEntering ? 1 : 0 }}
              transition={{ duration: halfDuration, ease: 'easeInOut' }}
            >
              <path
                d="M50,88 C20,60 0,40 0,25 C0,10 15,0 30,0 C40,0 50,10 50,20 C50,10 60,0 70,0 C85,0 100,10 100,25 C100,40 80,60 50,88 Z"
                fill={color}
              />
            </motion.svg>
          </motion.div>
        );

      case 'dissolve':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              backdropFilter: 'blur(10px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isEntering ? 0.8 : 0 }}
            transition={{ duration: halfDuration }}
          />
        );

      case 'blur':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'transparent' }}
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ 
              backdropFilter: isEntering ? 'blur(20px)' : 'blur(0px)',
            }}
            transition={{ duration: halfDuration }}
          />
        );

      case 'zoom-in':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: color }}
            initial={{ scale: 0, borderRadius: '50%' }}
            animate={{ 
              scale: isEntering ? 3 : 0,
              borderRadius: isEntering ? '0%' : '50%',
            }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'zoom-out':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ backgroundColor: color }}
            initial={{ scale: 3 }}
            animate={{ scale: isEntering ? 1 : 3 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'flip-horizontal':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: isEntering ? 0 : 90 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'flip-vertical':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformStyle: 'preserve-3d',
              perspective: '1000px',
            }}
            initial={{ rotateX: -90 }}
            animate={{ rotateX: isEntering ? 0 : 90 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'page-turn':
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              perspective: '1500px',
              background: `linear-gradient(to right, ${color} 0%, ${color} 50%, #f5f5dc 50%, #f5f5dc 100%)`,
            }}
            initial={{ rotateY: -180 }}
            animate={{ rotateY: isEntering ? 0 : 180 }}
            transition={{ duration: halfDuration, ease: 'easeInOut' }}
          />
        );

      case 'curtain':
        return (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              className="h-full w-1/2"
              style={{ backgroundColor: '#8B0000' }}
              initial={{ x: '-100%' }}
              animate={{ x: isEntering ? '0%' : '-100%' }}
              transition={{ duration: halfDuration, ease: 'easeInOut' }}
            />
            <motion.div
              className="h-full w-1/2"
              style={{ backgroundColor: '#8B0000' }}
              initial={{ x: '100%' }}
              animate={{ x: isEntering ? '0%' : '100%' }}
              transition={{ duration: halfDuration, ease: 'easeInOut' }}
            />
          </div>
        );

      case 'pixelate':
        // Pixelate effect using CSS filter
        return (
          <motion.div
            className="fixed inset-0 z-50"
            style={{ 
              backgroundColor: color,
              imageRendering: 'pixelated',
            }}
            initial={{ opacity: 0, filter: 'blur(0px)' }}
            animate={{ 
              opacity: isEntering ? 1 : 0,
              filter: isEntering ? 'blur(5px)' : 'blur(0px)',
            }}
            transition={{ duration: halfDuration }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {getTransitionElement()}
      </AnimatePresence>
    </>
  );
}

// Transition selector component for UI
interface TransitionSelectorProps {
  value: TransitionType;
  onChange: (type: TransitionType) => void;
  className?: string;
}

export function TransitionSelector({ value, onChange, className = '' }: TransitionSelectorProps) {
  const transitions: { type: TransitionType; label: string; icon: string }[] = [
    { type: 'none', label: 'None', icon: '⊘' },
    { type: 'fade', label: 'Fade', icon: '◐' },
    { type: 'fade-black', label: 'Fade Black', icon: '◑' },
    { type: 'fade-white', label: 'Fade White', icon: '◒' },
    { type: 'slide-left', label: 'Slide Left', icon: '←' },
    { type: 'slide-right', label: 'Slide Right', icon: '→' },
    { type: 'slide-up', label: 'Slide Up', icon: '↑' },
    { type: 'slide-down', label: 'Slide Down', icon: '↓' },
    { type: 'wipe-left', label: 'Wipe Left', icon: '◧' },
    { type: 'wipe-right', label: 'Wipe Right', icon: '◨' },
    { type: 'circle-in', label: 'Circle In', icon: '◉' },
    { type: 'circle-out', label: 'Circle Out', icon: '◎' },
    { type: 'star-wipe', label: 'Star Wipe', icon: '★' },
    { type: 'heart-wipe', label: 'Heart Wipe', icon: '♥' },
    { type: 'dissolve', label: 'Dissolve', icon: '◌' },
    { type: 'blur', label: 'Blur', icon: '◯' },
    { type: 'zoom-in', label: 'Zoom In', icon: '⊕' },
    { type: 'zoom-out', label: 'Zoom Out', icon: '⊖' },
    { type: 'page-turn', label: 'Page Turn', icon: '📖' },
    { type: 'curtain', label: 'Curtain', icon: '🎭' },
  ];

  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      {transitions.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`p-2 rounded-lg text-center transition-all ${
            value === type
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <div className="text-xl mb-1">{icon}</div>
          <div className="text-xs">{label}</div>
        </button>
      ))}
    </div>
  );
}

// Hook for managing transitions
export function useSceneTransition(defaultType: TransitionType = 'fade') {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>(defaultType);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const triggerTransition = (callback?: () => void, type?: TransitionType) => {
    if (type) setTransitionType(type);
    if (callback) {
      setPendingCallback(() => callback);
    }
    setIsTransitioning(true);
  };

  const handleComplete = () => {
    setIsTransitioning(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  return {
    isTransitioning,
    transitionType,
    setTransitionType,
    triggerTransition,
    handleComplete,
  };
}
