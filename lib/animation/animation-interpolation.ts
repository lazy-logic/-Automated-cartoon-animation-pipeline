/**
 * Animation Interpolation System
 * Inspired by ToonCrafter for smooth inbetweening
 * 
 * This system generates smooth intermediate frames between keyframes
 * using advanced easing and motion prediction techniques.
 */

import { Vector2 } from '../utils/sprite-system';

// Interpolation types
export type InterpolationType = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'bounce'
  | 'elastic'
  | 'anticipation'  // Slight pullback before motion
  | 'overshoot'     // Goes past target then settles
  | 'squash-stretch'; // Cartoon-style deformation

// Motion curve presets (like animation curves in professional tools)
export interface MotionCurve {
  type: InterpolationType;
  tension?: number;      // For spring/elastic
  damping?: number;      // For spring/elastic
  overshoot?: number;    // How much to overshoot (0-1)
  anticipation?: number; // How much to pull back (0-1)
}

// Keyframe with motion data
export interface AnimationKeyframe {
  time: number;
  value: number | Vector2;
  curve?: MotionCurve;
  velocity?: number | Vector2; // For momentum-based interpolation
}

// Inbetween frame result
export interface InbetweenFrame {
  time: number;
  value: number | Vector2;
  squash?: number;  // Vertical scale (for squash-stretch)
  stretch?: number; // Horizontal scale (for squash-stretch)
}

// ============================================
// EASING FUNCTIONS
// ============================================

// Standard easing functions
export function easeLinear(t: number): number {
  return t;
}

export function easeInQuad(t: number): number {
  return t * t;
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeInCubic(t: number): number {
  return t * t * t;
}

export function easeOutCubic(t: number): number {
  return (--t) * t * t + 1;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Spring physics simulation
export function springInterpolation(
  t: number, 
  tension: number = 300, 
  damping: number = 20
): number {
  const omega = Math.sqrt(tension);
  const zeta = damping / (2 * Math.sqrt(tension));
  
  if (zeta < 1) {
    // Underdamped (bouncy)
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * omega * t) * (
      Math.cos(omegaD * t) + (zeta * omega / omegaD) * Math.sin(omegaD * t)
    );
  } else {
    // Critically damped or overdamped
    return 1 - (1 + omega * t) * Math.exp(-omega * t);
  }
}

// Bounce effect
export function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

// Elastic effect (like a rubber band)
export function elasticOut(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// Anticipation (pullback before action)
export function anticipation(t: number, amount: number = 0.2): number {
  if (t < 0.2) {
    // Pull back phase
    return -amount * easeOutQuad(t / 0.2);
  } else {
    // Forward motion
    const adjustedT = (t - 0.2) / 0.8;
    return -amount + (1 + amount) * easeOutCubic(adjustedT);
  }
}

// Overshoot (goes past target then settles)
export function overshoot(t: number, amount: number = 0.15): number {
  if (t < 0.7) {
    // Main motion (overshoots)
    return (1 + amount) * easeOutQuad(t / 0.7);
  } else {
    // Settle back
    const adjustedT = (t - 0.7) / 0.3;
    return 1 + amount * (1 - easeOutQuad(adjustedT));
  }
}

// ============================================
// SQUASH & STRETCH
// ============================================

// Calculate squash/stretch based on velocity
export function calculateSquashStretch(
  velocity: number,
  maxDeformation: number = 0.3
): { squash: number; stretch: number } {
  const absVelocity = Math.abs(velocity);
  const deformation = Math.min(absVelocity * 0.01, maxDeformation);
  
  if (velocity > 0) {
    // Moving up/forward - stretch
    return {
      squash: 1 - deformation * 0.5,
      stretch: 1 + deformation,
    };
  } else if (velocity < 0) {
    // Moving down/backward - squash
    return {
      squash: 1 + deformation,
      stretch: 1 - deformation * 0.5,
    };
  }
  
  return { squash: 1, stretch: 1 };
}

// Impact squash (when landing)
export function impactSquash(
  t: number, // 0-1 progress through impact
  intensity: number = 0.3
): { squash: number; stretch: number } {
  // Quick squash then bounce back
  const squashCurve = t < 0.3
    ? easeOutQuad(t / 0.3)
    : 1 - easeOutQuad((t - 0.3) / 0.7);
  
  const squashAmount = squashCurve * intensity;
  
  return {
    squash: 1 + squashAmount,
    stretch: 1 - squashAmount * 0.5,
  };
}

// ============================================
// INBETWEENING
// ============================================

// Generate inbetween frames between two keyframes
export function generateInbetweens(
  startFrame: AnimationKeyframe,
  endFrame: AnimationKeyframe,
  frameCount: number,
  curve: MotionCurve = { type: 'ease-in-out' }
): InbetweenFrame[] {
  const frames: InbetweenFrame[] = [];
  const duration = endFrame.time - startFrame.time;
  
  for (let i = 0; i <= frameCount; i++) {
    const t = i / frameCount;
    const time = startFrame.time + t * duration;
    
    // Apply easing based on curve type
    let easedT = applyEasing(t, curve);
    
    // Interpolate value
    const value = interpolateValue(startFrame.value, endFrame.value, easedT);
    
    // Calculate velocity for squash-stretch
    const velocity = calculateVelocity(startFrame, endFrame, t, duration);
    const { squash, stretch } = curve.type === 'squash-stretch'
      ? calculateSquashStretch(velocity)
      : { squash: 1, stretch: 1 };
    
    frames.push({ time, value, squash, stretch });
  }
  
  return frames;
}

// Apply easing function based on curve type
function applyEasing(t: number, curve: MotionCurve): number {
  switch (curve.type) {
    case 'linear':
      return easeLinear(t);
    case 'ease-in':
      return easeInCubic(t);
    case 'ease-out':
      return easeOutCubic(t);
    case 'ease-in-out':
      return easeInOutCubic(t);
    case 'spring':
      return springInterpolation(t, curve.tension, curve.damping);
    case 'bounce':
      return bounceOut(t);
    case 'elastic':
      return elasticOut(t);
    case 'anticipation':
      return anticipation(t, curve.anticipation || 0.2);
    case 'overshoot':
      return overshoot(t, curve.overshoot || 0.15);
    case 'squash-stretch':
      return easeInOutCubic(t);
    default:
      return t;
  }
}

// Interpolate between two values
function interpolateValue(
  start: number | Vector2,
  end: number | Vector2,
  t: number
): number | Vector2 {
  if (typeof start === 'number' && typeof end === 'number') {
    return start + (end - start) * t;
  }
  
  if (typeof start === 'object' && typeof end === 'object') {
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    };
  }
  
  return start;
}

// Calculate velocity at a point
function calculateVelocity(
  start: AnimationKeyframe,
  end: AnimationKeyframe,
  t: number,
  duration: number
): number {
  if (typeof start.value === 'number' && typeof end.value === 'number') {
    // Simple velocity calculation
    const delta = end.value - start.value;
    // Velocity is higher in the middle of ease-in-out
    const velocityMultiplier = 4 * t * (1 - t); // Peaks at t=0.5
    return (delta / duration) * velocityMultiplier * 1000;
  }
  
  if (typeof start.value === 'object' && typeof end.value === 'object') {
    const deltaY = end.value.y - start.value.y;
    const velocityMultiplier = 4 * t * (1 - t);
    return (deltaY / duration) * velocityMultiplier * 1000;
  }
  
  return 0;
}

// ============================================
// MOTION PATH INTERPOLATION
// ============================================

// Arc motion (for more natural movement)
export function arcInterpolation(
  start: Vector2,
  end: Vector2,
  t: number,
  arcHeight: number = 0.3
): Vector2 {
  const linear = {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
  
  // Add arc (parabola)
  const arcOffset = Math.sin(t * Math.PI) * arcHeight * Math.abs(end.x - start.x);
  
  return {
    x: linear.x,
    y: linear.y - arcOffset, // Negative because Y is inverted in screen coords
  };
}

// Bezier curve interpolation for complex paths
export function bezierInterpolation(
  p0: Vector2,
  p1: Vector2, // Control point 1
  p2: Vector2, // Control point 2
  p3: Vector2,
  t: number
): Vector2 {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

// ============================================
// ANIMATION PRESETS
// ============================================

export const MOTION_PRESETS: Record<string, MotionCurve> = {
  // Standard
  linear: { type: 'linear' },
  smooth: { type: 'ease-in-out' },
  
  // Energetic
  bouncy: { type: 'spring', tension: 400, damping: 15 },
  elastic: { type: 'elastic' },
  bounce: { type: 'bounce' },
  
  // Cartoon-style
  snappy: { type: 'anticipation', anticipation: 0.15 },
  popIn: { type: 'overshoot', overshoot: 0.2 },
  squashStretch: { type: 'squash-stretch' },
  
  // Subtle
  gentle: { type: 'ease-out' },
  slowStart: { type: 'ease-in' },
};

// Get recommended motion curve for action type
export function getMotionCurveForAction(action: string): MotionCurve {
  switch (action) {
    case 'walk':
      return MOTION_PRESETS.smooth;
    case 'run':
      return MOTION_PRESETS.bouncy;
    case 'jump':
      return { type: 'anticipation', anticipation: 0.25 };
    case 'land':
      return MOTION_PRESETS.squashStretch;
    case 'wave':
      return MOTION_PRESETS.elastic;
    case 'talk':
      return MOTION_PRESETS.gentle;
    case 'surprised':
      return MOTION_PRESETS.popIn;
    case 'dance':
      return MOTION_PRESETS.bouncy;
    default:
      return MOTION_PRESETS.smooth;
  }
}

// ============================================
// FRAME RATE CONVERSION
// ============================================

// Convert animation to different frame rates (like ToonCrafter's interpolation)
export function convertFrameRate(
  keyframes: AnimationKeyframe[],
  originalFPS: number,
  targetFPS: number
): InbetweenFrame[] {
  if (keyframes.length < 2) return [];
  
  const result: InbetweenFrame[] = [];
  const fpsRatio = targetFPS / originalFPS;
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    const start = keyframes[i];
    const end = keyframes[i + 1];
    const framesToGenerate = Math.round(fpsRatio);
    
    const inbetweens = generateInbetweens(
      start,
      end,
      framesToGenerate,
      start.curve || { type: 'ease-in-out' }
    );
    
    result.push(...inbetweens.slice(0, -1)); // Avoid duplicating end frame
  }
  
  // Add final frame
  const lastKeyframe = keyframes[keyframes.length - 1];
  result.push({
    time: lastKeyframe.time,
    value: lastKeyframe.value,
    squash: 1,
    stretch: 1,
  });
  
  return result;
}
