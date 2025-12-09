/**
 * Story-to-Animation Pipeline
 * Inspired by Animate-A-Story for retrieval-augmented video generation
 * 
 * This system converts story scripts into animated scenes by:
 * 1. Parsing story structure (scenes, characters, actions)
 * 2. Matching content to available animations and assets
 * 3. Generating camera movements and transitions
 * 4. Synchronizing audio and visual elements
 */

import { EditableScene, EditableCharacter } from '@/components/editors/InteractiveSceneEditor';
import { TransitionType } from '@/components/shared/SceneTransition';
import { CameraState, suggestCameraForScene, DEFAULT_CAMERA_STATE } from './camera-system';
import { MusicMood, analyzeSceneForAudio } from '../audio/auto-sound-generator';
import { MotionCurve, getMotionCurveForAction } from './animation-interpolation';

// Story script structure
export interface StoryScript {
  title: string;
  author?: string;
  genre: StoryGenre;
  targetAudience: 'toddler' | 'child' | 'family' | 'all';
  scenes: SceneScript[];
  globalSettings?: GlobalSettings;
}

export type StoryGenre = 
  | 'adventure'
  | 'friendship'
  | 'learning'
  | 'fantasy'
  | 'comedy'
  | 'bedtime'
  | 'nature';

export interface GlobalSettings {
  defaultTransition: TransitionType;
  musicMood: MusicMood;
  pacing: 'slow' | 'normal' | 'fast';
  colorPalette?: string[];
}

// Scene script structure
export interface SceneScript {
  id: string;
  title: string;
  setting: SceneSetting;
  characters: CharacterDirection[];
  dialogue?: DialogueLine[];
  narration: string;
  action: SceneAction;
  mood: SceneMood;
  duration?: number; // Override auto-calculated duration
  camera?: CameraDirection;
  transition?: TransitionType;
}

export interface SceneSetting {
  location: string;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  weather?: 'clear' | 'cloudy' | 'rain' | 'snow';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface CharacterDirection {
  characterId: string;
  name: string;
  position: 'left' | 'center' | 'right' | 'far-left' | 'far-right';
  action: string;
  expression: string;
  facing?: 'left' | 'right';
  enterFrom?: 'left' | 'right' | 'fade';
  exitTo?: 'left' | 'right' | 'fade';
}

export interface DialogueLine {
  characterId: string;
  text: string;
  emotion?: string;
}

export interface SceneAction {
  type: 'static' | 'movement' | 'interaction' | 'reaction';
  description: string;
  keyMoments?: string[];
}

export type SceneMood = 
  | 'happy'
  | 'sad'
  | 'excited'
  | 'calm'
  | 'tense'
  | 'mysterious'
  | 'playful'
  | 'romantic';

export interface CameraDirection {
  startAngle?: string;
  endAngle?: string;
  movement?: 'static' | 'pan-left' | 'pan-right' | 'zoom-in' | 'zoom-out' | 'follow';
  focusOn?: string; // Character ID to focus on
}

// Animation output
export interface AnimatedScene extends EditableScene {
  cameraSequence: CameraState[];
  soundEvents: any[];
  motionCurves: Record<string, MotionCurve>;
}

// ============================================
// STORY PARSING
// ============================================

// Parse natural language story into structured script
export function parseStoryText(storyText: string): StoryScript {
  const lines = storyText.split('\n').filter(line => line.trim());
  const scenes: SceneScript[] = [];
  let currentScene: Partial<SceneScript> | null = null;
  let sceneIndex = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Detect scene breaks
    if (trimmed.startsWith('Scene') || trimmed.startsWith('SCENE') || trimmed.startsWith('---')) {
      if (currentScene && currentScene.narration) {
        scenes.push(finalizeScene(currentScene as SceneScript, sceneIndex++));
      }
      currentScene = createEmptyScene();
      continue;
    }
    
    // Detect character actions in brackets
    const actionMatch = trimmed.match(/\[([^\]]+)\]/);
    if (actionMatch && currentScene) {
      parseActionDirection(actionMatch[1], currentScene);
      continue;
    }
    
    // Detect dialogue (Character: "text")
    const dialogueMatch = trimmed.match(/^(\w+):\s*"([^"]+)"/);
    if (dialogueMatch && currentScene) {
      if (!currentScene.dialogue) currentScene.dialogue = [];
      currentScene.dialogue.push({
        characterId: dialogueMatch[1].toLowerCase(),
        text: dialogueMatch[2],
      });
      continue;
    }
    
    // Everything else is narration
    if (currentScene) {
      currentScene.narration = (currentScene.narration || '') + ' ' + trimmed;
    }
  }
  
  // Add final scene
  if (currentScene && currentScene.narration) {
    scenes.push(finalizeScene(currentScene as SceneScript, sceneIndex));
  }
  
  return {
    title: extractTitle(storyText) || 'Untitled Story',
    genre: detectGenre(storyText),
    targetAudience: 'child',
    scenes,
  };
}

function createEmptyScene(): Partial<SceneScript> {
  return {
    id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    setting: { location: 'meadow', timeOfDay: 'day' },
    characters: [],
    narration: '',
    action: { type: 'static', description: '' },
    mood: 'happy',
  };
}

function finalizeScene(scene: SceneScript, index: number): SceneScript {
  // Auto-detect setting from narration
  scene.setting = detectSetting(scene.narration);
  
  // Auto-detect mood
  scene.mood = detectMood(scene.narration);
  
  // Set title if not provided
  if (!scene.title) {
    scene.title = `Scene ${index + 1}`;
  }
  
  // Calculate duration based on narration length
  const wordCount = scene.narration.split(' ').length;
  scene.duration = Math.max(4000, wordCount * 300); // ~300ms per word, min 4 seconds
  
  return scene;
}

function parseActionDirection(action: string, scene: Partial<SceneScript>): void {
  const lower = action.toLowerCase();
  
  // Detect character actions
  const actionPatterns = [
    { pattern: /(\w+)\s+walks/, action: 'walk' },
    { pattern: /(\w+)\s+runs/, action: 'run' },
    { pattern: /(\w+)\s+jumps/, action: 'jump' },
    { pattern: /(\w+)\s+waves/, action: 'wave' },
    { pattern: /(\w+)\s+dances/, action: 'dance' },
    { pattern: /(\w+)\s+sits/, action: 'sit' },
    { pattern: /(\w+)\s+talks/, action: 'talk' },
  ];
  
  for (const { pattern, action: actionType } of actionPatterns) {
    const match = lower.match(pattern);
    if (match) {
      if (!scene.characters) scene.characters = [];
      const existingChar = scene.characters.find(c => 
        c.name.toLowerCase() === match[1].toLowerCase()
      );
      if (existingChar) {
        existingChar.action = actionType;
      } else {
        scene.characters.push({
          characterId: match[1].toLowerCase(),
          name: match[1],
          position: scene.characters.length === 0 ? 'left' : 'right',
          action: actionType,
          expression: 'happy',
        });
      }
    }
  }
}

function detectSetting(narration: string): SceneSetting {
  const lower = narration.toLowerCase();
  
  let location = 'meadow';
  if (lower.includes('forest') || lower.includes('woods') || lower.includes('tree')) {
    location = 'forest';
  } else if (lower.includes('beach') || lower.includes('ocean') || lower.includes('sea')) {
    location = 'beach';
  } else if (lower.includes('night') || lower.includes('star') || lower.includes('moon')) {
    location = 'night';
  } else if (lower.includes('bedroom') || lower.includes('room') || lower.includes('bed')) {
    location = 'bedroom';
  } else if (lower.includes('park') || lower.includes('playground')) {
    location = 'park';
  }
  
  let timeOfDay: 'dawn' | 'day' | 'dusk' | 'night' = 'day';
  if (lower.includes('morning') || lower.includes('sunrise') || lower.includes('dawn')) {
    timeOfDay = 'dawn';
  } else if (lower.includes('evening') || lower.includes('sunset') || lower.includes('dusk')) {
    timeOfDay = 'dusk';
  } else if (lower.includes('night') || lower.includes('dark') || lower.includes('moon')) {
    timeOfDay = 'night';
  }
  
  return { location, timeOfDay };
}

function detectMood(narration: string): SceneMood {
  const lower = narration.toLowerCase();
  
  if (lower.includes('sad') || lower.includes('cry') || lower.includes('lonely')) {
    return 'sad';
  }
  if (lower.includes('excit') || lower.includes('amazing') || lower.includes('wow')) {
    return 'excited';
  }
  if (lower.includes('calm') || lower.includes('peaceful') || lower.includes('quiet')) {
    return 'calm';
  }
  if (lower.includes('scary') || lower.includes('danger') || lower.includes('worried')) {
    return 'tense';
  }
  if (lower.includes('mystery') || lower.includes('strange') || lower.includes('curious')) {
    return 'mysterious';
  }
  if (lower.includes('play') || lower.includes('fun') || lower.includes('silly')) {
    return 'playful';
  }
  
  return 'happy';
}

function extractTitle(text: string): string | null {
  const lines = text.split('\n');
  const firstLine = lines[0]?.trim();
  
  if (firstLine && firstLine.length < 50 && !firstLine.includes('.')) {
    return firstLine;
  }
  
  return null;
}

function detectGenre(text: string): StoryGenre {
  const lower = text.toLowerCase();
  
  if (lower.includes('adventure') || lower.includes('quest') || lower.includes('journey')) {
    return 'adventure';
  }
  if (lower.includes('friend') || lower.includes('together') || lower.includes('help')) {
    return 'friendship';
  }
  if (lower.includes('learn') || lower.includes('discover') || lower.includes('teach')) {
    return 'learning';
  }
  if (lower.includes('magic') || lower.includes('wizard') || lower.includes('fairy')) {
    return 'fantasy';
  }
  if (lower.includes('funny') || lower.includes('laugh') || lower.includes('silly')) {
    return 'comedy';
  }
  if (lower.includes('sleep') || lower.includes('dream') || lower.includes('night')) {
    return 'bedtime';
  }
  if (lower.includes('animal') || lower.includes('nature') || lower.includes('forest')) {
    return 'nature';
  }
  
  return 'adventure';
}

// ============================================
// ANIMATION GENERATION
// ============================================

// Convert story script to animated scenes
export function generateAnimatedScenes(script: StoryScript): AnimatedScene[] {
  return script.scenes.map((sceneScript, index) => {
    const scene = convertSceneScriptToEditable(sceneScript, index);
    
    // Generate camera sequence
    const cameraSequence = generateCameraSequence(sceneScript);
    
    // Generate sound events
    const soundEvents = generateSoundEvents(sceneScript);
    
    // Get motion curves for characters
    const motionCurves: Record<string, MotionCurve> = {};
    sceneScript.characters.forEach(char => {
      motionCurves[char.characterId] = getMotionCurveForAction(char.action);
    });
    
    return {
      ...scene,
      cameraSequence,
      soundEvents,
      motionCurves,
    };
  });
}

// Convert scene script to editable scene format
function convertSceneScriptToEditable(
  script: SceneScript,
  index: number
): EditableScene {
  const characters: EditableCharacter[] = script.characters.map((char, i) => {
    const positionMap: Record<string, number> = {
      'far-left': 15,
      'left': 30,
      'center': 50,
      'right': 70,
      'far-right': 85,
    };
    const rigId = mapCharacterNameToRig(char.name);
    const rigIdLower = rigId.toLowerCase();
    
    return {
      id: char.characterId,
      rigId,
      name: char.name,
      x: positionMap[char.position] || 50,
      y: 75,
      scale: 1,
      flipX: char.facing === 'left' || char.position.includes('right'),
      animation: char.action,
      expression: (char.expression || 'happy') as 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry',
      isTalking: false,
      zIndex: i + 1,
      outfitExplorer: rigIdLower === 'kiara',
      propBall: rigIdLower === 'jayden',
    };
  });
  
  // If no characters specified, add default
  if (characters.length === 0) {
    characters.push({
      id: 'default',
      rigId: 'luna',
      name: 'Luna',
      x: 50,
      y: 75,
      scale: 1,
      flipX: false,
      animation: 'idle',
      expression: 'happy',
      isTalking: false,
      zIndex: 1,
    });
  }
  
  return {
    id: script.id,
    title: script.title,
    background: script.setting.location,
    narration: script.narration.trim(),
    characters,
    duration: script.duration || 5000,
    cameraZoom: 1,
    cameraPanX: 0,
    cameraPanY: 0,
  };
}

// Map character names to available rigs
function mapCharacterNameToRig(name: string): string {
  const nameMap: Record<string, string> = {
    'luna': 'luna',
    'max': 'max',
    'emma': 'emma',
    'whiskers': 'whiskers',
    'buddy': 'buddy',
    'cotton': 'cotton',
    'girl': 'luna',
    'boy': 'max',
    'cat': 'whiskers',
    'dog': 'buddy',
    'bunny': 'cotton',
    'rabbit': 'cotton',
  };
  
  return nameMap[name.toLowerCase()] || 'luna';
}

// Generate camera sequence for scene
function generateCameraSequence(script: SceneScript): CameraState[] {
  const sequence: CameraState[] = [];
  const duration = script.duration || 5000;
  
  // Start camera
  const startCamera = suggestCameraForScene(
    script.narration,
    script.characters.length,
    script.characters[0]?.action || 'idle'
  );
  
  sequence.push({
    ...DEFAULT_CAMERA_STATE,
    ...startCamera,
    transitionDuration: 0,
  });
  
  // Add camera movement based on scene action
  if (script.camera?.movement === 'zoom-in') {
    sequence.push({
      ...DEFAULT_CAMERA_STATE,
      zoom: 1.3,
      transitionDuration: duration * 0.8,
    });
  } else if (script.camera?.movement === 'pan-left') {
    sequence.push({
      ...DEFAULT_CAMERA_STATE,
      x: -10,
      transitionDuration: duration * 0.8,
    });
  } else if (script.camera?.movement === 'pan-right') {
    sequence.push({
      ...DEFAULT_CAMERA_STATE,
      x: 10,
      transitionDuration: duration * 0.8,
    });
  }
  
  return sequence;
}

// Generate sound events for scene
function generateSoundEvents(script: SceneScript): any[] {
  const analysis = analyzeSceneForAudio(
    script.setting.location,
    script.characters.map(c => ({
      action: c.action,
      position: c.position === 'left' ? 0.3 : c.position === 'right' ? 0.7 : 0.5,
    })),
    script.narration,
    script.duration || 5000
  );
  
  return analysis.characterSounds;
}

// ============================================
// STORY TEMPLATES
// ============================================

// Pre-built story templates for quick generation
export const STORY_TEMPLATES: Record<string, StoryScript> = {
  adventure: {
    title: "The Great Adventure",
    genre: 'adventure',
    targetAudience: 'child',
    scenes: [
      {
        id: 'intro',
        title: 'A New Day',
        setting: { location: 'meadow', timeOfDay: 'day' },
        characters: [
          { characterId: 'luna', name: 'Luna', position: 'center', action: 'idle', expression: 'happy' }
        ],
        narration: 'One sunny morning, Luna woke up feeling adventurous. Today was going to be special!',
        action: { type: 'static', description: 'Character introduction' },
        mood: 'happy',
        duration: 5000,
      },
      {
        id: 'discovery',
        title: 'The Discovery',
        setting: { location: 'forest', timeOfDay: 'day' },
        characters: [
          { characterId: 'luna', name: 'Luna', position: 'left', action: 'walk', expression: 'surprised' }
        ],
        narration: 'In the magical forest, Luna discovered something amazing hidden behind the old oak tree.',
        action: { type: 'movement', description: 'Walking and discovering' },
        mood: 'excited',
        duration: 6000,
      },
    ],
  },
  
  friendship: {
    title: "Best Friends",
    genre: 'friendship',
    targetAudience: 'child',
    scenes: [
      {
        id: 'meeting',
        title: 'A New Friend',
        setting: { location: 'park', timeOfDay: 'day' },
        characters: [
          { characterId: 'luna', name: 'Luna', position: 'left', action: 'wave', expression: 'happy' },
          { characterId: 'max', name: 'Max', position: 'right', action: 'wave', expression: 'happy' }
        ],
        narration: 'Luna met Max at the park. They both loved playing games!',
        action: { type: 'interaction', description: 'Characters meeting' },
        mood: 'happy',
        duration: 5000,
      },
    ],
  },
};

// Get template by genre
export function getStoryTemplate(genre: StoryGenre): StoryScript | undefined {
  return STORY_TEMPLATES[genre];
}
