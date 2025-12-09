/**
 * Scene Templates Library
 * Pre-built scene compositions for quick story creation
 */

import { EditableScene, EditableCharacter } from '@/components/InteractiveSceneEditor';
import { CameraKeyframe, createKeyframe, CAMERA_ANIMATION_PRESETS } from './camera-keyframes';

export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  category: 'dialogue' | 'action' | 'emotion' | 'transition' | 'establishing';
  thumbnail?: string;
  background: string;
  characterPositions: {
    slot: number;
    x: number;
    y: number;
    scale: number;
    flipX: boolean;
    animation: string;
    expression: string;
  }[];
  cameraPreset: keyof typeof CAMERA_ANIMATION_PRESETS | 'static';
  suggestedDuration: number;
  narrationTemplate?: string;
}

// Scene templates
export const SCENE_TEMPLATES: SceneTemplate[] = [
  // Dialogue templates
  {
    id: 'two-characters-talking',
    name: 'Two Characters Talking',
    description: 'Classic dialogue setup with characters facing each other',
    category: 'dialogue',
    background: 'park',
    characterPositions: [
      { slot: 0, x: 30, y: 75, scale: 1, flipX: false, animation: 'talk', expression: 'happy' },
      { slot: 1, x: 70, y: 75, scale: 1, flipX: true, animation: 'idle', expression: 'neutral' },
    ],
    cameraPreset: 'conversation',
    suggestedDuration: 6000,
    narrationTemplate: '[Character 1] said to [Character 2], "..."',
  },
  {
    id: 'over-shoulder-dialogue',
    name: 'Over Shoulder Shot',
    description: 'Intimate dialogue with over-the-shoulder framing',
    category: 'dialogue',
    background: 'bedroom',
    characterPositions: [
      { slot: 0, x: 25, y: 80, scale: 1.2, flipX: false, animation: 'idle', expression: 'neutral' },
      { slot: 1, x: 65, y: 70, scale: 0.9, flipX: true, animation: 'talk', expression: 'happy' },
    ],
    cameraPreset: 'static',
    suggestedDuration: 5000,
  },
  {
    id: 'group-conversation',
    name: 'Group Conversation',
    description: 'Three or more characters in discussion',
    category: 'dialogue',
    background: 'park',
    characterPositions: [
      { slot: 0, x: 20, y: 75, scale: 0.9, flipX: false, animation: 'idle', expression: 'happy' },
      { slot: 1, x: 50, y: 70, scale: 1, flipX: false, animation: 'talk', expression: 'happy' },
      { slot: 2, x: 80, y: 75, scale: 0.9, flipX: true, animation: 'idle', expression: 'neutral' },
    ],
    cameraPreset: 'establishingShot',
    suggestedDuration: 7000,
  },

  // Action templates
  {
    id: 'character-enters',
    name: 'Character Enters',
    description: 'Character walks into the scene from the side',
    category: 'action',
    background: 'meadow',
    characterPositions: [
      { slot: 0, x: 80, y: 75, scale: 1, flipX: true, animation: 'walk', expression: 'happy' },
    ],
    cameraPreset: 'panRightToLeft',
    suggestedDuration: 4000,
    narrationTemplate: '[Character] walked into the [background].',
  },
  {
    id: 'chase-scene',
    name: 'Chase Scene',
    description: 'One character chasing another',
    category: 'action',
    background: 'forest',
    characterPositions: [
      { slot: 0, x: 70, y: 75, scale: 1, flipX: true, animation: 'run', expression: 'surprised' },
      { slot: 1, x: 30, y: 75, scale: 1.1, flipX: true, animation: 'run', expression: 'happy' },
    ],
    cameraPreset: 'shake',
    suggestedDuration: 4000,
  },
  {
    id: 'jumping-celebration',
    name: 'Jumping Celebration',
    description: 'Characters jumping with joy',
    category: 'action',
    background: 'park',
    characterPositions: [
      { slot: 0, x: 35, y: 70, scale: 1, flipX: false, animation: 'jump', expression: 'happy' },
      { slot: 1, x: 65, y: 70, scale: 1, flipX: true, animation: 'jump', expression: 'happy' },
    ],
    cameraPreset: 'focusPull',
    suggestedDuration: 4000,
  },
  {
    id: 'waving-goodbye',
    name: 'Waving Goodbye',
    description: 'Characters waving farewell',
    category: 'action',
    background: 'meadow',
    characterPositions: [
      { slot: 0, x: 30, y: 75, scale: 1, flipX: false, animation: 'wave', expression: 'happy' },
      { slot: 1, x: 75, y: 80, scale: 0.8, flipX: true, animation: 'wave', expression: 'sad' },
    ],
    cameraPreset: 'slowZoomOut',
    suggestedDuration: 5000,
  },

  // Emotion templates
  {
    id: 'sad-moment',
    name: 'Sad Moment',
    description: 'Character feeling sad or disappointed',
    category: 'emotion',
    background: 'bedroom',
    characterPositions: [
      { slot: 0, x: 50, y: 75, scale: 1.1, flipX: false, animation: 'sad', expression: 'sad' },
    ],
    cameraPreset: 'slowZoomIn',
    suggestedDuration: 5000,
    narrationTemplate: '[Character] felt very sad.',
  },
  {
    id: 'surprised-discovery',
    name: 'Surprised Discovery',
    description: 'Character discovers something surprising',
    category: 'emotion',
    background: 'forest',
    characterPositions: [
      { slot: 0, x: 40, y: 75, scale: 1, flipX: false, animation: 'surprised', expression: 'surprised' },
    ],
    cameraPreset: 'dramaticReveal',
    suggestedDuration: 4000,
    narrationTemplate: 'Suddenly, [Character] saw something amazing!',
  },
  {
    id: 'thinking-moment',
    name: 'Thinking Moment',
    description: 'Character deep in thought',
    category: 'emotion',
    background: 'park',
    characterPositions: [
      { slot: 0, x: 50, y: 75, scale: 1, flipX: false, animation: 'think', expression: 'neutral' },
    ],
    cameraPreset: 'focusPull',
    suggestedDuration: 4000,
  },
  {
    id: 'laughing-together',
    name: 'Laughing Together',
    description: 'Characters sharing a laugh',
    category: 'emotion',
    background: 'park',
    characterPositions: [
      { slot: 0, x: 35, y: 75, scale: 1, flipX: false, animation: 'laugh', expression: 'happy' },
      { slot: 1, x: 65, y: 75, scale: 1, flipX: true, animation: 'laugh', expression: 'happy' },
    ],
    cameraPreset: 'focusPull',
    suggestedDuration: 4000,
  },

  // Transition templates
  {
    id: 'time-passes',
    name: 'Time Passes',
    description: 'Scene showing passage of time',
    category: 'transition',
    background: 'night',
    characterPositions: [],
    cameraPreset: 'kenBurns',
    suggestedDuration: 3000,
    narrationTemplate: 'Later that evening...',
  },
  {
    id: 'new-location',
    name: 'New Location',
    description: 'Establishing shot of a new place',
    category: 'transition',
    background: 'beach',
    characterPositions: [],
    cameraPreset: 'establishingShot',
    suggestedDuration: 3000,
    narrationTemplate: 'Meanwhile, at the [background]...',
  },

  // Establishing templates
  {
    id: 'story-opening',
    name: 'Story Opening',
    description: 'Classic "Once upon a time" opening',
    category: 'establishing',
    background: 'meadow',
    characterPositions: [
      { slot: 0, x: 50, y: 75, scale: 0.9, flipX: false, animation: 'idle', expression: 'happy' },
    ],
    cameraPreset: 'establishingShot',
    suggestedDuration: 5000,
    narrationTemplate: 'Once upon a time, there was a [character] named [name].',
  },
  {
    id: 'story-ending',
    name: 'Story Ending',
    description: 'Happy ending with characters together',
    category: 'establishing',
    background: 'meadow',
    characterPositions: [
      { slot: 0, x: 35, y: 75, scale: 1, flipX: false, animation: 'wave', expression: 'happy' },
      { slot: 1, x: 65, y: 75, scale: 1, flipX: true, animation: 'wave', expression: 'happy' },
    ],
    cameraPreset: 'slowZoomOut',
    suggestedDuration: 5000,
    narrationTemplate: 'And they all lived happily ever after. The End!',
  },
  {
    id: 'bedtime-scene',
    name: 'Bedtime Scene',
    description: 'Character going to sleep',
    category: 'establishing',
    background: 'bedroom',
    characterPositions: [
      { slot: 0, x: 50, y: 80, scale: 1, flipX: false, animation: 'sleep', expression: 'neutral' },
    ],
    cameraPreset: 'slowZoomIn',
    suggestedDuration: 5000,
    narrationTemplate: '[Character] yawned and closed their eyes. Goodnight!',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: SceneTemplate['category']): SceneTemplate[] {
  return SCENE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Apply template to create a scene
 */
export function applyTemplate(
  template: SceneTemplate,
  characters: { rigId: string; name: string }[],
  customNarration?: string
): Partial<EditableScene> {
  const sceneCharacters: EditableCharacter[] = template.characterPositions.map((pos, index) => {
    const char = characters[pos.slot] || characters[index] || characters[0];
    if (!char) return null;

    return {
      id: `char-${Date.now()}-${index}`,
      rigId: char.rigId,
      name: char.name,
      x: pos.x,
      y: pos.y,
      scale: pos.scale,
      flipX: pos.flipX,
      animation: pos.animation,
      expression: pos.expression as any,
      isTalking: false,
      zIndex: index,
    };
  }).filter(Boolean) as EditableCharacter[];

  // Generate narration from template
  let narration = customNarration || template.narrationTemplate || '';
  if (template.narrationTemplate && !customNarration) {
    // Replace placeholders
    sceneCharacters.forEach((char, i) => {
      narration = narration.replace(`[Character ${i + 1}]`, char.name);
      narration = narration.replace('[Character]', char.name);
      narration = narration.replace('[character]', char.name.toLowerCase());
      narration = narration.replace('[name]', char.name);
    });
    narration = narration.replace('[background]', template.background);
  }

  return {
    title: template.name,
    background: template.background,
    characters: sceneCharacters,
    narration,
    duration: template.suggestedDuration,
    cameraZoom: 1,
    cameraPanX: 0,
    cameraPanY: 0,
  };
}

/**
 * Get camera keyframes for template
 */
export function getTemplateCameraKeyframes(
  template: SceneTemplate
): CameraKeyframe[] {
  if (template.cameraPreset === 'static') {
    return [createKeyframe(0, 1, 0, 0, 0, 'linear')];
  }

  const presetFn = CAMERA_ANIMATION_PRESETS[template.cameraPreset];
  if (presetFn) {
    return presetFn(template.suggestedDuration);
  }

  return [createKeyframe(0, 1, 0, 0, 0, 'linear')];
}

/**
 * Suggest template based on narration
 */
export function suggestTemplate(narration: string): SceneTemplate | null {
  const text = narration.toLowerCase();

  // Check for dialogue
  if (text.includes('said') || text.includes('asked') || text.includes('replied')) {
    return SCENE_TEMPLATES.find(t => t.id === 'two-characters-talking') || null;
  }

  // Check for action
  if (text.includes('ran') || text.includes('chase')) {
    return SCENE_TEMPLATES.find(t => t.id === 'chase-scene') || null;
  }

  // Check for emotion
  if (text.includes('sad') || text.includes('cry')) {
    return SCENE_TEMPLATES.find(t => t.id === 'sad-moment') || null;
  }

  if (text.includes('surprise') || text.includes('suddenly')) {
    return SCENE_TEMPLATES.find(t => t.id === 'surprised-discovery') || null;
  }

  if (text.includes('happy') || text.includes('laugh')) {
    return SCENE_TEMPLATES.find(t => t.id === 'laughing-together') || null;
  }

  // Check for story structure
  if (text.includes('once upon') || text.includes('one day')) {
    return SCENE_TEMPLATES.find(t => t.id === 'story-opening') || null;
  }

  if (text.includes('the end') || text.includes('happily ever')) {
    return SCENE_TEMPLATES.find(t => t.id === 'story-ending') || null;
  }

  if (text.includes('goodnight') || text.includes('sleep')) {
    return SCENE_TEMPLATES.find(t => t.id === 'bedtime-scene') || null;
  }

  return null;
}
