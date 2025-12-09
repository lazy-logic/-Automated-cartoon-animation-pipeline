// Keyframe Animation System - Handles animation clips, keyframes, and interpolation

import { Transform, Vector2, CharacterRig } from './sprite-system';

// Easing functions for smooth animations
export type EasingType = 
  | 'linear' 
  | 'easeIn' 
  | 'easeOut' 
  | 'easeInOut' 
  | 'bounce' 
  | 'elastic'
  | 'spring';

export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  bounce: (t) => {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  },
  elastic: (t) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
  spring: (t) => {
    return 1 - Math.cos(t * Math.PI * 4.5) * Math.exp(-t * 6);
  },
};

// Keyframe for a single property
export interface Keyframe {
  time: number; // Time in milliseconds
  value: number | Vector2 | string;
  easing: EasingType;
}

// Track for animating a specific property of a part
export interface AnimationTrack {
  partId: string;
  property: 'position' | 'rotation' | 'scale' | 'opacity' | 'mouthShape';
  keyframes: Keyframe[];
}

// Complete animation clip
export interface AnimationClip {
  id: string;
  name: string;
  duration: number; // Total duration in ms
  loop: boolean;
  tracks: AnimationTrack[];
}

// Mouth shapes for lip-sync
export type MouthShape = 'closed' | 'open' | 'wide' | 'oh' | 'ee' | 'smile';

// Pre-defined animation clips for common actions
export const ANIMATION_PRESETS: Record<string, AnimationClip> = {
  idle: {
    id: 'idle',
    name: 'Idle',
    duration: 2000,
    loop: true,
    tracks: [
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 1000, value: { x: 0, y: -3 }, easing: 'easeInOut' },
          { time: 2000, value: { x: 0, y: 0 }, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 1500, value: 3, easing: 'easeInOut' },
          { time: 2000, value: 0, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftEye',
        property: 'scale',
        keyframes: [
          { time: 0, value: { x: 1, y: 1 }, easing: 'easeInOut' },
          { time: 900, value: { x: 1, y: 1 }, easing: 'easeInOut' },
          { time: 1000, value: { x: 1, y: 0.1 }, easing: 'easeInOut' },
          { time: 1100, value: { x: 1, y: 1 }, easing: 'easeInOut' },
          { time: 2000, value: { x: 1, y: 1 }, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightEye',
        property: 'scale',
        keyframes: [
          { time: 0, value: { x: 1, y: 1 }, easing: 'easeInOut' },
          { time: 900, value: { x: 1, y: 1 }, easing: 'easeInOut' },
          { time: 1000, value: { x: 1, y: 0.1 }, easing: 'easeInOut' },
          { time: 1100, value: { x: 1, y: 1 }, easing: 'easeInOut' },
          { time: 2000, value: { x: 1, y: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  walk: {
    id: 'walk',
    name: 'Walk',
    duration: 800,
    loop: true,
    tracks: [
      // Body bounce and sway for realistic walking
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 200, value: { x: 2, y: -6 }, easing: 'easeInOut' },
          { time: 400, value: { x: 0, y: -2 }, easing: 'easeInOut' },
          { time: 600, value: { x: -2, y: -6 }, easing: 'easeInOut' },
          { time: 800, value: { x: 0, y: 0 }, easing: 'easeInOut' },
        ],
      },
      // Body rotation (torso twist) for natural walking
      {
        partId: 'body',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 200, value: 3, easing: 'easeInOut' },
          { time: 400, value: 0, easing: 'easeInOut' },
          { time: 600, value: -3, easing: 'easeInOut' },
          { time: 800, value: 0, easing: 'easeInOut' },
        ],
      },
      // Head slight counter-rotation for balance
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 200, value: -2, easing: 'easeInOut' },
          { time: 400, value: 0, easing: 'easeInOut' },
          { time: 600, value: 2, easing: 'easeInOut' },
          { time: 800, value: 0, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -30, easing: 'easeInOut' },
          { time: 400, value: 30, easing: 'easeInOut' },
          { time: 800, value: -30, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 30, easing: 'easeInOut' },
          { time: 400, value: -30, easing: 'easeInOut' },
          { time: 800, value: 30, easing: 'easeInOut' },
        ],
      },
      // Arms swing opposite to legs with shoulder rotation feel
      {
        partId: 'leftArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 35, easing: 'easeInOut' },
          { time: 400, value: -20, easing: 'easeInOut' },
          { time: 800, value: 35, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -20, easing: 'easeInOut' },
          { time: 400, value: 35, easing: 'easeInOut' },
          { time: 800, value: -20, easing: 'easeInOut' },
        ],
      },
    ],
  },

  run: {
    id: 'run',
    name: 'Run',
    duration: 500,
    loop: true,
    tracks: [
      // Faster, more exaggerated body movement
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: -5 }, easing: 'easeInOut' },
          { time: 125, value: { x: 3, y: -12 }, easing: 'easeInOut' },
          { time: 250, value: { x: 0, y: -5 }, easing: 'easeInOut' },
          { time: 375, value: { x: -3, y: -12 }, easing: 'easeInOut' },
          { time: 500, value: { x: 0, y: -5 }, easing: 'easeInOut' },
        ],
      },
      // More pronounced body lean forward
      {
        partId: 'body',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -8, easing: 'easeInOut' },
          { time: 125, value: -5, easing: 'easeInOut' },
          { time: 250, value: -8, easing: 'easeInOut' },
          { time: 375, value: -5, easing: 'easeInOut' },
          { time: 500, value: -8, easing: 'easeInOut' },
        ],
      },
      // Head stays relatively stable
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 5, easing: 'easeInOut' },
          { time: 250, value: 8, easing: 'easeInOut' },
          { time: 500, value: 5, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -45, easing: 'easeInOut' },
          { time: 250, value: 45, easing: 'easeInOut' },
          { time: 500, value: -45, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 45, easing: 'easeInOut' },
          { time: 250, value: -45, easing: 'easeInOut' },
          { time: 500, value: 45, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 50, easing: 'easeInOut' },
          { time: 250, value: -40, easing: 'easeInOut' },
          { time: 500, value: 50, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -40, easing: 'easeInOut' },
          { time: 250, value: 50, easing: 'easeInOut' },
          { time: 500, value: -40, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  wave: {
    id: 'wave',
    name: 'Wave',
    duration: 1200,
    loop: true,
    tracks: [
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -120, easing: 'easeOut' },
          { time: 200, value: -140, easing: 'easeInOut' },
          { time: 400, value: -120, easing: 'easeInOut' },
          { time: 600, value: -140, easing: 'easeInOut' },
          { time: 800, value: -120, easing: 'easeInOut' },
          { time: 1000, value: -140, easing: 'easeInOut' },
          { time: 1200, value: -120, easing: 'easeIn' },
        ],
      },
      {
        partId: 'rightHand',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 200, value: 20, easing: 'easeInOut' },
          { time: 400, value: -20, easing: 'easeInOut' },
          { time: 600, value: 20, easing: 'easeInOut' },
          { time: 800, value: -20, easing: 'easeInOut' },
          { time: 1000, value: 20, easing: 'easeInOut' },
          { time: 1200, value: 0, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  jump: {
    id: 'jump',
    name: 'Jump',
    duration: 1000,
    loop: false,
    tracks: [
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeIn' },
          { time: 200, value: { x: 0, y: 10 }, easing: 'easeOut' },
          { time: 400, value: { x: 0, y: -50 }, easing: 'easeOut' },
          { time: 700, value: { x: 0, y: -50 }, easing: 'easeIn' },
          { time: 900, value: { x: 0, y: 5 }, easing: 'bounce' },
          { time: 1000, value: { x: 0, y: 0 }, easing: 'easeOut' },
        ],
      },
      {
        partId: 'leftArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 15, easing: 'easeIn' },
          { time: 300, value: -150, easing: 'easeOut' },
          { time: 700, value: -150, easing: 'easeIn' },
          { time: 1000, value: 15, easing: 'easeOut' },
        ],
      },
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -15, easing: 'easeIn' },
          { time: 300, value: 150, easing: 'easeOut' },
          { time: 700, value: 150, easing: 'easeIn' },
          { time: 1000, value: -15, easing: 'easeOut' },
        ],
      },
      {
        partId: 'leftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 200, value: 30, easing: 'easeOut' },
          { time: 400, value: -20, easing: 'easeOut' },
          { time: 900, value: 10, easing: 'bounce' },
          { time: 1000, value: 0, easing: 'easeOut' },
        ],
      },
      {
        partId: 'rightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 200, value: 30, easing: 'easeOut' },
          { time: 400, value: -20, easing: 'easeOut' },
          { time: 900, value: 10, easing: 'bounce' },
          { time: 1000, value: 0, easing: 'easeOut' },
        ],
      },
    ],
  },
  
  talk: {
    id: 'talk',
    name: 'Talk',
    duration: 600,
    loop: true,
    tracks: [
      {
        partId: 'mouth',
        property: 'mouthShape',
        keyframes: [
          { time: 0, value: 'closed', easing: 'linear' },
          { time: 100, value: 'open', easing: 'linear' },
          { time: 200, value: 'wide', easing: 'linear' },
          { time: 300, value: 'oh', easing: 'linear' },
          { time: 400, value: 'ee', easing: 'linear' },
          { time: 500, value: 'open', easing: 'linear' },
          { time: 600, value: 'closed', easing: 'linear' },
        ],
      },
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 150, value: -3, easing: 'easeInOut' },
          { time: 300, value: 2, easing: 'easeInOut' },
          { time: 450, value: -2, easing: 'easeInOut' },
          { time: 600, value: 0, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 300, value: { x: 0, y: -2 }, easing: 'easeInOut' },
          { time: 600, value: { x: 0, y: 0 }, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  sit: {
    id: 'sit',
    name: 'Sit',
    duration: 500,
    loop: false,
    tracks: [
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 500, value: { x: 0, y: 30 }, easing: 'easeOut' },
        ],
      },
      {
        partId: 'leftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 500, value: -90, easing: 'easeOut' },
        ],
      },
      {
        partId: 'rightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 500, value: -90, easing: 'easeOut' },
        ],
      },
    ],
  },
  
  dance: {
    id: 'dance',
    name: 'Dance',
    duration: 1600,
    loop: true,
    tracks: [
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 200, value: { x: -10, y: -10 }, easing: 'easeInOut' },
          { time: 400, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 600, value: { x: 10, y: -10 }, easing: 'easeInOut' },
          { time: 800, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 1000, value: { x: -10, y: -10 }, easing: 'easeInOut' },
          { time: 1200, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 1400, value: { x: 10, y: -10 }, easing: 'easeInOut' },
          { time: 1600, value: { x: 0, y: 0 }, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'body',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 400, value: -8, easing: 'easeInOut' },
          { time: 800, value: 0, easing: 'easeInOut' },
          { time: 1200, value: 8, easing: 'easeInOut' },
          { time: 1600, value: 0, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 15, easing: 'easeInOut' },
          { time: 400, value: -100, easing: 'easeInOut' },
          { time: 800, value: 15, easing: 'easeInOut' },
          { time: 1200, value: -100, easing: 'easeInOut' },
          { time: 1600, value: 15, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -15, easing: 'easeInOut' },
          { time: 400, value: 100, easing: 'easeInOut' },
          { time: 800, value: -15, easing: 'easeInOut' },
          { time: 1200, value: 100, easing: 'easeInOut' },
          { time: 1600, value: -15, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 200, value: -15, easing: 'easeInOut' },
          { time: 400, value: 0, easing: 'easeInOut' },
          { time: 600, value: 15, easing: 'easeInOut' },
          { time: 800, value: 0, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 200, value: 15, easing: 'easeInOut' },
          { time: 400, value: 0, easing: 'easeInOut' },
          { time: 600, value: -15, easing: 'easeInOut' },
          { time: 800, value: 0, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  surprised: {
    id: 'surprised',
    name: 'Surprised',
    duration: 800,
    loop: false,
    tracks: [
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeOut' },
          { time: 150, value: { x: 0, y: -15 }, easing: 'spring' },
          { time: 800, value: { x: 0, y: 0 }, easing: 'easeOut' },
        ],
      },
      {
        partId: 'leftArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 15, easing: 'easeOut' },
          { time: 150, value: -60, easing: 'spring' },
          { time: 800, value: 15, easing: 'easeOut' },
        ],
      },
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -15, easing: 'easeOut' },
          { time: 150, value: 60, easing: 'spring' },
          { time: 800, value: -15, easing: 'easeOut' },
        ],
      },
      {
        partId: 'leftEye',
        property: 'scale',
        keyframes: [
          { time: 0, value: { x: 1, y: 1 }, easing: 'easeOut' },
          { time: 150, value: { x: 1.3, y: 1.3 }, easing: 'spring' },
          { time: 800, value: { x: 1, y: 1 }, easing: 'easeOut' },
        ],
      },
      {
        partId: 'rightEye',
        property: 'scale',
        keyframes: [
          { time: 0, value: { x: 1, y: 1 }, easing: 'easeOut' },
          { time: 150, value: { x: 1.3, y: 1.3 }, easing: 'spring' },
          { time: 800, value: { x: 1, y: 1 }, easing: 'easeOut' },
        ],
      },
      {
        partId: 'mouth',
        property: 'mouthShape',
        keyframes: [
          { time: 0, value: 'closed', easing: 'linear' },
          { time: 150, value: 'oh', easing: 'linear' },
          { time: 600, value: 'oh', easing: 'linear' },
          { time: 800, value: 'closed', easing: 'linear' },
        ],
      },
    ],
  },
  
  sad: {
    id: 'sad',
    name: 'Sad',
    duration: 2000,
    loop: true,
    tracks: [
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 15, easing: 'easeInOut' },
          { time: 2000, value: 15, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 5 }, easing: 'easeInOut' },
          { time: 1000, value: { x: 0, y: 8 }, easing: 'easeInOut' },
          { time: 2000, value: { x: 0, y: 5 }, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'leftArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 30, easing: 'easeInOut' },
          { time: 2000, value: 30, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'rightArm',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -30, easing: 'easeInOut' },
          { time: 2000, value: -30, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  // Animal-specific animations
  animalIdle: {
    id: 'animalIdle',
    name: 'Animal Idle',
    duration: 2000,
    loop: true,
    tracks: [
      {
        partId: 'tail',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -20, easing: 'easeInOut' },
          { time: 500, value: -10, easing: 'easeInOut' },
          { time: 1000, value: -30, easing: 'easeInOut' },
          { time: 1500, value: -10, easing: 'easeInOut' },
          { time: 2000, value: -20, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 1000, value: 5, easing: 'easeInOut' },
          { time: 2000, value: 0, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  animalWalk: {
    id: 'animalWalk',
    name: 'Animal Walk',
    duration: 600,
    loop: true,
    tracks: [
      // Body bounce and sway
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeInOut' },
          { time: 150, value: { x: 1, y: -4 }, easing: 'easeInOut' },
          { time: 300, value: { x: 0, y: -1 }, easing: 'easeInOut' },
          { time: 450, value: { x: -1, y: -4 }, easing: 'easeInOut' },
          { time: 600, value: { x: 0, y: 0 }, easing: 'easeInOut' },
        ],
      },
      // Body rotation for natural walking gait
      {
        partId: 'body',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 150, value: 2, easing: 'easeInOut' },
          { time: 300, value: 0, easing: 'easeInOut' },
          { time: 450, value: -2, easing: 'easeInOut' },
          { time: 600, value: 0, easing: 'easeInOut' },
        ],
      },
      // Head bobbing
      {
        partId: 'head',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeInOut' },
          { time: 150, value: -3, easing: 'easeInOut' },
          { time: 300, value: 0, easing: 'easeInOut' },
          { time: 450, value: 3, easing: 'easeInOut' },
          { time: 600, value: 0, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'frontLeftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -25, easing: 'easeInOut' },
          { time: 300, value: 25, easing: 'easeInOut' },
          { time: 600, value: -25, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'frontRightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 25, easing: 'easeInOut' },
          { time: 300, value: -25, easing: 'easeInOut' },
          { time: 600, value: 25, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'backLeftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 20, easing: 'easeInOut' },
          { time: 300, value: -20, easing: 'easeInOut' },
          { time: 600, value: 20, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'backRightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -20, easing: 'easeInOut' },
          { time: 300, value: 20, easing: 'easeInOut' },
          { time: 600, value: -20, easing: 'easeInOut' },
        ],
      },
      {
        partId: 'tail',
        property: 'rotation',
        keyframes: [
          { time: 0, value: -30, easing: 'easeInOut' },
          { time: 300, value: -10, easing: 'easeInOut' },
          { time: 600, value: -30, easing: 'easeInOut' },
        ],
      },
    ],
  },
  
  animalJump: {
    id: 'animalJump',
    name: 'Animal Jump',
    duration: 800,
    loop: false,
    tracks: [
      {
        partId: 'body',
        property: 'position',
        keyframes: [
          { time: 0, value: { x: 0, y: 0 }, easing: 'easeIn' },
          { time: 150, value: { x: 0, y: 5 }, easing: 'easeOut' },
          { time: 350, value: { x: 0, y: -40 }, easing: 'easeOut' },
          { time: 550, value: { x: 0, y: -40 }, easing: 'easeIn' },
          { time: 750, value: { x: 0, y: 3 }, easing: 'bounce' },
          { time: 800, value: { x: 0, y: 0 }, easing: 'easeOut' },
        ],
      },
      {
        partId: 'body',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 350, value: -10, easing: 'easeOut' },
          { time: 550, value: -10, easing: 'easeIn' },
          { time: 800, value: 0, easing: 'easeOut' },
        ],
      },
      {
        partId: 'frontLeftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 350, value: -30, easing: 'easeOut' },
          { time: 800, value: 0, easing: 'easeOut' },
        ],
      },
      {
        partId: 'frontRightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 350, value: -30, easing: 'easeOut' },
          { time: 800, value: 0, easing: 'easeOut' },
        ],
      },
      {
        partId: 'backLeftLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 350, value: 30, easing: 'easeOut' },
          { time: 800, value: 0, easing: 'easeOut' },
        ],
      },
      {
        partId: 'backRightLeg',
        property: 'rotation',
        keyframes: [
          { time: 0, value: 0, easing: 'easeIn' },
          { time: 350, value: 30, easing: 'easeOut' },
          { time: 800, value: 0, easing: 'easeOut' },
        ],
      },
    ],
  },
};

// Interpolate between two values
export function interpolate(
  from: number | Vector2,
  to: number | Vector2,
  t: number,
  easing: EasingType
): number | Vector2 {
  const easedT = easingFunctions[easing](t);
  
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * easedT;
  }
  
  if (typeof from === 'object' && typeof to === 'object') {
    return {
      x: (from as Vector2).x + ((to as Vector2).x - (from as Vector2).x) * easedT,
      y: (from as Vector2).y + ((to as Vector2).y - (from as Vector2).y) * easedT,
    };
  }
  
  return from;
}

// Get the value of a track at a specific time
export function getTrackValueAtTime(
  track: AnimationTrack,
  time: number,
  duration: number,
  loop: boolean
): number | Vector2 | string {
  const { keyframes } = track;
  
  if (keyframes.length === 0) {
    return track.property === 'position' ? { x: 0, y: 0 } : 0;
  }
  
  // Handle looping
  let adjustedTime = time;
  if (loop && duration > 0) {
    adjustedTime = time % duration;
  }
  
  // Find surrounding keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[keyframes.length - 1];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (adjustedTime >= keyframes[i].time && adjustedTime < keyframes[i + 1].time) {
      prevKeyframe = keyframes[i];
      nextKeyframe = keyframes[i + 1];
      break;
    }
  }
  
  // If time is before first keyframe or after last
  if (adjustedTime <= keyframes[0].time) {
    return keyframes[0].value;
  }
  if (adjustedTime >= keyframes[keyframes.length - 1].time) {
    return keyframes[keyframes.length - 1].value;
  }
  
  // Interpolate between keyframes
  const timeDiff = nextKeyframe.time - prevKeyframe.time;
  const t = timeDiff > 0 ? (adjustedTime - prevKeyframe.time) / timeDiff : 0;
  
  // String values (like mouth shapes) don't interpolate
  if (typeof prevKeyframe.value === 'string') {
    return t < 0.5 ? prevKeyframe.value : nextKeyframe.value;
  }
  
  return interpolate(
    prevKeyframe.value as number | Vector2,
    nextKeyframe.value as number | Vector2,
    t,
    nextKeyframe.easing
  );
}

// Animation state for a character
export interface CharacterAnimationState {
  rigId: string;
  currentClip: AnimationClip;
  time: number;
  speed: number;
  partTransforms: Record<string, Partial<Transform> & { mouthShape?: MouthShape }>;
}

// Create initial animation state
export function createAnimationState(
  rigId: string,
  clipId: string = 'idle'
): CharacterAnimationState {
  const clip = ANIMATION_PRESETS[clipId] || ANIMATION_PRESETS.idle;
  
  return {
    rigId,
    currentClip: clip,
    time: 0,
    speed: 1,
    partTransforms: {},
  };
}

// Update animation state
export function updateAnimationState(
  state: CharacterAnimationState,
  deltaTime: number
): CharacterAnimationState {
  const newTime = state.time + deltaTime * state.speed;
  const { currentClip } = state;
  
  // Calculate new transforms for each track
  const partTransforms: Record<string, Partial<Transform> & { mouthShape?: MouthShape }> = {};
  
  for (const track of currentClip.tracks) {
    const value = getTrackValueAtTime(track, newTime, currentClip.duration, currentClip.loop);
    
    if (!partTransforms[track.partId]) {
      partTransforms[track.partId] = {};
    }
    
    switch (track.property) {
      case 'position':
        partTransforms[track.partId].position = value as Vector2;
        break;
      case 'rotation':
        partTransforms[track.partId].rotation = value as number;
        break;
      case 'scale':
        partTransforms[track.partId].scale = value as Vector2;
        break;
      case 'mouthShape':
        partTransforms[track.partId].mouthShape = value as MouthShape;
        break;
    }
  }
  
  return {
    ...state,
    time: currentClip.loop ? newTime % currentClip.duration : Math.min(newTime, currentClip.duration),
    partTransforms,
  };
}

// Get animation clip for action
export function getAnimationForAction(action: string, isAnimal: boolean): AnimationClip {
  const actionMap: Record<string, string> = {
    idle: isAnimal ? 'animalIdle' : 'idle',
    walk: isAnimal ? 'animalWalk' : 'walk',
    run: isAnimal ? 'animalWalk' : 'run',  // Use the new run animation for humans
    jump: isAnimal ? 'animalJump' : 'jump',
    wave: 'wave',
    talk: 'talk',
    sit: 'sit',
    dance: 'dance',
    surprised: 'surprised',
    sad: 'sad',
  };
  
  const clipId = actionMap[action] || (isAnimal ? 'animalIdle' : 'idle');
  return ANIMATION_PRESETS[clipId] || ANIMATION_PRESETS.idle;
}
