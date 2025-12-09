'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Palette,
  Shirt,
  Sparkles,
  Check,
  RotateCcw,
  Save,
  Wand2,
  Crown,
  Glasses,
  Star,
  Play,
  Pause,
} from 'lucide-react';
import { CHARACTER_RIGS, CharacterRig } from '@/lib/sprite-system';

// ============================================
// MODERN 2D CHARACTER ENGINE
// Enhanced with proper anatomy and story animations
// ============================================

// Animation types for story-driven actions
type AnimationType = 
  | 'idle' 
  | 'wave' 
  | 'walk' 
  | 'jump' 
  | 'dance' 
  | 'talk' 
  | 'point' 
  | 'greet' 
  | 'think' 
  | 'celebrate'
  | 'sad'
  | 'surprised'
  | 'walkForward';

interface Character2DProps {
  colors: {
    primary: string;
    secondary: string;
    skin: string;
    hair: string;
    eyes: string;
  };
  accessories: {
    hat: boolean;
    glasses: boolean;
    cape: boolean;
    wings: boolean;
  };
  outfit: string;
  isAnimating?: boolean;
  animation?: AnimationType;
  direction?: 'left' | 'right' | 'front';
  expression?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';
}

const Character2D: React.FC<Character2DProps> = ({
  colors,
  accessories,
  outfit,
  isAnimating = true,
  animation = 'idle',
  direction = 'front',
  expression = 'neutral',
}) => {
  
  // Get head animation based on action
  const getHeadAnimation = () => {
    if (!isAnimating) return {};
    
    switch (animation) {
      case 'talk':
        return {
          rotate: [-2, 2, -1, 2, -2],
          y: [0, -1, 0, -1, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'think':
        return {
          rotate: [0, 8, 8, 0],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'greet':
      case 'wave':
        return {
          rotate: [-3, 3, -3],
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'surprised':
        return {
          y: [0, -5, 0],
          scale: [1, 1.05, 1],
          transition: { duration: 0.3, repeat: 2, ease: 'easeOut' }
        };
      case 'sad':
        return {
          rotate: [0, -5, -5, 0],
          y: [0, 2, 2, 0],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'celebrate':
        return {
          rotate: [-5, 5, -5],
          y: [0, -3, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        };
      default:
        return {
          rotate: [-1, 1, -1],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  // Get arm animations based on action
  const getArmAnimation = (side: 'left' | 'right') => {
    if (!isAnimating) return {};
    
    switch (animation) {
      case 'wave':
      case 'greet':
        return side === 'right' ? {
          rotate: [-120, -140, -120],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        } : {
          rotate: [15, 10, 15],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'point':
        return side === 'right' ? {
          rotate: [-90],
          x: [0, 5, 0],
          transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
        } : {
          rotate: [15, 10, 15],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'walk':
      case 'walkForward':
        return {
          rotate: side === 'left' ? [25, -25, 25] : [-25, 25, -25],
          transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'dance':
        return {
          rotate: side === 'left' ? [-45, 30, -60, 30, -45] : [45, -30, 60, -30, 45],
          y: [0, -5, 0, -5, 0],
          transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'jump':
        return {
          rotate: side === 'left' ? [-60, -80, -60] : [60, 80, 60],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'talk':
        return {
          rotate: side === 'left' ? [10, 20, 15, 20, 10] : [-10, -20, -15, -20, -10],
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'think':
        return side === 'right' ? {
          rotate: [-100],
          transition: { duration: 0.5 }
        } : {
          rotate: [15, 10, 15],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'celebrate':
        return {
          rotate: side === 'left' ? [-120, -150, -120] : [120, 150, 120],
          transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'sad':
        return {
          rotate: side === 'left' ? [20, 15, 20] : [-20, -15, -20],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'surprised':
        return {
          rotate: side === 'left' ? [-30, -50, -30] : [30, 50, 30],
          transition: { duration: 0.3, repeat: 2, ease: 'easeOut' }
        };
      default: // idle
        return {
          rotate: side === 'left' ? [15, 10, 15] : [-15, -10, -15],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  // Get leg animations
  const getLegAnimation = (side: 'left' | 'right') => {
    if (!isAnimating) return {};
    
    switch (animation) {
      case 'walk':
      case 'walkForward':
        return {
          rotate: side === 'left' ? [-20, 20, -20] : [20, -20, 20],
          transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'dance':
        return {
          rotate: side === 'left' ? [-15, 15, -20, 15, -15] : [15, -15, 20, -15, 15],
          transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'jump':
        return {
          rotate: side === 'left' ? [15, 30, 15] : [-15, -30, -15],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'celebrate':
        return {
          rotate: side === 'left' ? [-10, 10, -10] : [10, -10, 10],
          transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
        };
      default:
        return {
          rotate: [0, 0, 0],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  // Get body/torso animation
  const getBodyAnimation = () => {
    if (!isAnimating) return {};
    
    switch (animation) {
      case 'dance':
        return {
          y: [0, -10, 0, -8, 0],
          rotate: [-3, 3, -3],
          transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'jump':
        return {
          y: [0, -25, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeOut' }
        };
      case 'walk':
      case 'walkForward':
        return {
          y: [0, -3, 0],
          rotate: [-1, 1, -1],
          transition: { duration: 0.25, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'celebrate':
        return {
          y: [0, -8, 0],
          scale: [1, 1.02, 1],
          transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'sad':
        return {
          y: [0, 2, 0],
          rotate: [-2, -2, -2],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'talk':
        return {
          y: [0, -1, 0],
          transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
        };
      default:
        return {
          y: [0, -2, 0],
          transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
        };
    }
  };

  // Get mouth animation based on expression/action
  const getMouthAnimation = () => {
    if (!isAnimating) return {};
    
    switch (animation) {
      case 'talk':
        return {
          scaleY: [1, 0.3, 1, 0.5, 1],
          scaleX: [1, 1.2, 1, 1.1, 1],
          transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'celebrate':
      case 'greet':
        return {
          scaleX: [1, 1.3, 1],
          transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'surprised':
        return {
          scaleY: [1, 1.8, 1],
          scaleX: [1, 0.7, 1],
          transition: { duration: 0.3, repeat: 2, ease: 'easeOut' }
        };
      default:
        return {};
    }
  };

  // Get eye animation
  const getEyeAnimation = () => {
    if (!isAnimating) return {};
    
    switch (animation) {
      case 'surprised':
        return {
          scale: [1, 1.3, 1],
          transition: { duration: 0.3, repeat: 2, ease: 'easeOut' }
        };
      case 'sad':
        return {
          y: [0, 2, 0],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      default:
        return {
          scaleY: [1, 0.1, 1],
          transition: { duration: 3, repeat: Infinity, repeatDelay: 2 }
        };
    }
  };

  // Calculate direction transform
  const getDirectionTransform = () => {
    switch (direction) {
      case 'left': return 'scaleX(-1)';
      case 'right': return 'scaleX(1)';
      default: return 'scaleX(1)';
    }
  };

  // Get expression-based mouth shape
  const getMouthShape = () => {
    switch (expression) {
      case 'happy': return 'M7 3 Q10 8 13 3';
      case 'sad': return 'M7 6 Q10 2 13 6';
      case 'surprised': return 'M10 3 A2 3 0 1 1 10 9 A2 3 0 1 1 10 3';
      case 'angry': return 'M7 5 L13 5';
      default: return 'M7 4 Q10 6 13 4';
    }
  };

  // Get eyebrow position based on expression
  const getEyebrowTransform = (side: 'left' | 'right') => {
    switch (expression) {
      case 'angry': return side === 'left' ? 'rotate(15deg)' : 'rotate(-15deg)';
      case 'sad': return side === 'left' ? 'rotate(-10deg) translateY(2px)' : 'rotate(10deg) translateY(2px)';
      case 'surprised': return 'translateY(-3px)';
      default: return 'rotate(0deg)';
    }
  };

  return (
    <motion.div 
      className="relative w-36 h-64"
      style={{ transform: getDirectionTransform() }}
      animate={getBodyAnimation()}
    >
      {/* Dynamic Shadow */}
      <motion.div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black/20 rounded-full blur-md"
        animate={animation === 'jump' ? { 
          scale: [1, 0.5, 1],
          opacity: [0.25, 0.1, 0.25]
        } : {
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.25, 0.2]
        }}
        transition={{ duration: animation === 'jump' ? 0.4 : 2, repeat: Infinity }}
      />

      {/* Cape (behind body) */}
      {accessories.cape && (
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 w-32 origin-top"
          style={{ top: '55px', zIndex: 0 }}
          animate={{ 
            skewX: animation === 'walk' ? [-5, 5, -5] : [-2, 2, -2],
            scaleY: [1, 1.03, 1]
          }}
          transition={{ duration: animation === 'walk' ? 0.5 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 100 130" className="w-full h-auto">
            <defs>
              <linearGradient id="capeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path 
              d="M15 0 L50 5 L85 0 Q90 65 80 130 L50 120 L20 130 Q10 65 15 0" 
              fill="url(#capeGrad)"
            />
            {/* Cape shine */}
            <path d="M30 10 Q35 60 35 110" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
          </svg>
        </motion.div>
      )}

      {/* Wings (behind body) */}
      {accessories.wings && (
        <>
          <motion.div 
            className="absolute origin-right"
            style={{ left: '-15px', top: '60px', zIndex: 0 }}
            animate={{ 
              rotate: [-8, -25, -8],
              scaleX: [1, 1.15, 1]
            }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 60 70" className="w-14 h-16">
              <defs>
                <linearGradient id="wingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="35" rx="22" ry="32" fill="url(#wingGrad1)" opacity={0.85} />
              <ellipse cx="20" cy="30" rx="12" ry="20" fill="rgba(255,255,255,0.3)" />
            </svg>
          </motion.div>
          <motion.div 
            className="absolute origin-left"
            style={{ right: '-15px', top: '60px', zIndex: 0 }}
            animate={{ 
              rotate: [8, 25, 8],
              scaleX: [1, 1.15, 1]
            }}
            transition={{ duration: 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg viewBox="0 0 60 70" className="w-14 h-16" style={{ transform: 'scaleX(-1)' }}>
              <defs>
                <linearGradient id="wingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
              </defs>
              <ellipse cx="25" cy="35" rx="22" ry="32" fill="url(#wingGrad2)" opacity={0.85} />
              <ellipse cx="20" cy="30" rx="12" ry="20" fill="rgba(255,255,255,0.3)" />
            </svg>
          </motion.div>
        </>
      )}

      {/* LEFT LEG */}
      <motion.div 
        className="absolute origin-top"
        style={{ left: '38px', top: '158px', zIndex: 1 }}
        animate={getLegAnimation('left')}
      >
        {/* Upper Leg (Thigh) - Modern slim jeans look */}
        <div 
          className="w-6 h-14 rounded-md"
          style={{ 
            backgroundColor: colors.secondary,
            background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.secondary}ee 50%, ${colors.secondary}cc 100%)`
          }}
        />
        {/* Lower Leg (Calf) */}
        <motion.div 
          className="absolute w-5 h-12 rounded-md origin-top"
          style={{ 
            backgroundColor: colors.secondary, 
            left: '2px', 
            top: '52px',
            background: `linear-gradient(90deg, ${colors.secondary}dd 0%, ${colors.secondary} 50%, ${colors.secondary}bb 100%)`
          }}
          animate={isAnimating && (animation === 'walk' || animation === 'walkForward') ? {
            rotate: [0, -15, 0],
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Modern Sneaker */}
          <div 
            className="absolute -bottom-4 -left-2 w-10 h-6 rounded-lg shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)'
            }}
          >
            {/* Shoe sole */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white rounded-b-lg" />
            {/* Shoe accent stripe */}
            <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            {/* Laces */}
            <div className="absolute top-2.5 left-2 w-3 h-0.5 bg-white/80 rounded-full" />
            <div className="absolute top-2.5 right-2 w-3 h-0.5 bg-white/80 rounded-full" />
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT LEG */}
      <motion.div 
        className="absolute origin-top"
        style={{ right: '38px', top: '158px', zIndex: 1 }}
        animate={getLegAnimation('right')}
      >
        {/* Upper Leg */}
        <div 
          className="w-6 h-14 rounded-md"
          style={{ 
            backgroundColor: colors.secondary,
            background: `linear-gradient(90deg, ${colors.secondary}cc 0%, ${colors.secondary}ee 50%, ${colors.secondary} 100%)`
          }}
        />
        {/* Lower Leg */}
        <motion.div 
          className="absolute w-5 h-12 rounded-md origin-top"
          style={{ 
            backgroundColor: colors.secondary, 
            left: '2px', 
            top: '52px',
            background: `linear-gradient(90deg, ${colors.secondary}bb 0%, ${colors.secondary} 50%, ${colors.secondary}dd 100%)`
          }}
          animate={isAnimating && (animation === 'walk' || animation === 'walkForward') ? {
            rotate: [0, 15, 0],
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
        >
          {/* Modern Sneaker */}
          <div 
            className="absolute -bottom-4 -left-2 w-10 h-6 rounded-lg shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)'
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-white rounded-b-lg" />
            <div className="absolute top-1 left-1 right-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            <div className="absolute top-2.5 left-2 w-3 h-0.5 bg-white/80 rounded-full" />
            <div className="absolute top-2.5 right-2 w-3 h-0.5 bg-white/80 rounded-full" />
          </div>
        </motion.div>
      </motion.div>

      {/* TORSO - Modern fitted style */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 w-20 h-24 rounded-2xl shadow-lg overflow-hidden"
        style={{ 
          background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
          top: '68px', 
          zIndex: 2 
        }}
      >
        {/* Shirt collar / V-neck */}
        <svg viewBox="0 0 80 20" className="absolute top-0 left-0 w-full">
          <path 
            d="M0 0 L35 0 L40 12 L45 0 L80 0 L80 20 L0 20 Z" 
            fill={colors.skin}
          />
        </svg>
        
        {/* Shirt design - modern minimal */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full opacity-10 bg-white" />
        
        {/* Modern belt */}
        <div 
          className="absolute bottom-3 left-0 right-0 h-3"
          style={{ backgroundColor: '#1f2937' }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-0.5 w-4 h-2 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-sm" />
        </div>
      </div>

      {/* NECK - Properly connected, not bent */}
      <div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: '58px', zIndex: 2 }}
      >
        {/* Neck cylinder with proper shading */}
        <div 
          className="w-8 h-12 rounded-md"
          style={{ 
            background: `linear-gradient(90deg, ${colors.skin}cc 0%, ${colors.skin} 30%, ${colors.skin} 70%, ${colors.skin}cc 100%)`
          }}
        />
      </div>

      {/* LEFT ARM */}
      <motion.div 
        className="absolute origin-top"
        style={{ left: '5px', top: '72px', zIndex: 3 }}
        animate={getArmAnimation('left')}
      >
        {/* Upper Arm (Sleeve) */}
        <div 
          className="w-5 h-12 rounded-full shadow-sm"
          style={{ 
            background: `linear-gradient(90deg, ${colors.primary}cc 0%, ${colors.primary} 50%, ${colors.primary}cc 100%)`
          }}
        />
        {/* Forearm (Skin) */}
        <motion.div 
          className="absolute w-4 h-11 rounded-full origin-top"
          style={{ 
            background: `linear-gradient(90deg, ${colors.skin}cc 0%, ${colors.skin} 50%, ${colors.skin}cc 100%)`,
            left: '2px', 
            top: '44px' 
          }}
          animate={isAnimating && animation === 'point' ? {} : { rotate: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Hand */}
          <motion.div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-md"
            style={{ 
              background: `radial-gradient(circle at 30% 30%, ${colors.skin} 0%, ${colors.skin}dd 100%)`
            }}
          >
            {/* Fingers */}
            {animation === 'point' ? (
              // Pointing finger
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-1.5 rounded-full" 
                   style={{ backgroundColor: colors.skin }} />
            ) : (
              // Normal fingers
              <>
                <div className="absolute -bottom-1 left-0.5 w-1 h-2.5 rounded-full" style={{ backgroundColor: colors.skin }} />
                <div className="absolute -bottom-1.5 left-2 w-1 h-3 rounded-full" style={{ backgroundColor: colors.skin }} />
                <div className="absolute -bottom-1 right-2 w-1 h-2.5 rounded-full" style={{ backgroundColor: colors.skin }} />
                <div className="absolute -bottom-0.5 right-0.5 w-1 h-2 rounded-full" style={{ backgroundColor: colors.skin }} />
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* RIGHT ARM */}
      <motion.div 
        className="absolute origin-top"
        style={{ right: '5px', top: '72px', zIndex: 3 }}
        animate={getArmAnimation('right')}
      >
        {/* Upper Arm */}
        <div 
          className="w-5 h-12 rounded-full shadow-sm"
          style={{ 
            background: `linear-gradient(90deg, ${colors.primary}cc 0%, ${colors.primary} 50%, ${colors.primary}cc 100%)`
          }}
        />
        {/* Forearm */}
        <motion.div 
          className="absolute w-4 h-11 rounded-full origin-top"
          style={{ 
            background: `linear-gradient(90deg, ${colors.skin}cc 0%, ${colors.skin} 50%, ${colors.skin}cc 100%)`,
            left: '2px', 
            top: '44px' 
          }}
          animate={isAnimating && (animation === 'wave' || animation === 'greet') ? {
            rotate: [-20, 20, -20],
          } : { rotate: [0, -3, 0] }}
          transition={{ duration: animation === 'wave' ? 0.3 : 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Hand */}
          <motion.div 
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full shadow-md"
            style={{ 
              background: `radial-gradient(circle at 30% 30%, ${colors.skin} 0%, ${colors.skin}dd 100%)`
            }}
            animate={(animation === 'wave' || animation === 'greet') ? {
              rotate: [-15, 15, -15],
            } : {}}
            transition={{ duration: 0.2, repeat: Infinity }}
          >
            {/* Fingers - spread for wave */}
            {(animation === 'wave' || animation === 'greet') ? (
              <>
                <div className="absolute -top-2 left-0.5 w-1 h-2.5 rounded-full" style={{ backgroundColor: colors.skin, transform: 'rotate(-20deg)' }} />
                <div className="absolute -top-2.5 left-2 w-1 h-3 rounded-full" style={{ backgroundColor: colors.skin, transform: 'rotate(-5deg)' }} />
                <div className="absolute -top-2.5 right-2 w-1 h-3 rounded-full" style={{ backgroundColor: colors.skin, transform: 'rotate(5deg)' }} />
                <div className="absolute -top-2 right-0.5 w-1 h-2.5 rounded-full" style={{ backgroundColor: colors.skin, transform: 'rotate(20deg)' }} />
              </>
            ) : (
              <>
                <div className="absolute -bottom-1 left-0.5 w-1 h-2.5 rounded-full" style={{ backgroundColor: colors.skin }} />
                <div className="absolute -bottom-1.5 left-2 w-1 h-3 rounded-full" style={{ backgroundColor: colors.skin }} />
                <div className="absolute -bottom-1 right-2 w-1 h-2.5 rounded-full" style={{ backgroundColor: colors.skin }} />
                <div className="absolute -bottom-0.5 right-0.5 w-1 h-2 rounded-full" style={{ backgroundColor: colors.skin }} />
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* HEAD */}
      <motion.div 
        className="absolute left-1/2 -translate-x-1/2 w-24 h-24"
        style={{ top: '0px', zIndex: 4 }}
        animate={getHeadAnimation()}
      >
        {/* Head shape - Modern rounded */}
        <div 
          className="absolute inset-0 rounded-full shadow-lg"
          style={{ 
            background: `radial-gradient(circle at 35% 35%, ${colors.skin} 0%, ${colors.skin}ee 70%, ${colors.skin}cc 100%)`
          }}
        />
        
        {/* Hair - Modern styled */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[90%] overflow-hidden">
          <svg viewBox="0 0 90 50" className="w-full">
            <defs>
              <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.hair} />
                <stop offset="100%" stopColor={colors.hair} stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Main hair shape - modern swept style */}
            <ellipse cx="45" cy="25" rx="42" ry="23" fill="url(#hairGrad)" />
            {/* Hair texture/shine */}
            <path d="M20 20 Q35 15 50 20" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" />
            {/* Side hair */}
            <ellipse cx="12" cy="35" rx="10" ry="15" fill={colors.hair} />
            <ellipse cx="78" cy="35" rx="10" ry="15" fill={colors.hair} />
          </svg>
        </div>

        {/* Ears */}
        <div 
          className="absolute top-10 -left-2 w-4 h-6 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${colors.skin}bb 0%, ${colors.skin} 100%)`,
            border: `2px solid ${colors.hair}40`
          }}
        />
        <div 
          className="absolute top-10 -right-2 w-4 h-6 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, ${colors.skin} 0%, ${colors.skin}bb 100%)`,
            border: `2px solid ${colors.hair}40`
          }}
        />

        {/* Eyebrows */}
        <div 
          className="absolute top-8 left-5 w-5 h-1.5 rounded-full"
          style={{ 
            backgroundColor: colors.hair,
            transform: getEyebrowTransform('left')
          }}
        />
        <div 
          className="absolute top-8 right-5 w-5 h-1.5 rounded-full"
          style={{ 
            backgroundColor: colors.hair,
            transform: getEyebrowTransform('right')
          }}
        />

        {/* Eyes */}
        <motion.div 
          className="absolute top-11 left-5 w-5 h-6 rounded-full bg-white border border-gray-200 shadow-inner overflow-hidden"
          animate={getEyeAnimation()}
        >
          <motion.div 
            className="absolute bottom-1 left-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.eyes }}
          >
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white" />
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute top-11 right-5 w-5 h-6 rounded-full bg-white border border-gray-200 shadow-inner overflow-hidden"
          animate={getEyeAnimation()}
        >
          <motion.div 
            className="absolute bottom-1 left-1 w-3 h-3 rounded-full"
            style={{ backgroundColor: colors.eyes }}
          >
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white" />
          </motion.div>
        </motion.div>

        {/* Nose */}
        <div 
          className="absolute top-[52px] left-1/2 -translate-x-1/2 w-2.5 h-3 rounded-full"
          style={{ backgroundColor: `${colors.skin}cc` }}
        />

        {/* Mouth - Animated based on expression */}
        <motion.svg 
          viewBox="0 0 20 12" 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-4"
          animate={getMouthAnimation()}
        >
          <path 
            d={getMouthShape()}
            stroke="#e57373"
            strokeWidth="2"
            fill={expression === 'surprised' ? '#ffcdd2' : 'none'}
            strokeLinecap="round"
          />
        </motion.svg>

        {/* Blush */}
        <div className="absolute bottom-6 left-2 w-4 h-2 rounded-full bg-pink-300 opacity-40" />
        <div className="absolute bottom-6 right-2 w-4 h-2 rounded-full bg-pink-300 opacity-40" />

        {/* Glasses accessory */}
        {accessories.glasses && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10">
            <svg viewBox="0 0 70 24" className="w-20 h-7">
              <circle cx="17" cy="12" r="10" fill="none" stroke="#1f2937" strokeWidth="2.5" />
              <circle cx="53" cy="12" r="10" fill="none" stroke="#1f2937" strokeWidth="2.5" />
              <path d="M27 12 L43 12" stroke="#1f2937" strokeWidth="2.5" />
              <path d="M7 12 L0 10" stroke="#1f2937" strokeWidth="2.5" />
              <path d="M63 12 L70 10" stroke="#1f2937" strokeWidth="2.5" />
              {/* Lens reflection */}
              <ellipse cx="14" cy="9" rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
              <ellipse cx="50" cy="9" rx="3" ry="2" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Hat accessory */}
      {accessories.hat && (
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 -top-5 z-10"
          animate={isAnimating ? { rotate: [-3, 3, -3], y: [0, -2, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg viewBox="0 0 70 50" className="w-20 h-14">
            <defs>
              <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {/* Crown base */}
            <ellipse cx="35" cy="45" rx="32" ry="5" fill="#f59e0b" />
            {/* Crown body */}
            <path d="M8 45 Q5 20 35 8 Q65 20 62 45" fill="url(#hatGrad)" />
            {/* Crown points */}
            <path d="M12 30 L18 15 L24 28" fill="#fcd34d" />
            <path d="M28 25 L35 5 L42 25" fill="#fcd34d" />
            <path d="M46 28 L52 15 L58 30" fill="#fcd34d" />
            {/* Jewels */}
            <circle cx="18" cy="18" r="3" fill="#ef4444" />
            <circle cx="35" cy="10" r="4" fill="#3b82f6" />
            <circle cx="52" cy="18" r="3" fill="#22c55e" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};

interface CharacterCustomization {
  id: string;
  name: string;
  rigId: string;
  colors: {
    primary: string;
    secondary: string;
    skin: string;
    hair: string;
    eyes: string;
  };
  accessories: {
    hat: boolean;
    glasses: boolean;
    cape: boolean;
    wings: boolean;
  };
  outfit: string;
  personality: string;
  aiGeneratedImage?: string; // AI-generated character image URL
  useAICharacter?: boolean; // Whether to use AI image instead of 2D character
}

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: CharacterCustomization) => void;
  initialCharacter?: Partial<CharacterCustomization>;
  mode: 'create' | 'edit';
}

const COLOR_PRESETS = {
  primary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'],
  secondary: ['#C44569', '#3DC1D3', '#2C3A47', '#6C5CE7', '#A29BFE', '#FD79A8', '#00B894', '#E17055'],
  skin: ['#FFDFC4', '#F0C8A0', '#D4A574', '#C68642', '#8D5524', '#5C3317', '#FFE0BD', '#FFCD94'],
  hair: ['#090806', '#2C222B', '#71635A', '#B7A69E', '#D6C4C2', '#CABFB1', '#DCD0BA', '#977961', '#E6CEA8', '#A55728', '#B55239', '#8D4A43'],
  eyes: ['#634E34', '#2E536F', '#3D671D', '#497665', '#1C7847', '#7F7F7F', '#0000FF', '#00FF00'],
};

const OUTFIT_OPTIONS = [
  { id: 'casual', name: 'Casual', icon: '👕' },
  { id: 'formal', name: 'Formal', icon: '👔' },
  { id: 'sporty', name: 'Sporty', icon: '🏃' },
  { id: 'fantasy', name: 'Fantasy', icon: '🧙' },
  { id: 'superhero', name: 'Superhero', icon: '🦸' },
  { id: 'princess', name: 'Princess', icon: '👸' },
  { id: 'pirate', name: 'Pirate', icon: '🏴‍☠️' },
  { id: 'astronaut', name: 'Astronaut', icon: '🚀' },
];

const PERSONALITY_OPTIONS = [
  { id: 'cheerful', name: 'Cheerful', emoji: '😊' },
  { id: 'brave', name: 'Brave', emoji: '💪' },
  { id: 'curious', name: 'Curious', emoji: '🤔' },
  { id: 'shy', name: 'Shy', emoji: '😳' },
  { id: 'mischievous', name: 'Mischievous', emoji: '😈' },
  { id: 'wise', name: 'Wise', emoji: '🦉' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡' },
  { id: 'calm', name: 'Calm', emoji: '😌' },
];

export default function CharacterCreatorModal({
  isOpen,
  onClose,
  onSave,
  initialCharacter,
  mode,
}: CharacterCreatorModalProps) {
  const [activeTab, setActiveTab] = useState<'base' | 'ai' | 'colors' | 'accessories' | 'personality'>('base');
  const [character, setCharacter] = useState<CharacterCustomization>({
    id: initialCharacter?.id || `char-${Date.now()}`,
    name: initialCharacter?.name || '',
    rigId: initialCharacter?.rigId || CHARACTER_RIGS[0]?.id || 'kiara',
    colors: initialCharacter?.colors || {
      primary: '#4ECDC4',
      secondary: '#2C3A47',
      skin: '#FFDFC4',
      hair: '#2C222B',
      eyes: '#634E34',
    },
    accessories: initialCharacter?.accessories || {
      hat: false,
      glasses: false,
      cape: false,
      wings: false,
    },
    outfit: initialCharacter?.outfit || 'casual',
    personality: initialCharacter?.personality || 'cheerful',
  });

  const [previewAnimation, setPreviewAnimation] = useState('idle');
  
  // AI Character Generation states
  const [aiCharacterPrompt, setAiCharacterPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedImage, setAiGeneratedImage] = useState<string | null>(null);
  const [aiGeneratedChars, setAiGeneratedChars] = useState<{url: string; prompt: string}[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [useAICharacter, setUseAICharacter] = useState(false);
  
  // AI Character Generation function
  const handleGenerateAICharacter = async () => {
    if (!aiCharacterPrompt.trim()) return;
    
    setIsGeneratingAI(true);
    setAiError(null);
    
    try {
      const res = await fetch('/api/imagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiCharacterPrompt,
          type: 'character',
          aspectRatio: '1:1',
          style: 'cartoon',
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Generation failed');
      }
      
      const data = await res.json();
      if (data.imageUrl) {
        setAiGeneratedImage(data.imageUrl);
        setAiGeneratedChars(prev => [{ url: data.imageUrl, prompt: aiCharacterPrompt }, ...prev].slice(0, 8));
        setUseAICharacter(true);
      }
    } catch (err: any) {
      console.error('AI Character error:', err);
      setAiError(err?.message || 'Failed to generate character');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  useEffect(() => {
    if (initialCharacter) {
      setCharacter({
        id: initialCharacter.id || `char-${Date.now()}`,
        name: initialCharacter.name || '',
        rigId: initialCharacter.rigId || CHARACTER_RIGS[0]?.id || 'kiara',
        colors: initialCharacter.colors || {
          primary: '#4ECDC4',
          secondary: '#2C3A47',
          skin: '#FFDFC4',
          hair: '#2C222B',
          eyes: '#634E34',
        },
        accessories: initialCharacter.accessories || {
          hat: false,
          glasses: false,
          cape: false,
          wings: false,
        },
        outfit: initialCharacter.outfit || 'casual',
        personality: initialCharacter.personality || 'cheerful',
      });
    }
  }, [initialCharacter]);

  const handleRandomize = () => {
    const randomRig = CHARACTER_RIGS[Math.floor(Math.random() * CHARACTER_RIGS.length)];
    const randomOutfit = OUTFIT_OPTIONS[Math.floor(Math.random() * OUTFIT_OPTIONS.length)];
    const randomPersonality = PERSONALITY_OPTIONS[Math.floor(Math.random() * PERSONALITY_OPTIONS.length)];
    
    setCharacter({
      ...character,
      rigId: randomRig.id,
      colors: {
        primary: COLOR_PRESETS.primary[Math.floor(Math.random() * COLOR_PRESETS.primary.length)],
        secondary: COLOR_PRESETS.secondary[Math.floor(Math.random() * COLOR_PRESETS.secondary.length)],
        skin: COLOR_PRESETS.skin[Math.floor(Math.random() * COLOR_PRESETS.skin.length)],
        hair: COLOR_PRESETS.hair[Math.floor(Math.random() * COLOR_PRESETS.hair.length)],
        eyes: COLOR_PRESETS.eyes[Math.floor(Math.random() * COLOR_PRESETS.eyes.length)],
      },
      accessories: {
        hat: Math.random() > 0.7,
        glasses: Math.random() > 0.7,
        cape: Math.random() > 0.8,
        wings: Math.random() > 0.9,
      },
      outfit: randomOutfit.id,
      personality: randomPersonality.id,
    });
  };

  const handleReset = () => {
    setCharacter({
      id: character.id,
      name: '',
      rigId: CHARACTER_RIGS[0]?.id || 'kiara',
      colors: {
        primary: '#4ECDC4',
        secondary: '#2C3A47',
        skin: '#FFDFC4',
        hair: '#2C222B',
        eyes: '#634E34',
      },
      accessories: {
        hat: false,
        glasses: false,
        cape: false,
        wings: false,
      },
      outfit: 'casual',
      personality: 'cheerful',
    });
  };

  const selectedRig = CHARACTER_RIGS.find(r => r.id === character.rigId);
  
  // Animation preview state - includes all story-acting animations
  const [animationState, setAnimationState] = useState<AnimationType>('idle');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-5xl bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'create' ? 'Create Character' : 'Edit Character'}
                </h2>
                <p className="text-sm text-gray-400">Customize your character's appearance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomize}
                className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-colors"
                title="Randomize"
              >
                <Wand2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-400 transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(80vh-120px)]">
            {/* Preview Panel - Compact Character Preview */}
            <div className="w-1/3 bg-gray-800 p-4 flex flex-col items-center justify-start border-r border-gray-700 overflow-y-auto">
              {/* Character Preview */}
              <div 
                className="w-full aspect-[3/4] max-h-[280px] rounded-xl flex items-center justify-center mb-3 relative overflow-hidden"
                style={{ backgroundColor: useAICharacter && aiGeneratedImage ? '#1a1a2e' : character.colors.primary + '15' }}
              >
                {useAICharacter && aiGeneratedImage ? (
                  /* AI Generated Character Preview */
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={aiGeneratedImage} 
                      alt="AI Character" 
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 bg-purple-500 rounded-lg text-xs text-white font-medium">
                      AI Generated
                    </div>
                  </div>
                ) : (
                  /* Professional 2D Animated Character */
                  <Character2D
                    colors={character.colors}
                    accessories={character.accessories}
                    outfit={character.outfit}
                    isAnimating={true}
                    animation={animationState}
                  />
                )}
              </div>
              
              {/* Character Type Toggle */}
              {aiGeneratedImage && (
                <div className="w-full mb-4 p-3 bg-gray-900 rounded-xl">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUseAICharacter(false)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        !useAICharacter 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      2D Character
                    </button>
                    <button
                      onClick={() => setUseAICharacter(true)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        useAICharacter 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      AI Character
                    </button>
                  </div>
                </div>
              )}
              
              {/* Animation Controls - Only show for 2D character */}
              {!useAICharacter && (
                <div className="w-full mb-4">
                  <label className="text-xs text-gray-400 mb-2 block text-center">Animation Preview</label>
                  <div className="flex gap-1.5 justify-center flex-wrap">
                    {([
                      { id: 'idle', label: 'Idle', emoji: '🧍' },
                      { id: 'wave', label: 'Wave', emoji: '👋' },
                      { id: 'walk', label: 'Walk', emoji: '🚶' },
                      { id: 'walkForward', label: 'Forward', emoji: '🏃' },
                      { id: 'jump', label: 'Jump', emoji: '⬆️' },
                      { id: 'dance', label: 'Dance', emoji: '💃' },
                      { id: 'talk', label: 'Talk', emoji: '💬' },
                      { id: 'point', label: 'Point', emoji: '👉' },
                      { id: 'greet', label: 'Greet', emoji: '🙌' },
                      { id: 'think', label: 'Think', emoji: '🤔' },
                      { id: 'celebrate', label: 'Celebrate', emoji: '🎉' },
                      { id: 'sad', label: 'Sad', emoji: '😢' },
                      { id: 'surprised', label: 'Surprised', emoji: '😲' },
                    ] as const).map((anim) => (
                      <button
                        key={anim.id}
                        onClick={() => setAnimationState(anim.id as AnimationType)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                          animationState === anim.id
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        title={anim.label}
                      >
                        <span>{anim.emoji}</span>
                        <span className="hidden sm:inline">{anim.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Name Input */}
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                placeholder="Character Name"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white text-center placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              />
              
              {/* Selected Character Info */}
              <div className="mt-4 text-center">
                {useAICharacter && aiGeneratedImage ? (
                  <div className="text-sm text-purple-400">✨ AI Generated Character</div>
                ) : (
                  <>
                    <div className="text-sm text-gray-400">Base: {selectedRig?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {PERSONALITY_OPTIONS.find(p => p.id === character.personality)?.emoji}{' '}
                      {PERSONALITY_OPTIONS.find(p => p.id === character.personality)?.name}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Customization Panel */}
            <div className="flex-1 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                {[
                  { id: 'base', label: 'Base', icon: User },
                  { id: 'ai', label: 'AI Generate', icon: Sparkles },
                  { id: 'colors', label: 'Colors', icon: Palette },
                  { id: 'accessories', label: 'Accessories', icon: Crown },
                  { id: 'personality', label: 'Personality', icon: Star },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'base' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-3">Character Base</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {CHARACTER_RIGS.map((rig) => (
                          <button
                            key={rig.id}
                            onClick={() => setCharacter({ ...character, rigId: rig.id })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              character.rigId === rig.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <div 
                              className="w-12 h-12 rounded-full mx-auto mb-2"
                              style={{ backgroundColor: rig.colors.primary }}
                            />
                            <div className="text-white text-sm text-center">{rig.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-white font-medium mb-3">Outfit Style</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {OUTFIT_OPTIONS.map((outfit) => (
                          <button
                            key={outfit.id}
                            onClick={() => setCharacter({ ...character, outfit: outfit.id })}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              character.outfit === outfit.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            }`}
                          >
                            <div className="text-2xl text-center mb-1">{outfit.icon}</div>
                            <div className="text-xs text-gray-300 text-center">{outfit.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generate Tab */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-white font-medium mb-3">Generate AI Character</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Describe your character and let AI create a unique 2D cartoon character for you.
                      </p>
                      
                      {/* Prompt Input */}
                      <div className="space-y-3">
                        <textarea
                          value={aiCharacterPrompt}
                          onChange={(e) => setAiCharacterPrompt(e.target.value)}
                          placeholder="Describe your character... e.g., 'a friendly robot with blue eyes and antenna, wearing a red cape'"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-24"
                        />
                        
                        <button
                          onClick={handleGenerateAICharacter}
                          disabled={isGeneratingAI || !aiCharacterPrompt.trim()}
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                          {isGeneratingAI ? (
                            <>
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Character
                            </>
                          )}
                        </button>
                      </div>
                      
                      {aiError && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-sm text-red-300">{aiError}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Prompts */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Quick Ideas</h3>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'a cute bunny with pink fur and a flower crown',
                          'a brave knight with silver armor and shield',
                          'a magical fairy with butterfly wings',
                          'a friendly dinosaur with purple spots',
                          'a superhero kid with a red cape',
                          'a wise owl wearing glasses',
                          'a playful kitten with orange stripes',
                          'a cheerful robot with glowing eyes',
                        ].map((prompt) => (
                          <button
                            key={prompt}
                            onClick={() => setAiCharacterPrompt(prompt)}
                            className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                          >
                            {prompt.slice(0, 30)}...
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Generated Characters Gallery */}
                    {aiGeneratedChars.length > 0 && (
                      <div>
                        <h3 className="text-white font-medium mb-3">Generated Characters</h3>
                        <div className="grid grid-cols-4 gap-3">
                          {aiGeneratedChars.map((char, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setAiGeneratedImage(char.url);
                                setUseAICharacter(true);
                              }}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                                aiGeneratedImage === char.url
                                  ? 'border-purple-500 ring-2 ring-purple-500/50'
                                  : 'border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <img src={char.url} alt={char.prompt} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <span className="text-white text-xs line-clamp-2">{char.prompt}</span>
                              </div>
                              {aiGeneratedImage === char.url && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Current AI Character Preview */}
                    {aiGeneratedImage && (
                      <div>
                        <h3 className="text-white font-medium mb-3">Selected AI Character</h3>
                        <div className="flex items-start gap-4">
                          <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-purple-500">
                            <img src={aiGeneratedImage} alt="AI Character" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <label className="flex items-center gap-2 mb-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={useAICharacter}
                                onChange={(e) => setUseAICharacter(e.target.checked)}
                                className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                              />
                              <span className="text-white">Use this AI character</span>
                            </label>
                            <p className="text-sm text-gray-400">
                              When enabled, this AI-generated image will be used as your character's appearance instead of the customizable 2D character.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    {Object.entries(COLOR_PRESETS).map(([colorType, colors]) => (
                      <div key={colorType}>
                        <h3 className="text-white font-medium mb-3 capitalize flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-600"
                            style={{ backgroundColor: character.colors[colorType as keyof typeof character.colors] }}
                          />
                          {colorType} Color
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setCharacter({
                                ...character,
                                colors: { ...character.colors, [colorType]: color }
                              })}
                              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                character.colors[colorType as keyof typeof character.colors] === color
                                  ? 'border-white scale-110'
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            >
                              {character.colors[colorType as keyof typeof character.colors] === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                          {/* Custom color picker */}
                          <input
                            type="color"
                            value={character.colors[colorType as keyof typeof character.colors]}
                            onChange={(e) => setCharacter({
                              ...character,
                              colors: { ...character.colors, [colorType]: e.target.value }
                            })}
                            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-dashed border-gray-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'accessories' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium mb-3">Toggle Accessories</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'hat', label: 'Hat/Crown', icon: Crown, emoji: '👑' },
                        { id: 'glasses', label: 'Glasses', icon: Glasses, emoji: '👓' },
                        { id: 'cape', label: 'Cape', icon: Shirt, emoji: '🦸' },
                        { id: 'wings', label: 'Wings', icon: Sparkles, emoji: '🧚' },
                      ].map((accessory) => (
                        <button
                          key={accessory.id}
                          onClick={() => setCharacter({
                            ...character,
                            accessories: {
                              ...character.accessories,
                              [accessory.id]: !character.accessories[accessory.id as keyof typeof character.accessories]
                            }
                          })}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            character.accessories[accessory.id as keyof typeof character.accessories]
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-3xl">{accessory.emoji}</div>
                          <div>
                            <div className="text-white font-medium">{accessory.label}</div>
                            <div className="text-xs text-gray-400">
                              {character.accessories[accessory.id as keyof typeof character.accessories] ? 'Equipped' : 'Not equipped'}
                            </div>
                          </div>
                          {character.accessories[accessory.id as keyof typeof character.accessories] && (
                            <Check className="w-5 h-5 text-purple-400 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'personality' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium mb-3">Character Personality</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      This affects suggested animations and expressions for your character.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {PERSONALITY_OPTIONS.map((personality) => (
                        <button
                          key={personality.id}
                          onClick={() => setCharacter({ ...character, personality: personality.id })}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            character.personality === personality.id
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-3xl">{personality.emoji}</div>
                          <div className="text-white font-medium">{personality.name}</div>
                          {character.personality === personality.id && (
                            <Check className="w-5 h-5 text-purple-400 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-800">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const finalCharacter = {
                  ...character,
                  name: character.name.trim() || selectedRig?.name || 'Character',
                  aiGeneratedImage: useAICharacter ? aiGeneratedImage || undefined : undefined,
                  useAICharacter: useAICharacter && !!aiGeneratedImage,
                };
                onSave(finalCharacter);
                onClose();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Create Character' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
