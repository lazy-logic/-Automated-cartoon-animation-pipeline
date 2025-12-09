/**
 * Animation Engine
 * Handles all animation logic including character movements, expressions, and scene transitions
 */

import gsap from 'gsap';
import { AnimatedCharacter, ANIMATED_CHARACTERS } from './characters';

export type AnimationType = 'idle' | 'walk' | 'wave' | 'talk' | 'jump' | 'sit';
export type ExpressionType = 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry' | 'talking';

export interface SceneCharacter {
  id: string;
  characterId: string;
  name: string;
  x: number;
  y: number;
  position: number; // -100 to 100 for left/right positioning
  scale: number;
  flipX: boolean;
  animation: AnimationType;
  expression: ExpressionType;
  isTalking: boolean;
}

export interface AnimationScene {
  id: string;
  title: string;
  narration: string;
  background: string;
  characters: SceneCharacter[];
  duration: number;
  cameraZoom: number;
  cameraPanX: number;
  transition: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface AnimationProject {
  id: string;
  title: string;
  scenes: AnimationScene[];
  currentSceneIndex: number;
  isPlaying: boolean;
  currentTime: number;
}

// Character position presets
export const POSITION_PRESETS = {
  left: { x: 25, y: 75 },
  center: { x: 50, y: 75 },
  right: { x: 75, y: 75 },
  'far-left': { x: 10, y: 75 },
  'far-right': { x: 90, y: 75 },
};

// Animation presets for common actions
export const ACTION_PRESETS: Record<string, { animation: AnimationType; duration: number }> = {
  enter: { animation: 'walk', duration: 1500 },
  exit: { animation: 'walk', duration: 1500 },
  greet: { animation: 'wave', duration: 2000 },
  speak: { animation: 'talk', duration: 3000 },
  celebrate: { animation: 'jump', duration: 1000 },
  rest: { animation: 'sit', duration: 2000 },
  stand: { animation: 'idle', duration: 2000 },
};

// Get character by ID
export function getCharacter(characterId: string): AnimatedCharacter | undefined {
  // Map common names to character IDs
  const nameMap: Record<string, string> = {
    'luna': 'char-girl',
    'max': 'char-boy',
    'whiskers': 'char-cat',
  };
  
  const mappedId = nameMap[characterId.toLowerCase()] || characterId;
  return ANIMATED_CHARACTERS.find(c => c.id === mappedId || c.name.toLowerCase() === characterId.toLowerCase());
}

// Create a scene character from template
export function createSceneCharacter(
  characterId: string,
  options: Partial<SceneCharacter> = {}
): SceneCharacter {
  const character = getCharacter(characterId);
  const name = character?.name || characterId;
  
  return {
    id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    characterId: character?.id || 'char-girl',
    name,
    x: options.x ?? 50,
    y: options.y ?? 75,
    position: options.position ?? 0,
    scale: options.scale ?? 0.8,
    flipX: options.flipX ?? false,
    animation: options.animation ?? 'idle',
    expression: options.expression ?? 'neutral',
    isTalking: options.isTalking ?? false,
  };
}

// Position mapping for character placement
const POSITION_MAP: Record<string, number> = {
  'left': -120,
  'center': 0,
  'right': 120,
  'far-left': -200,
  'far-right': 200,
};

// Create a scene from story data
export function createSceneFromStory(
  storyScene: {
    title: string;
    narration: string;
    background: string;
    characters: { name: string; position: string; expression: string; action: string }[];
    duration: number;
  }
): AnimationScene {
  const characters = storyScene.characters.map((charData, index) => {
    const positionPreset = POSITION_PRESETS[charData.position as keyof typeof POSITION_PRESETS] || POSITION_PRESETS.center;
    const positionValue = POSITION_MAP[charData.position] ?? 0;
    const action = ACTION_PRESETS[charData.action] || ACTION_PRESETS.stand;
    
    return createSceneCharacter(charData.name, {
      x: positionPreset.x,
      y: positionPreset.y,
      position: positionValue,
      animation: action.animation,
      expression: charData.expression as ExpressionType,
      flipX: charData.position === 'right' || charData.position === 'far-right',
    });
  });

  return {
    id: `scene-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: storyScene.title,
    narration: storyScene.narration,
    background: storyScene.background,
    characters,
    duration: storyScene.duration,
    cameraZoom: 1,
    cameraPanX: 0,
    transition: 'fade',
  };
}

// Animation timeline controller
export class AnimationController {
  private timeline: gsap.core.Timeline | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private onUpdate: ((time: number) => void) | null = null;
  private onComplete: (() => void) | null = null;

  constructor() {
    this.timeline = gsap.timeline({ paused: true });
  }

  setCallbacks(onUpdate: (time: number) => void, onComplete: () => void) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  play() {
    this.isPlaying = true;
    this.timeline?.play();
  }

  pause() {
    this.isPlaying = false;
    this.timeline?.pause();
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    this.timeline?.pause();
    this.timeline?.seek(0);
  }

  seek(time: number) {
    this.currentTime = time;
    this.timeline?.seek(time / 1000);
  }

  getProgress(): number {
    return this.timeline?.progress() || 0;
  }

  getDuration(): number {
    return (this.timeline?.duration() || 0) * 1000;
  }

  destroy() {
    this.timeline?.kill();
    this.timeline = null;
  }
}

// Interpolate between keyframes
export function interpolateTransform(
  from: { rotation?: number; x?: number; y?: number; scaleX?: number; scaleY?: number },
  to: { rotation?: number; x?: number; y?: number; scaleX?: number; scaleY?: number },
  progress: number
): { rotation: number; x: number; y: number; scaleX: number; scaleY: number } {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  
  return {
    rotation: lerp(from.rotation || 0, to.rotation || 0, progress),
    x: lerp(from.x || 0, to.x || 0, progress),
    y: lerp(from.y || 0, to.y || 0, progress),
    scaleX: lerp(from.scaleX || 1, to.scaleX || 1, progress),
    scaleY: lerp(from.scaleY || 1, to.scaleY || 1, progress),
  };
}

// Calculate animation frame for a character
export function calculateAnimationFrame(
  character: AnimatedCharacter,
  animationType: AnimationType,
  time: number
): Record<string, { rotation: number; x: number; y: number; scaleX: number; scaleY: number }> {
  const animation = character.animations[animationType];
  if (!animation || animation.keyframes.length === 0) {
    return {};
  }

  const duration = animation.duration * 1000;
  const loopedTime = animation.loop ? time % duration : Math.min(time, duration);
  const progress = loopedTime / duration;

  // Find surrounding keyframes
  let prevKeyframe = animation.keyframes[0];
  let nextKeyframe = animation.keyframes[animation.keyframes.length - 1];
  let localProgress = 0;

  for (let i = 0; i < animation.keyframes.length - 1; i++) {
    if (progress >= animation.keyframes[i].time && progress < animation.keyframes[i + 1].time) {
      prevKeyframe = animation.keyframes[i];
      nextKeyframe = animation.keyframes[i + 1];
      const segmentDuration = nextKeyframe.time - prevKeyframe.time;
      localProgress = (progress - prevKeyframe.time) / segmentDuration;
      break;
    }
  }

  // Interpolate all parts
  const result: Record<string, { rotation: number; x: number; y: number; scaleX: number; scaleY: number }> = {};
  
  const allPartIds = new Set([
    ...Object.keys(prevKeyframe.parts),
    ...Object.keys(nextKeyframe.parts),
  ]);

  allPartIds.forEach(partId => {
    const fromTransform = prevKeyframe.parts[partId] || {};
    const toTransform = nextKeyframe.parts[partId] || {};
    result[partId] = interpolateTransform(fromTransform, toTransform, localProgress);
  });

  return result;
}

// Export animation as frames (for video export)
export async function exportAnimationFrames(
  scenes: AnimationScene[],
  fps: number = 30,
  width: number = 1920,
  height: number = 1080
): Promise<ImageData[]> {
  const frames: ImageData[] = [];
  
  // This would be implemented with canvas rendering
  // For now, return empty array - actual implementation would render each frame
  
  return frames;
}
