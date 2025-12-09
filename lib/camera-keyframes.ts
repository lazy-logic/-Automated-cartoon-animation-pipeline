/**
 * Camera Keyframe Animation System
 * Enables camera movement over time with keyframes and smooth transitions
 */

import { CameraState, DEFAULT_CAMERA_STATE, interpolateCameraState } from './camera-system';

export interface CameraKeyframe {
  id: string;
  time: number; // Time in ms from scene start
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce';
}

export interface CameraAnimation {
  id: string;
  sceneId: string;
  keyframes: CameraKeyframe[];
  duration: number;
  loop: boolean;
}

// Easing type
export type EasingType = CameraKeyframe['easing'];

// Easing functions
export const EASING_FUNCTIONS: Record<CameraKeyframe['easing'], (t: number) => number> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => 1 - (1 - t) * (1 - t),
  'ease-in-out': (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  spring: (t) => 1 - Math.cos(t * Math.PI * 2) * Math.exp(-t * 4),
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * Create a new camera keyframe
 */
export function createKeyframe(
  time: number,
  zoom: number = 1,
  panX: number = 0,
  panY: number = 0,
  rotation: number = 0,
  easing: CameraKeyframe['easing'] = 'ease-in-out'
): CameraKeyframe {
  return {
    id: `kf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time,
    zoom,
    panX,
    panY,
    rotation,
    easing,
  };
}

/**
 * Create a camera animation from keyframes
 */
export function createCameraAnimation(
  sceneId: string,
  keyframes: CameraKeyframe[],
  duration: number,
  loop: boolean = false
): CameraAnimation {
  return {
    id: `cam-anim-${Date.now()}`,
    sceneId,
    keyframes: keyframes.sort((a, b) => a.time - b.time),
    duration,
    loop,
  };
}

/**
 * Get camera state at a specific time in the animation
 */
export function getCameraAtTime(
  animation: CameraAnimation,
  time: number
): { zoom: number; panX: number; panY: number; rotation: number } {
  const { keyframes, duration, loop } = animation;

  if (keyframes.length === 0) {
    return { zoom: 1, panX: 0, panY: 0, rotation: 0 };
  }

  if (keyframes.length === 1) {
    const kf = keyframes[0];
    return { zoom: kf.zoom, panX: kf.panX, panY: kf.panY, rotation: kf.rotation };
  }

  // Handle looping
  let adjustedTime = time;
  if (loop && duration > 0) {
    adjustedTime = time % duration;
  } else {
    adjustedTime = Math.min(time, duration);
  }

  // Find surrounding keyframes
  let prevKf = keyframes[0];
  let nextKf = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (adjustedTime >= keyframes[i].time && adjustedTime < keyframes[i + 1].time) {
      prevKf = keyframes[i];
      nextKf = keyframes[i + 1];
      break;
    }
  }

  // If time is before first keyframe
  if (adjustedTime < keyframes[0].time) {
    const kf = keyframes[0];
    return { zoom: kf.zoom, panX: kf.panX, panY: kf.panY, rotation: kf.rotation };
  }

  // If time is after last keyframe
  if (adjustedTime >= keyframes[keyframes.length - 1].time) {
    const kf = keyframes[keyframes.length - 1];
    return { zoom: kf.zoom, panX: kf.panX, panY: kf.panY, rotation: kf.rotation };
  }

  // Interpolate between keyframes
  const timeDiff = nextKf.time - prevKf.time;
  const progress = timeDiff > 0 ? (adjustedTime - prevKf.time) / timeDiff : 1;
  const easedProgress = EASING_FUNCTIONS[nextKf.easing](progress);

  return {
    zoom: prevKf.zoom + (nextKf.zoom - prevKf.zoom) * easedProgress,
    panX: prevKf.panX + (nextKf.panX - prevKf.panX) * easedProgress,
    panY: prevKf.panY + (nextKf.panY - prevKf.panY) * easedProgress,
    rotation: prevKf.rotation + (nextKf.rotation - prevKf.rotation) * easedProgress,
  };
}

/**
 * Generate preset camera animations
 */
export const CAMERA_ANIMATION_PRESETS = {
  // Slow zoom in
  slowZoomIn: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1, 0, 0, 0, 'ease-out'),
    createKeyframe(duration, 1.3, 0, -10, 0, 'ease-out'),
  ],

  // Slow zoom out
  slowZoomOut: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1.3, 0, -10, 0, 'ease-out'),
    createKeyframe(duration, 1, 0, 0, 0, 'ease-out'),
  ],

  // Pan left to right
  panLeftToRight: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1, -30, 0, 0, 'ease-in-out'),
    createKeyframe(duration, 1, 30, 0, 0, 'ease-in-out'),
  ],

  // Pan right to left
  panRightToLeft: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1, 30, 0, 0, 'ease-in-out'),
    createKeyframe(duration, 1, -30, 0, 0, 'ease-in-out'),
  ],

  // Dramatic reveal (zoom out from close)
  dramaticReveal: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 2, 0, -20, 0, 'ease-out'),
    createKeyframe(duration * 0.3, 1.5, 0, -10, 0, 'ease-out'),
    createKeyframe(duration, 1, 0, 0, 0, 'ease-out'),
  ],

  // Focus pull (zoom in then out)
  focusPull: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1, 0, 0, 0, 'ease-in-out'),
    createKeyframe(duration * 0.5, 1.4, 0, -15, 0, 'ease-in-out'),
    createKeyframe(duration, 1, 0, 0, 0, 'ease-in-out'),
  ],

  // Ken Burns effect (slow pan + zoom)
  kenBurns: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1, -20, 0, 0, 'linear'),
    createKeyframe(duration, 1.2, 20, -10, 0, 'linear'),
  ],

  // Shake effect
  shake: (duration: number): CameraKeyframe[] => {
    const keyframes: CameraKeyframe[] = [];
    const shakeCount = Math.floor(duration / 100);
    for (let i = 0; i <= shakeCount; i++) {
      const t = (i / shakeCount) * duration;
      const intensity = Math.sin((i / shakeCount) * Math.PI) * 5; // Fade in/out
      keyframes.push(
        createKeyframe(
          t,
          1,
          (Math.random() - 0.5) * intensity,
          (Math.random() - 0.5) * intensity,
          (Math.random() - 0.5) * intensity * 0.5,
          'linear'
        )
      );
    }
    return keyframes;
  },

  // Dutch angle (tilt)
  dutchAngle: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1, 0, 0, 0, 'ease-in-out'),
    createKeyframe(duration * 0.3, 1.1, 5, -5, 10, 'ease-in-out'),
    createKeyframe(duration * 0.7, 1.1, 5, -5, 10, 'linear'),
    createKeyframe(duration, 1, 0, 0, 0, 'ease-in-out'),
  ],

  // Conversation (alternate between two positions)
  conversation: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 1.2, -15, -10, 0, 'ease-in-out'),
    createKeyframe(duration * 0.25, 1.2, -15, -10, 0, 'ease-in-out'),
    createKeyframe(duration * 0.35, 1.2, 15, -10, 0, 'ease-in-out'),
    createKeyframe(duration * 0.6, 1.2, 15, -10, 0, 'ease-in-out'),
    createKeyframe(duration * 0.7, 1.2, -15, -10, 0, 'ease-in-out'),
    createKeyframe(duration, 1, 0, 0, 0, 'ease-out'),
  ],

  // Establishing shot (wide to medium)
  establishingShot: (duration: number): CameraKeyframe[] => [
    createKeyframe(0, 0.8, 0, 10, 0, 'ease-out'),
    createKeyframe(duration * 0.6, 0.8, 0, 10, 0, 'linear'),
    createKeyframe(duration, 1.2, 0, -10, 0, 'ease-in-out'),
  ],
};

/**
 * Suggest camera animation based on scene content
 */
export function suggestCameraAnimation(
  narration: string,
  characterCount: number,
  duration: number
): CameraKeyframe[] {
  const text = narration.toLowerCase();

  // Dialogue/conversation
  if (characterCount >= 2 && (text.includes('said') || text.includes('asked') || text.includes('replied'))) {
    return CAMERA_ANIMATION_PRESETS.conversation(duration);
  }

  // Dramatic moments
  if (text.includes('suddenly') || text.includes('surprise') || text.includes('shock')) {
    return CAMERA_ANIMATION_PRESETS.dramaticReveal(duration);
  }

  // Action/chase
  if (text.includes('run') || text.includes('chase') || text.includes('fast')) {
    return CAMERA_ANIMATION_PRESETS.shake(duration);
  }

  // Discovery/reveal
  if (text.includes('found') || text.includes('discover') || text.includes('saw')) {
    return CAMERA_ANIMATION_PRESETS.slowZoomIn(duration);
  }

  // Establishing/intro
  if (text.includes('once upon') || text.includes('one day') || text.includes('morning')) {
    return CAMERA_ANIMATION_PRESETS.establishingShot(duration);
  }

  // Emotional moments
  if (text.includes('happy') || text.includes('sad') || text.includes('love')) {
    return CAMERA_ANIMATION_PRESETS.focusPull(duration);
  }

  // Default: Ken Burns for visual interest
  return CAMERA_ANIMATION_PRESETS.kenBurns(duration);
}
