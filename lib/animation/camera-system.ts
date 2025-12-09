/**
 * Camera System for Cartoon Studio
 * Provides cinematic camera effects: zoom, pan, shake, focus
 */

import type { CSSProperties } from 'react';

export type CameraAngle = 
  | 'wide'           // Full scene view
  | 'medium'         // Characters from waist up
  | 'closeup'        // Face focus
  | 'extreme-closeup' // Eyes/expression focus
  | 'over-shoulder'  // Looking at one character from behind another
  | 'low-angle'      // Looking up at characters (makes them look powerful)
  | 'high-angle'     // Looking down at characters (makes them look small)
  | 'dutch'          // Tilted angle for tension/unease
  | 'bird-eye';      // Top-down view

export type CameraMovement = 
  | 'static'         // No movement
  | 'pan-left'       // Move left
  | 'pan-right'      // Move right
  | 'pan-up'         // Move up
  | 'pan-down'       // Move down
  | 'zoom-in'        // Zoom towards subject
  | 'zoom-out'       // Zoom away from subject
  | 'dolly-in'       // Move camera closer (different from zoom)
  | 'dolly-out'      // Move camera away
  | 'track-left'     // Follow subject moving left
  | 'track-right'    // Follow subject moving right
  | 'crane-up'       // Move camera up while looking down
  | 'crane-down';    // Move camera down while looking up

export type CameraEffect = 
  | 'none'
  | 'shake-light'    // Subtle shake (nervousness, cold)
  | 'shake-medium'   // Medium shake (running, excitement)
  | 'shake-heavy'    // Heavy shake (earthquake, explosion)
  | 'pulse'          // Rhythmic zoom pulse (heartbeat, music)
  | 'wobble'         // Gentle wobble (dream sequence)
  | 'focus-blur'     // Depth of field effect
  | 'vignette';      // Dark edges

export interface CameraState {
  // Position and framing
  x: number;           // Horizontal offset (-100 to 100)
  y: number;           // Vertical offset (-100 to 100)
  zoom: number;        // Zoom level (0.5 to 3)
  rotation: number;    // Rotation in degrees
  
  // Current settings
  angle: CameraAngle;
  movement: CameraMovement;
  effect: CameraEffect;
  
  // Animation
  transitionDuration: number;  // ms
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
}

export interface CameraKeyframe {
  time: number;        // Time in ms from scene start
  state: Partial<CameraState>;
}

export interface CameraSequence {
  keyframes: CameraKeyframe[];
  loop: boolean;
}

// Default camera state
export const DEFAULT_CAMERA_STATE: CameraState = {
  x: 0,
  y: 0,
  zoom: 1,
  rotation: 0,
  angle: 'wide',
  movement: 'static',
  effect: 'none',
  transitionDuration: 500,
  easing: 'ease-in-out',
};

// Preset camera configurations for different angles
export const CAMERA_ANGLE_PRESETS: Record<CameraAngle, Partial<CameraState>> = {
  'wide': {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0,
  },
  'medium': {
    x: 0,
    y: -10,
    zoom: 1.3,
    rotation: 0,
  },
  'closeup': {
    x: 0,
    y: -20,
    zoom: 1.8,
    rotation: 0,
  },
  'extreme-closeup': {
    x: 0,
    y: -25,
    zoom: 2.5,
    rotation: 0,
  },
  'over-shoulder': {
    x: 20,
    y: -5,
    zoom: 1.4,
    rotation: 5,
  },
  'low-angle': {
    x: 0,
    y: 15,
    zoom: 1.2,
    rotation: 0,
  },
  'high-angle': {
    x: 0,
    y: -15,
    zoom: 1.2,
    rotation: 0,
  },
  'dutch': {
    x: 0,
    y: 0,
    zoom: 1.1,
    rotation: 15,
  },
  'bird-eye': {
    x: 0,
    y: -30,
    zoom: 0.8,
    rotation: 0,
  },
};

// Camera movement animations
export const CAMERA_MOVEMENT_ANIMATIONS: Record<CameraMovement, (duration: number) => CameraKeyframe[]> = {
  'static': () => [],
  
  'pan-left': (duration) => [
    { time: 0, state: { x: 20 } },
    { time: duration, state: { x: -20 } },
  ],
  
  'pan-right': (duration) => [
    { time: 0, state: { x: -20 } },
    { time: duration, state: { x: 20 } },
  ],
  
  'pan-up': (duration) => [
    { time: 0, state: { y: 10 } },
    { time: duration, state: { y: -20 } },
  ],
  
  'pan-down': (duration) => [
    { time: 0, state: { y: -20 } },
    { time: duration, state: { y: 10 } },
  ],
  
  'zoom-in': (duration) => [
    { time: 0, state: { zoom: 1 } },
    { time: duration, state: { zoom: 1.5 } },
  ],
  
  'zoom-out': (duration) => [
    { time: 0, state: { zoom: 1.5 } },
    { time: duration, state: { zoom: 1 } },
  ],
  
  'dolly-in': (duration) => [
    { time: 0, state: { zoom: 1, y: 0 } },
    { time: duration, state: { zoom: 1.3, y: -10 } },
  ],
  
  'dolly-out': (duration) => [
    { time: 0, state: { zoom: 1.3, y: -10 } },
    { time: duration, state: { zoom: 1, y: 0 } },
  ],
  
  'track-left': (duration) => [
    { time: 0, state: { x: 30 } },
    { time: duration, state: { x: -30 } },
  ],
  
  'track-right': (duration) => [
    { time: 0, state: { x: -30 } },
    { time: duration, state: { x: 30 } },
  ],
  
  'crane-up': (duration) => [
    { time: 0, state: { y: 20, zoom: 1.2 } },
    { time: duration, state: { y: -20, zoom: 1 } },
  ],
  
  'crane-down': (duration) => [
    { time: 0, state: { y: -20, zoom: 1 } },
    { time: duration, state: { y: 20, zoom: 1.2 } },
  ],
};

// Generate shake effect values
export function generateShakeValues(
  effect: CameraEffect,
  time: number
): { x: number; y: number; rotation: number } {
  if (!effect.startsWith('shake')) {
    return { x: 0, y: 0, rotation: 0 };
  }

  const intensity = effect === 'shake-light' ? 2 :
                    effect === 'shake-medium' ? 5 :
                    effect === 'shake-heavy' ? 12 : 0;

  const frequency = effect === 'shake-light' ? 0.02 :
                    effect === 'shake-medium' ? 0.03 :
                    effect === 'shake-heavy' ? 0.05 : 0;

  // Use multiple sine waves for organic shake
  const t = time * frequency;
  const x = Math.sin(t * 10) * intensity + Math.sin(t * 23) * intensity * 0.5;
  const y = Math.cos(t * 13) * intensity + Math.cos(t * 29) * intensity * 0.3;
  const rotation = Math.sin(t * 17) * (intensity * 0.2);

  return { x, y, rotation };
}

// Generate pulse effect values
export function generatePulseValues(time: number, bpm: number = 80): number {
  const frequency = bpm / 60; // beats per second
  const t = time / 1000; // convert to seconds
  const pulse = Math.sin(t * frequency * Math.PI * 2);
  return 1 + pulse * 0.03; // subtle 3% zoom pulse
}

// Generate wobble effect values
export function generateWobbleValues(time: number): { x: number; y: number; rotation: number } {
  const t = time / 1000;
  return {
    x: Math.sin(t * 0.5) * 3,
    y: Math.cos(t * 0.7) * 2,
    rotation: Math.sin(t * 0.3) * 2,
  };
}

// Interpolate between camera states
export function interpolateCameraState(
  from: CameraState,
  to: Partial<CameraState>,
  progress: number,
  easing: CameraState['easing'] = 'ease-in-out'
): CameraState {
  // Apply easing
  let t = progress;
  switch (easing) {
    case 'ease-in':
      t = progress * progress;
      break;
    case 'ease-out':
      t = 1 - (1 - progress) * (1 - progress);
      break;
    case 'ease-in-out':
      t = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      break;
    case 'spring':
      t = 1 - Math.cos(progress * Math.PI * 2) * Math.exp(-progress * 4);
      break;
  }

  return {
    ...from,
    x: from.x + ((to.x ?? from.x) - from.x) * t,
    y: from.y + ((to.y ?? from.y) - from.y) * t,
    zoom: from.zoom + ((to.zoom ?? from.zoom) - from.zoom) * t,
    rotation: from.rotation + ((to.rotation ?? from.rotation) - from.rotation) * t,
    angle: to.angle ?? from.angle,
    movement: to.movement ?? from.movement,
    effect: to.effect ?? from.effect,
    transitionDuration: to.transitionDuration ?? from.transitionDuration,
    easing: to.easing ?? from.easing,
  };
}

// Get camera state at a specific time in a sequence
export function getCameraStateAtTime(
  sequence: CameraSequence,
  time: number,
  baseState: CameraState = DEFAULT_CAMERA_STATE
): CameraState {
  const { keyframes, loop } = sequence;
  
  if (keyframes.length === 0) {
    return baseState;
  }

  // Handle looping
  const lastKeyframe = keyframes[keyframes.length - 1];
  const totalDuration = lastKeyframe.time;
  
  let adjustedTime = time;
  if (loop && totalDuration > 0) {
    adjustedTime = time % totalDuration;
  } else if (time >= totalDuration) {
    adjustedTime = totalDuration;
  }

  // Find surrounding keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[0];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (adjustedTime >= keyframes[i].time && adjustedTime < keyframes[i + 1].time) {
      prevKeyframe = keyframes[i];
      nextKeyframe = keyframes[i + 1];
      break;
    }
    if (i === keyframes.length - 2) {
      prevKeyframe = keyframes[i + 1];
      nextKeyframe = keyframes[i + 1];
    }
  }

  // Calculate progress between keyframes
  const timeDiff = nextKeyframe.time - prevKeyframe.time;
  const progress = timeDiff > 0 
    ? (adjustedTime - prevKeyframe.time) / timeDiff 
    : 1;

  // Merge base state with keyframe states
  const fromState: CameraState = { ...baseState, ...prevKeyframe.state };
  
  return interpolateCameraState(fromState, nextKeyframe.state, progress, fromState.easing);
}

// Convert camera state to CSS transform
export function cameraStateToCSS(state: CameraState, time: number = 0): CSSProperties {
  let { x, y, zoom, rotation } = state;

  // Apply effects
  if (state.effect.startsWith('shake')) {
    const shake = generateShakeValues(state.effect, time);
    x += shake.x;
    y += shake.y;
    rotation += shake.rotation;
  } else if (state.effect === 'pulse') {
    zoom *= generatePulseValues(time);
  } else if (state.effect === 'wobble') {
    const wobble = generateWobbleValues(time);
    x += wobble.x;
    y += wobble.y;
    rotation += wobble.rotation;
  }

  return {
    transform: `translate(${x}%, ${y}%) scale(${zoom}) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    transition: state.movement === 'static' 
      ? `transform ${state.transitionDuration}ms ${state.easing.replace('-', ' ')}`
      : 'none',
  };
}

// Suggest camera settings based on scene content
export function suggestCameraForScene(
  narration: string,
  characterCount: number,
  action: string
): Partial<CameraState> {
  const lowerNarration = narration.toLowerCase();
  const lowerAction = action.toLowerCase();

  // Detect emotional moments for closeups
  if (lowerNarration.includes('whisper') || 
      lowerNarration.includes('secret') ||
      lowerNarration.includes('tear') ||
      lowerNarration.includes('cry')) {
    return { angle: 'closeup', zoom: 1.6, movement: 'zoom-in' };
  }

  // Detect action for dynamic camera
  if (lowerAction.includes('run') || 
      lowerAction.includes('chase') ||
      lowerNarration.includes('quickly') ||
      lowerNarration.includes('hurry')) {
    return { angle: 'medium', movement: 'track-right', effect: 'shake-light' };
  }

  // Detect surprise/shock
  if (lowerNarration.includes('suddenly') ||
      lowerNarration.includes('surprise') ||
      lowerNarration.includes('shock') ||
      lowerAction.includes('surprised')) {
    return { angle: 'closeup', movement: 'zoom-in', effect: 'shake-light' };
  }

  // Detect conversation
  if (lowerNarration.includes('said') ||
      lowerNarration.includes('asked') ||
      lowerNarration.includes('replied') ||
      lowerAction.includes('talk')) {
    return characterCount > 1 
      ? { angle: 'medium', movement: 'static' }
      : { angle: 'closeup', movement: 'static' };
  }

  // Detect looking/discovering
  if (lowerNarration.includes('look') ||
      lowerNarration.includes('saw') ||
      lowerNarration.includes('found') ||
      lowerNarration.includes('discover')) {
    return { angle: 'wide', movement: 'pan-right' };
  }

  // Detect dramatic moments
  if (lowerNarration.includes('important') ||
      lowerNarration.includes('finally') ||
      lowerNarration.includes('moment')) {
    return { angle: 'low-angle', movement: 'dolly-in' };
  }

  // Default based on character count
  if (characterCount === 1) {
    return { angle: 'medium', movement: 'static' };
  } else if (characterCount === 2) {
    return { angle: 'medium', movement: 'static' };
  } else {
    return { angle: 'wide', movement: 'static' };
  }
}

// Create a simple camera sequence for a scene
export function createSceneCameraSequence(
  duration: number,
  startAngle: CameraAngle = 'wide',
  endAngle: CameraAngle = 'medium',
  movement: CameraMovement = 'static'
): CameraSequence {
  const startState = CAMERA_ANGLE_PRESETS[startAngle];
  const endState = CAMERA_ANGLE_PRESETS[endAngle];
  const movementKeyframes = CAMERA_MOVEMENT_ANIMATIONS[movement](duration);

  const keyframes: CameraKeyframe[] = [
    { time: 0, state: { ...startState, angle: startAngle } },
  ];

  // Add movement keyframes
  if (movementKeyframes.length > 0) {
    keyframes.push(...movementKeyframes);
  }

  // End state
  keyframes.push({
    time: duration,
    state: { ...endState, angle: endAngle },
  });

  return { keyframes, loop: false };
}
