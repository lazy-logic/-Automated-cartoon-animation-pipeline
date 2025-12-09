// Core Types for Cartoon Studio

export type CharacterId = string;
export type SceneId = string;
export type ProjectId = string;

// Character expressions for lip-sync and emotions
export type Expression = 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry' | 'talking';

// Character definition with skeletal parts
export interface CharacterPart {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  anchorX: number;
  anchorY: number;
  zIndex: number;
}

export interface CharacterTemplate {
  id: CharacterId;
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  skinColor: string;
  category: 'human' | 'animal' | 'fantasy' | 'robot';
  parts: {
    head: CharacterPart;
    body: CharacterPart;
    leftArm: CharacterPart;
    rightArm: CharacterPart;
    leftLeg: CharacterPart;
    rightLeg: CharacterPart;
    face: CharacterPart;
  };
}

export interface CharacterInstance {
  id: string;
  templateId: CharacterId;
  name: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  scale: number;
  flipX: boolean;
  expression: Expression;
  zIndex: number;
}

// Animation keyframe system
export interface Keyframe {
  time: number; // milliseconds
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  expression?: Expression;
  opacity?: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
}

export interface CharacterAnimation {
  characterId: string;
  keyframes: Keyframe[];
}

// Background/Scene templates
export type BackgroundId = string;

export interface BackgroundLayer {
  id: string;
  imageUrl?: string;
  color?: string;
  gradient?: string;
  parallaxSpeed: number; // 0 = static, 1 = full movement
  zIndex: number;
}

export interface BackgroundTemplate {
  id: BackgroundId;
  name: string;
  displayName: string;
  category: 'outdoor' | 'indoor' | 'fantasy' | 'urban';
  layers: BackgroundLayer[];
  groundLevel: number; // Y percentage where characters stand
}

// Scene definition
export interface Scene {
  id: SceneId;
  title: string;
  description: string;
  narration: string;
  backgroundId: BackgroundId;
  characters: CharacterInstance[];
  animations: CharacterAnimation[];
  duration: number; // milliseconds
  transition: 'fade' | 'slide' | 'zoom' | 'none';
  cameraZoom: number;
  cameraPanX: number;
  cameraPanY: number;
}

// Audio
export interface AudioTrack {
  id: string;
  type: 'narration' | 'music' | 'sfx';
  url?: string;
  text?: string; // For TTS narration
  startTime: number;
  duration: number;
  volume: number;
}

// Complete project/story
export interface Project {
  id: ProjectId;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  scenes: Scene[];
  audioTracks: AudioTrack[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  resolution: { width: number; height: number };
  fps: number;
  defaultSceneDuration: number;
  autoNarration: boolean;
  narratorVoice: string;
}

// UI State
export interface EditorState {
  selectedSceneId: SceneId | null;
  selectedCharacterId: string | null;
  isPlaying: boolean;
  currentTime: number;
  zoom: number;
  showGrid: boolean;
  showTimeline: boolean;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSceneIndex: number;
  currentTime: number;
  totalDuration: number;
}

// Export options
export interface ExportOptions {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  resolution: { width: number; height: number };
  fps: number;
  includeAudio: boolean;
}
