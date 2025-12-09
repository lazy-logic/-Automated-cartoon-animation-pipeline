/**
 * Professional SVG Sprite System for Cartoon Studio
 * 
 * This module provides:
 * - Character sprites using actual SVG files from /public
 * - Scene templates with pre-configured layouts
 * - Animation presets for professional-quality animations
 * 
 * NO AI/ML REQUIRED - Uses traditional keyframe animation
 */

import type { CharacterInstance, Scene } from './types';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// CHARACTER SPRITE DEFINITIONS
// ============================================================================

export interface CharacterSprite {
  id: string;
  name: string;
  category: 'child' | 'adult' | 'animal' | 'fantasy' | 'robot';
  description: string;
  
  // Use actual SVG file from /public folder
  svgFile: string;
  
  // Viewbox for proper scaling
  viewBox: string;
  
  // Size hints for rendering
  width: number;
  height: number;
  
  // Available poses (for multi-pose sprite sheets)
  poses: CharacterPose[];
  
  // Available expressions
  expressions: SpriteExpression[];
  
  // Animation capabilities
  animations: SpriteAnimation[];
  
  // Default colors (can be customized)
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// SpritePath interface removed - now using SVG files directly

export interface CharacterPose {
  id: string;
  name: string;
  transforms: Record<string, string>; // partId -> transform
}

export interface SpriteExpression {
  id: string;
  name: string;
  eyeShape: string;
  mouthShape: string;
  eyebrowAngle: number;
}

export interface SpriteAnimation {
  id: string;
  name: string;
  duration: number;
  keyframes: AnimationKeyframe[];
  loop: boolean;
}

export interface AnimationKeyframe {
  time: number; // 0-1
  transforms: Record<string, string>;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
}

// ============================================================================
// PRE-MADE CHARACTER SPRITES (Using actual SVG files from /public)
// ============================================================================

export const CHARACTER_SPRITES: CharacterSprite[] = [
  {
    id: 'sprite-business-man',
    name: 'Business Man',
    category: 'adult',
    description: 'Professional businessman character set with multiple poses',
    svgFile: '/25333901_aa_man_set.svg',
    viewBox: '0 0 673 425',
    width: 673,
    height: 425,
    poses: [
      { id: 'standing', name: 'Standing', transforms: {} },
      { id: 'presenting', name: 'Presenting', transforms: {} },
      { id: 'thinking', name: 'Thinking', transforms: {} },
    ],
    expressions: [
      { id: 'neutral', name: 'Neutral', eyeShape: 'normal', mouthShape: 'flat', eyebrowAngle: 0 },
      { id: 'happy', name: 'Happy', eyeShape: 'arc', mouthShape: 'smile', eyebrowAngle: 0 },
      { id: 'serious', name: 'Serious', eyeShape: 'narrow', mouthShape: 'flat', eyebrowAngle: 5 },
    ],
    animations: [
      {
        id: 'idle',
        name: 'Idle',
        duration: 2000,
        loop: true,
        keyframes: [
          { time: 0, transforms: {} },
          { time: 0.5, transforms: {}, easing: 'easeInOut' },
          { time: 1, transforms: {}, easing: 'easeInOut' },
        ],
      },
      {
        id: 'bounce',
        name: 'Bounce',
        duration: 500,
        loop: true,
        keyframes: [
          { time: 0, transforms: {} },
          { time: 0.5, transforms: {}, easing: 'easeOut' },
          { time: 1, transforms: {}, easing: 'easeIn' },
        ],
      },
    ],
    colors: {
      primary: '#3498DB',
      secondary: '#2C3E50',
      accent: '#E74C3C',
    },
  },
  {
    id: 'sprite-character-set',
    name: 'Cartoon Characters',
    category: 'child',
    description: 'Colorful cartoon character illustrations',
    svgFile: '/12553930_4956840.svg',
    viewBox: '0 0 750 500',
    width: 750,
    height: 500,
    poses: [
      { id: 'default', name: 'Default', transforms: {} },
      { id: 'action', name: 'Action', transforms: {} },
    ],
    expressions: [
      { id: 'happy', name: 'Happy', eyeShape: 'arc', mouthShape: 'smile', eyebrowAngle: 0 },
      { id: 'neutral', name: 'Neutral', eyeShape: 'normal', mouthShape: 'flat', eyebrowAngle: 0 },
    ],
    animations: [
      {
        id: 'idle',
        name: 'Idle',
        duration: 2000,
        loop: true,
        keyframes: [
          { time: 0, transforms: {} },
          { time: 1, transforms: {} },
        ],
      },
    ],
    colors: {
      primary: '#E4A035',
      secondary: '#82421B',
      accent: '#DAE0FA',
    },
  },
  {
    id: 'sprite-illustrated-scene',
    name: 'Illustrated Characters',
    category: 'fantasy',
    description: 'Beautifully illustrated cartoon characters',
    svgFile: '/12735490_b87t_23nk_210105.svg',
    viewBox: '0 0 314.997 178.044',
    width: 315,
    height: 178,
    poses: [
      { id: 'default', name: 'Default', transforms: {} },
    ],
    expressions: [
      { id: 'neutral', name: 'Neutral', eyeShape: 'normal', mouthShape: 'flat', eyebrowAngle: 0 },
    ],
    animations: [
      {
        id: 'idle',
        name: 'Idle',
        duration: 2000,
        loop: true,
        keyframes: [
          { time: 0, transforms: {} },
          { time: 1, transforms: {} },
        ],
      },
    ],
    colors: {
      primary: '#D02026',
      secondary: '#333332',
      accent: '#690C0D',
    },
  },
  {
    id: 'sprite-detailed-scene',
    name: 'Detailed Scene Characters',
    category: 'fantasy',
    description: 'Detailed character illustrations from scene file',
    svgFile: '/3296535_16305.svg',
    viewBox: '0 0 800 600',
    width: 800,
    height: 600,
    poses: [
      { id: 'default', name: 'Default', transforms: {} },
    ],
    expressions: [
      { id: 'neutral', name: 'Neutral', eyeShape: 'normal', mouthShape: 'flat', eyebrowAngle: 0 },
    ],
    animations: [
      {
        id: 'idle',
        name: 'Idle',
        duration: 2000,
        loop: true,
        keyframes: [
          { time: 0, transforms: {} },
          { time: 1, transforms: {} },
        ],
      },
    ],
    colors: {
      primary: '#4A90D9',
      secondary: '#2ECC71',
      accent: '#F39C12',
    },
  },
];

// ============================================================================
// SCENE TEMPLATES
// ============================================================================

export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  category: 'adventure' | 'educational' | 'fantasy' | 'everyday' | 'nature';
  thumbnail: string;
  
  // Pre-configured scene settings
  backgroundId: string;
  duration: number;
  
  // Pre-placed characters with positions
  characters: {
    spriteId: string;
    position: { x: number; y: number };
    scale: number;
    pose: string;
    expression: string;
    animation: string;
  }[];
  
  // Camera settings
  camera: {
    panX: number;
    zoom: number;
    animation?: 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'none';
  };
  
  // Suggested narration
  suggestedNarration: string;
  
  // Scene-specific animations
  sceneAnimations?: {
    type: 'parallax' | 'particles' | 'weather';
    config: Record<string, unknown>;
  }[];
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'template-forest-adventure',
    name: 'Forest Adventure',
    description: 'Characters exploring a magical forest',
    category: 'adventure',
    thumbnail: '/templates/forest-adventure.jpg',
    backgroundId: 'svg-1',
    duration: 5000,
    characters: [
      {
        spriteId: 'sprite-character-set',
        position: { x: 40, y: 60 },
        scale: 0.4,
        pose: 'default',
        expression: 'happy',
        animation: 'idle',
      },
    ],
    camera: {
      panX: 0,
      zoom: 1,
      animation: 'pan_right',
    },
    suggestedNarration: 'Our friends set off on an exciting adventure through the enchanted forest.',
    sceneAnimations: [
      { type: 'parallax', config: { speed: 0.5 } },
      { type: 'particles', config: { type: 'leaves', count: 10 } },
    ],
  },
  {
    id: 'template-business-meeting',
    name: 'Business Meeting',
    description: 'Professional business presentation scene',
    category: 'educational',
    thumbnail: '/templates/meeting-robot.jpg',
    backgroundId: 'svg-2',
    duration: 4000,
    characters: [
      {
        spriteId: 'sprite-business-man',
        position: { x: 50, y: 55 },
        scale: 0.5,
        pose: 'presenting',
        expression: 'happy',
        animation: 'idle',
      },
    ],
    camera: {
      panX: 0,
      zoom: 1,
      animation: 'zoom_in',
    },
    suggestedNarration: 'The presentation was about to begin with exciting new ideas!',
  },
  {
    id: 'template-sunny-park',
    name: 'Day at the Park',
    description: 'Characters enjoying a sunny day',
    category: 'everyday',
    thumbnail: '/templates/sunny-park.jpg',
    backgroundId: 'svg-4',
    duration: 5000,
    characters: [
      {
        spriteId: 'sprite-character-set',
        position: { x: 50, y: 60 },
        scale: 0.35,
        pose: 'default',
        expression: 'happy',
        animation: 'idle',
      },
    ],
    camera: {
      panX: 0,
      zoom: 1,
      animation: 'none',
    },
    suggestedNarration: 'It was a beautiful sunny day, perfect for playing with friends at the park!',
  },
  {
    id: 'template-illustrated-story',
    name: 'Illustrated Story',
    description: 'Beautiful illustrated scene',
    category: 'fantasy',
    thumbnail: '/templates/bedtime.jpg',
    backgroundId: 'svg-5',
    duration: 6000,
    characters: [
      {
        spriteId: 'sprite-illustrated-scene',
        position: { x: 50, y: 60 },
        scale: 1.5,
        pose: 'default',
        expression: 'neutral',
        animation: 'idle',
      },
    ],
    camera: {
      panX: 0,
      zoom: 1.1,
      animation: 'zoom_in',
    },
    suggestedNarration: 'Once upon a time, in a land of wonder and magic...',
    sceneAnimations: [
      { type: 'particles', config: { type: 'stars', count: 20 } },
    ],
  },
  {
    id: 'template-learning-time',
    name: 'Learning Time',
    description: 'Educational scene with characters',
    category: 'educational',
    thumbnail: '/templates/learning.jpg',
    backgroundId: 'svg-6',
    duration: 5000,
    characters: [
      {
        spriteId: 'sprite-business-man',
        position: { x: 50, y: 55 },
        scale: 0.45,
        pose: 'standing',
        expression: 'happy',
        animation: 'idle',
      },
    ],
    camera: {
      panX: 0,
      zoom: 1,
      animation: 'none',
    },
    suggestedNarration: 'Today we will learn something new and exciting!',
  },
  {
    id: 'template-magical-garden',
    name: 'Magical Garden',
    description: 'Discovering a secret garden',
    category: 'fantasy',
    thumbnail: '/templates/garden.jpg',
    backgroundId: 'svg-3',
    duration: 5000,
    characters: [
      {
        spriteId: 'sprite-character-set',
        position: { x: 40, y: 60 },
        scale: 0.35,
        pose: 'default',
        expression: 'happy',
        animation: 'idle',
      },
    ],
    camera: {
      panX: 0,
      zoom: 0.9,
      animation: 'zoom_in',
    },
    suggestedNarration: 'Emma gasped in wonder as she discovered the most beautiful garden she had ever seen!',
    sceneAnimations: [
      { type: 'particles', config: { type: 'sparkles', count: 15 } },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a character instance from a sprite template
 */
export function createCharacterFromSprite(
  sprite: CharacterSprite,
  options: {
    x?: number;
    y?: number;
    scale?: number;
    pose?: string;
    expression?: string;
  } = {}
): CharacterInstance {
  return {
    id: uuidv4(),
    templateId: sprite.id,
    name: sprite.name,
    x: options.x ?? 50,
    y: options.y ?? 65,
    scale: options.scale ?? 1,
    flipX: false,
    expression: (options.expression as any) ?? 'neutral',
    zIndex: 1,
  };
}

/**
 * Create a scene from a template
 */
export function createSceneFromTemplate(template: SceneTemplate): Scene {
  const characters: CharacterInstance[] = template.characters.map((charConfig) => {
    const sprite = CHARACTER_SPRITES.find((s) => s.id === charConfig.spriteId);
    if (!sprite) {
      // Fallback to basic character
      return {
        id: uuidv4(),
        templateId: charConfig.spriteId,
        name: 'Character',
        x: charConfig.position.x,
        y: charConfig.position.y,
        scale: charConfig.scale,
        flipX: false,
        expression: charConfig.expression as any,
        zIndex: 1,
      };
    }
    
    return {
      id: uuidv4(),
      templateId: sprite.id,
      name: sprite.name,
      x: charConfig.position.x,
      y: charConfig.position.y,
      scale: charConfig.scale,
      flipX: false,
      expression: charConfig.expression as any,
      zIndex: 1,
    };
  });

  return {
    id: uuidv4(),
    title: template.name,
    description: template.description,
    backgroundId: template.backgroundId,
    characters,
    animations: [],
    duration: template.duration,
    narration: template.suggestedNarration,
    transition: 'fade',
    cameraPanX: template.camera.panX,
    cameraPanY: 0,
    cameraZoom: template.camera.zoom,
  };
}

/**
 * Get sprite by ID
 */
export function getSpriteById(id: string): CharacterSprite | undefined {
  return CHARACTER_SPRITES.find((s) => s.id === id);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SceneTemplate | undefined {
  return SCENE_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get sprites by category
 */
export function getSpritesByCategory(category: CharacterSprite['category']): CharacterSprite[] {
  return CHARACTER_SPRITES.filter((s) => s.category === category);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: SceneTemplate['category']): SceneTemplate[] {
  return SCENE_TEMPLATES.filter((t) => t.category === category);
}
