// Story Animator - Converts story scenes to animated sequences with proper animations

import { CharacterRig, CHARACTER_RIGS, getCharacterRig } from '../utils/sprite-system';
import { AnimationClip, ANIMATION_PRESETS, getAnimationForAction } from './keyframe-animation';
import { EditableCharacter, EditableScene } from '@/components/editors/InteractiveSceneEditor';
import type { AIGeneratedScene } from '../ai/ai-types';

// Story scene from generator
export interface StoryScene {
  title: string;
  description?: string;
  narration: string;
  background: string;
  characters: {
    name: string;
    position: string;
    expression: string;
    action: string;
  }[];
  duration?: number;
  dialogue?: {
    speaker: string;
    text: string;
  }[];
}

// Action to animation mapping with context
const ACTION_ANIMATION_MAP: Record<string, {
  animation: string;
  expression: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';
}> = {
  // Movement actions
  'idle': { animation: 'idle', expression: 'neutral' },
  'stand': { animation: 'idle', expression: 'neutral' },
  'walk': { animation: 'walk', expression: 'neutral' },
  'run': { animation: 'walk', expression: 'happy' },
  'jump': { animation: 'jump', expression: 'happy' },
  'sit': { animation: 'sit', expression: 'neutral' },
  
  // Interaction actions
  'wave': { animation: 'wave', expression: 'happy' },
  'talk': { animation: 'talk', expression: 'neutral' },
  'dance': { animation: 'dance', expression: 'happy' },
  'play': { animation: 'dance', expression: 'happy' },
  
  // Emotional actions
  'happy': { animation: 'idle', expression: 'happy' },
  'sad': { animation: 'sad', expression: 'sad' },
  'surprised': { animation: 'surprised', expression: 'surprised' },
  'angry': { animation: 'idle', expression: 'angry' },
  'excited': { animation: 'jump', expression: 'happy' },
  'scared': { animation: 'surprised', expression: 'surprised' },
  'thinking': { animation: 'idle', expression: 'neutral' },
  'sleeping': { animation: 'sit', expression: 'neutral' },
  
  // Story-specific actions
  'explore': { animation: 'walk', expression: 'happy' },
  'discover': { animation: 'surprised', expression: 'surprised' },
  'celebrate': { animation: 'dance', expression: 'happy' },
  'greet': { animation: 'wave', expression: 'happy' },
  'listen': { animation: 'idle', expression: 'neutral' },
  'help': { animation: 'wave', expression: 'happy' },
  'share': { animation: 'wave', expression: 'happy' },
  'learn': { animation: 'idle', expression: 'happy' },
};

// Position mapping
const POSITION_MAP: Record<string, { x: number; y: number; flipX: boolean }> = {
  'left': { x: 25, y: 75, flipX: false },
  'center': { x: 50, y: 75, flipX: false },
  'right': { x: 75, y: 75, flipX: true },
  'far-left': { x: 15, y: 75, flipX: false },
  'far-right': { x: 85, y: 75, flipX: true },
};

// Expression mapping
const EXPRESSION_MAP: Record<string, 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry'> = {
  'neutral': 'neutral',
  'happy': 'happy',
  'sad': 'sad',
  'surprised': 'surprised',
  'angry': 'angry',
  'excited': 'happy',
  'scared': 'surprised',
  'worried': 'sad',
  'curious': 'surprised',
  'proud': 'happy',
  'shy': 'neutral',
  'sleepy': 'neutral',
};

// Find best matching character rig for a name
function findCharacterRig(name: string): CharacterRig | undefined {
  const lowerName = name.toLowerCase();
  
  // Direct match
  let rig = getCharacterRig(lowerName);
  if (rig) return rig;
  
  // Try to match by name similarity
  rig = CHARACTER_RIGS.find(r => 
    r.name.toLowerCase().includes(lowerName) ||
    lowerName.includes(r.name.toLowerCase())
  );
  if (rig) return rig;
  
  // Default based on common names
  const nameDefaults: Record<string, string> = {
    'kiara': 'kiara',
    'jayden': 'jayden',
    'luna': 'luna',
    'max': 'max',
    'emma': 'emma',
    'whiskers': 'whiskers',
    'buddy': 'buddy',
    'cotton': 'cotton',
    'cat': 'whiskers',
    'dog': 'buddy',
    'bunny': 'cotton',
    'rabbit': 'cotton',
    'girl': 'kiara',
    'boy': 'jayden',
    'kid': 'kiara',
    'child': 'kiara',
  };
  
  for (const [key, rigId] of Object.entries(nameDefaults)) {
    if (lowerName.includes(key)) {
      return getCharacterRig(rigId);
    }
  }
  
  // Return first human character as default
  return CHARACTER_RIGS.find(r => r.category === 'child') || CHARACTER_RIGS[0];
}

// Convert story scene to editable scene
export function storySceneToEditableScene(
  storyScene: StoryScene,
  sceneIndex: number
): EditableScene {
  const characters: EditableCharacter[] = storyScene.characters.map((char, index) => {
    const rig = findCharacterRig(char.name);
    const position = POSITION_MAP[char.position] || POSITION_MAP.center;
    const actionMapping = ACTION_ANIMATION_MAP[char.action.toLowerCase()] || ACTION_ANIMATION_MAP.idle;
    const expression = EXPRESSION_MAP[char.expression.toLowerCase()] || actionMapping.expression;
    const rigId = (rig?.id || 'kiara').toLowerCase();
    
    return {
      id: `char-${sceneIndex}-${index}-${Date.now()}`,
      rigId: rig?.id || 'kiara',
      name: char.name,
      x: position.x,
      y: position.y,
      scale: 1,
      flipX: position.flipX,
      animation: actionMapping.animation,
      expression,
      isTalking: false,
      zIndex: index,
      outfitExplorer: rigId === 'kiara',
      propBall: rigId === 'jayden',
    };
  });
  
  return {
    id: `scene-${sceneIndex}-${Date.now()}`,
    title: storyScene.title,
    narration: storyScene.narration,
    background: storyScene.background,
    characters,
    duration: storyScene.duration || 6000,
    cameraZoom: 1,
    cameraPanX: 0,
    cameraPanY: 0,
    dialogue: storyScene.dialogue,
  };
}

// Convert full story to editable scenes
export function storyToEditableScenes(
  story: { title: string; theme: string; scenes: StoryScene[] }
): EditableScene[] {
  return story.scenes.map((scene, index) => storySceneToEditableScene(scene, index));
}

// Convert a single AI-generated scene to an editable scene, preserving basic camera from an optional base scene
export function aiSceneToEditableScene(
  aiScene: AIGeneratedScene,
  sceneIndex: number,
  baseScene?: EditableScene
): EditableScene {
  const storyScene: StoryScene = {
    title: aiScene.title,
    description: undefined,
    narration: aiScene.narration,
    background: aiScene.background,
    characters: aiScene.characters.map((char) => ({
      name: char.name,
      position: char.position,
      expression: char.expression,
      action: char.action,
    })),
    duration: aiScene.duration,
    dialogue: aiScene.dialogue?.map((line) => ({
      speaker: line.speaker,
      text: line.text,
    })),
  };

  const editable = storySceneToEditableScene(storyScene, sceneIndex);

  if (baseScene) {
    return {
      ...editable,
      id: baseScene.id,
      cameraZoom: baseScene.cameraZoom,
      cameraPanX: baseScene.cameraPanX,
      cameraPanY: baseScene.cameraPanY,
    };
  }

  return editable;
}

// Analyze narration to determine character actions
export function analyzeNarrationForActions(narration: string): {
  suggestedAction: string;
  suggestedExpression: string;
  isTalking: boolean;
}[] {
  const actions: { suggestedAction: string; suggestedExpression: string; isTalking: boolean }[] = [];
  const lowerNarration = narration.toLowerCase();
  
  // Action keywords
  const actionKeywords: Record<string, string> = {
    'walk': 'walk',
    'run': 'walk',
    'jump': 'jump',
    'wave': 'wave',
    'dance': 'dance',
    'sit': 'sit',
    'play': 'dance',
    'explore': 'walk',
    'discover': 'surprised',
    'found': 'surprised',
    'said': 'talk',
    'asked': 'talk',
    'replied': 'talk',
    'exclaimed': 'talk',
    'whispered': 'talk',
    'shouted': 'talk',
    'laughed': 'dance',
    'smiled': 'idle',
    'cried': 'sad',
    'hugged': 'wave',
  };
  
  // Expression keywords
  const expressionKeywords: Record<string, string> = {
    'happy': 'happy',
    'excited': 'happy',
    'joy': 'happy',
    'glad': 'happy',
    'delighted': 'happy',
    'sad': 'sad',
    'unhappy': 'sad',
    'upset': 'sad',
    'disappointed': 'sad',
    'surprised': 'surprised',
    'amazed': 'surprised',
    'shocked': 'surprised',
    'wow': 'surprised',
    'angry': 'angry',
    'mad': 'angry',
    'furious': 'angry',
    'scared': 'surprised',
    'afraid': 'surprised',
    'worried': 'sad',
  };
  
  let suggestedAction = 'idle';
  let suggestedExpression = 'neutral';
  let isTalking = false;
  
  // Check for action keywords
  for (const [keyword, action] of Object.entries(actionKeywords)) {
    if (lowerNarration.includes(keyword)) {
      suggestedAction = action;
      if (action === 'talk') {
        isTalking = true;
      }
      break;
    }
  }
  
  // Check for expression keywords
  for (const [keyword, expression] of Object.entries(expressionKeywords)) {
    if (lowerNarration.includes(keyword)) {
      suggestedExpression = expression;
      break;
    }
  }
  
  // Check for dialogue (quoted text)
  if (narration.includes('"') || narration.includes("'")) {
    isTalking = true;
    if (suggestedAction === 'idle') {
      suggestedAction = 'talk';
    }
  }
  
  actions.push({ suggestedAction, suggestedExpression, isTalking });
  
  return actions;
}

// Auto-enhance scene based on narration analysis
export function autoEnhanceScene(scene: EditableScene): EditableScene {
  const analysis = analyzeNarrationForActions(scene.narration);
  
  if (analysis.length === 0 || scene.characters.length === 0) {
    return scene;
  }
  
  const suggestion = analysis[0];
  
  // Update characters based on analysis
  const enhancedCharacters = scene.characters.map((char, index) => {
    // First character gets the main action
    if (index === 0) {
      return {
        ...char,
        animation: suggestion.suggestedAction,
        expression: suggestion.suggestedExpression as any,
        isTalking: suggestion.isTalking,
      };
    }
    
    // Other characters react
    return {
      ...char,
      animation: suggestion.isTalking ? 'idle' : char.animation,
      expression: suggestion.suggestedExpression === 'happy' ? 'happy' : char.expression,
    };
  });
  
  return {
    ...scene,
    characters: enhancedCharacters,
  };
}

// Generate transition animation between scenes
export interface SceneTransition {
  type: 'fade' | 'slide' | 'zoom' | 'wipe';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export function generateTransition(
  fromScene: EditableScene,
  toScene: EditableScene
): SceneTransition {
  // Same background = simple fade
  if (fromScene.background === toScene.background) {
    return { type: 'fade', duration: 500 };
  }
  
  // Night to day or vice versa = slow fade
  if (
    (fromScene.background === 'night' && toScene.background !== 'night') ||
    (fromScene.background !== 'night' && toScene.background === 'night')
  ) {
    return { type: 'fade', duration: 1000 };
  }
  
  // Indoor to outdoor = slide
  if (
    (fromScene.background === 'bedroom' && toScene.background !== 'bedroom') ||
    (fromScene.background !== 'bedroom' && toScene.background === 'bedroom')
  ) {
    return { type: 'slide', duration: 600, direction: 'left' };
  }
  
  // Default
  return { type: 'fade', duration: 500 };
}

// Calculate optimal scene duration based on narration length
export function calculateSceneDuration(narration: string, minDuration: number = 4000): number {
  // Average reading speed: ~150 words per minute
  // Average speaking speed: ~130 words per minute
  const words = narration.split(/\s+/).length;
  const speakingTime = (words / 130) * 60 * 1000; // Convert to ms
  
  // Add buffer for animations and transitions
  const buffer = 2000;
  
  return Math.max(minDuration, speakingTime + buffer);
}

// Apply calculated durations to all scenes
export function applyAutoDurations(scenes: EditableScene[]): EditableScene[] {
  return scenes.map(scene => ({
    ...scene,
    duration: calculateSceneDuration(scene.narration),
  }));
}
