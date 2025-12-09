// Scene Transition Effects System

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in'
  | 'zoom-out'
  | 'wipe-left'
  | 'wipe-right'
  | 'dissolve'
  | 'blur'
  | 'flip'
  | 'rotate';

export interface TransitionConfig {
  type: TransitionType;
  duration: number; // ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
}

export interface TransitionPreset {
  id: TransitionType;
  name: string;
  description: string;
  icon: string;
  defaultDuration: number;
  category: 'basic' | 'slide' | 'zoom' | 'creative';
}

export const TRANSITION_PRESETS: TransitionPreset[] = [
  {
    id: 'none',
    name: 'None',
    description: 'Instant cut between scenes',
    icon: '⚡',
    defaultDuration: 0,
    category: 'basic',
  },
  {
    id: 'fade',
    name: 'Fade',
    description: 'Smooth fade to black and back',
    icon: '🌑',
    defaultDuration: 500,
    category: 'basic',
  },
  {
    id: 'dissolve',
    name: 'Dissolve',
    description: 'Cross-dissolve between scenes',
    icon: '✨',
    defaultDuration: 600,
    category: 'basic',
  },
  {
    id: 'slide-left',
    name: 'Slide Left',
    description: 'New scene slides in from right',
    icon: '⬅️',
    defaultDuration: 400,
    category: 'slide',
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    description: 'New scene slides in from left',
    icon: '➡️',
    defaultDuration: 400,
    category: 'slide',
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    description: 'New scene slides in from bottom',
    icon: '⬆️',
    defaultDuration: 400,
    category: 'slide',
  },
  {
    id: 'slide-down',
    name: 'Slide Down',
    description: 'New scene slides in from top',
    icon: '⬇️',
    defaultDuration: 400,
    category: 'slide',
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Zoom into the new scene',
    icon: '🔍',
    defaultDuration: 500,
    category: 'zoom',
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Zoom out to reveal new scene',
    icon: '🔎',
    defaultDuration: 500,
    category: 'zoom',
  },
  {
    id: 'wipe-left',
    name: 'Wipe Left',
    description: 'Wipe effect from right to left',
    icon: '🎬',
    defaultDuration: 400,
    category: 'creative',
  },
  {
    id: 'wipe-right',
    name: 'Wipe Right',
    description: 'Wipe effect from left to right',
    icon: '🎬',
    defaultDuration: 400,
    category: 'creative',
  },
  {
    id: 'blur',
    name: 'Blur',
    description: 'Blur out and back in',
    icon: '💫',
    defaultDuration: 600,
    category: 'creative',
  },
  {
    id: 'flip',
    name: 'Flip',
    description: '3D flip to new scene',
    icon: '🔄',
    defaultDuration: 600,
    category: 'creative',
  },
  {
    id: 'rotate',
    name: 'Rotate',
    description: 'Rotate to new scene',
    icon: '🌀',
    defaultDuration: 700,
    category: 'creative',
  },
];

// Get CSS animation properties for a transition
export function getTransitionStyles(
  type: TransitionType,
  phase: 'enter' | 'exit',
  progress: number // 0 to 1
): React.CSSProperties {
  const easeProgress = easeInOutCubic(progress);

  switch (type) {
    case 'none':
      return {};

    case 'fade':
      return {
        opacity: phase === 'exit' ? 1 - easeProgress : easeProgress,
      };

    case 'dissolve':
      return {
        opacity: phase === 'exit' ? 1 - easeProgress : easeProgress,
        filter: `blur(${phase === 'exit' ? easeProgress * 2 : (1 - easeProgress) * 2}px)`,
      };

    case 'slide-left':
      return {
        transform: `translateX(${phase === 'exit' ? -easeProgress * 100 : (1 - easeProgress) * 100}%)`,
      };

    case 'slide-right':
      return {
        transform: `translateX(${phase === 'exit' ? easeProgress * 100 : (easeProgress - 1) * 100}%)`,
      };

    case 'slide-up':
      return {
        transform: `translateY(${phase === 'exit' ? -easeProgress * 100 : (1 - easeProgress) * 100}%)`,
      };

    case 'slide-down':
      return {
        transform: `translateY(${phase === 'exit' ? easeProgress * 100 : (easeProgress - 1) * 100}%)`,
      };

    case 'zoom-in':
      return {
        transform: `scale(${phase === 'exit' ? 1 + easeProgress * 0.5 : 0.5 + easeProgress * 0.5})`,
        opacity: phase === 'exit' ? 1 - easeProgress : easeProgress,
      };

    case 'zoom-out':
      return {
        transform: `scale(${phase === 'exit' ? 1 - easeProgress * 0.5 : 1.5 - easeProgress * 0.5})`,
        opacity: phase === 'exit' ? 1 - easeProgress : easeProgress,
      };

    case 'wipe-left':
      return {
        clipPath: phase === 'exit'
          ? `inset(0 ${easeProgress * 100}% 0 0)`
          : `inset(0 0 0 ${(1 - easeProgress) * 100}%)`,
      };

    case 'wipe-right':
      return {
        clipPath: phase === 'exit'
          ? `inset(0 0 0 ${easeProgress * 100}%)`
          : `inset(0 ${(1 - easeProgress) * 100}% 0 0)`,
      };

    case 'blur':
      return {
        filter: `blur(${phase === 'exit' ? easeProgress * 20 : (1 - easeProgress) * 20}px)`,
        opacity: phase === 'exit' ? 1 - easeProgress * 0.5 : 0.5 + easeProgress * 0.5,
      };

    case 'flip':
      return {
        transform: `perspective(1000px) rotateY(${phase === 'exit' ? easeProgress * 90 : (1 - easeProgress) * -90}deg)`,
        opacity: progress > 0.5 ? 0 : 1,
      };

    case 'rotate':
      return {
        transform: `rotate(${phase === 'exit' ? easeProgress * 180 : (1 - easeProgress) * -180}deg) scale(${phase === 'exit' ? 1 - easeProgress * 0.5 : 0.5 + easeProgress * 0.5})`,
        opacity: phase === 'exit' ? 1 - easeProgress : easeProgress,
      };

    default:
      return {};
  }
}

// Framer Motion variants for transitions
export function getMotionVariants(type: TransitionType, duration: number = 500) {
  const durationSec = duration / 1000;

  switch (type) {
    case 'none':
      return {
        initial: {},
        animate: {},
        exit: {},
      };

    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: durationSec } },
        exit: { opacity: 0, transition: { duration: durationSec } },
      };

    case 'dissolve':
      return {
        initial: { opacity: 0, filter: 'blur(4px)' },
        animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: durationSec } },
        exit: { opacity: 0, filter: 'blur(4px)', transition: { duration: durationSec } },
      };

    case 'slide-left':
      return {
        initial: { x: '100%' },
        animate: { x: 0, transition: { duration: durationSec, ease: 'easeOut' } },
        exit: { x: '-100%', transition: { duration: durationSec, ease: 'easeIn' } },
      };

    case 'slide-right':
      return {
        initial: { x: '-100%' },
        animate: { x: 0, transition: { duration: durationSec, ease: 'easeOut' } },
        exit: { x: '100%', transition: { duration: durationSec, ease: 'easeIn' } },
      };

    case 'slide-up':
      return {
        initial: { y: '100%' },
        animate: { y: 0, transition: { duration: durationSec, ease: 'easeOut' } },
        exit: { y: '-100%', transition: { duration: durationSec, ease: 'easeIn' } },
      };

    case 'slide-down':
      return {
        initial: { y: '-100%' },
        animate: { y: 0, transition: { duration: durationSec, ease: 'easeOut' } },
        exit: { y: '100%', transition: { duration: durationSec, ease: 'easeIn' } },
      };

    case 'zoom-in':
      return {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: durationSec } },
        exit: { scale: 1.5, opacity: 0, transition: { duration: durationSec } },
      };

    case 'zoom-out':
      return {
        initial: { scale: 1.5, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { duration: durationSec } },
        exit: { scale: 0.5, opacity: 0, transition: { duration: durationSec } },
      };

    case 'blur':
      return {
        initial: { filter: 'blur(20px)', opacity: 0.5 },
        animate: { filter: 'blur(0px)', opacity: 1, transition: { duration: durationSec } },
        exit: { filter: 'blur(20px)', opacity: 0.5, transition: { duration: durationSec } },
      };

    case 'flip':
      return {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1, transition: { duration: durationSec } },
        exit: { rotateY: 90, opacity: 0, transition: { duration: durationSec } },
      };

    case 'rotate':
      return {
        initial: { rotate: -180, scale: 0.5, opacity: 0 },
        animate: { rotate: 0, scale: 1, opacity: 1, transition: { duration: durationSec } },
        exit: { rotate: 180, scale: 0.5, opacity: 0, transition: { duration: durationSec } },
      };

    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
}

// Easing function
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Get transition preset by ID
export function getTransitionPreset(id: TransitionType): TransitionPreset | undefined {
  return TRANSITION_PRESETS.find((p) => p.id === id);
}

// Get transitions by category
export function getTransitionsByCategory(category: TransitionPreset['category']): TransitionPreset[] {
  return TRANSITION_PRESETS.filter((p) => p.category === category);
}

// Create default transition config
export function createDefaultTransition(): TransitionConfig {
  return {
    type: 'fade',
    duration: 500,
    easing: 'ease-in-out',
  };
}
