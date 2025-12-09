// Shared AI types for story generation

export type AITargetAudience = 'toddler' | 'child' | 'family';

export interface AIStoryRequest {
  prompt: string;
  genre?: string;
  characters?: string[];
  sceneCount?: number;
  targetAudience?: AITargetAudience;
}

export type AIExpression = 'happy' | 'sad' | 'surprised' | 'neutral' | 'angry';
export type AIPosition = 'left' | 'center' | 'right';

export interface AIGeneratedCharacter {
  name: string;
  action: string;
  position: AIPosition;
  expression: AIExpression;
}

export interface AIDialogueLine {
  speaker: string;
  text: string;
}

export interface AIGeneratedScene {
  title: string;
  background: string;
  narration: string;
  characters: AIGeneratedCharacter[];
  dialogue?: AIDialogueLine[];
  mood: string;
  duration: number;
}

export type AIProvider = 'gemini' | 'openai' | 'fallback';

export interface AIStoryResponse {
  title: string;
  scenes: AIGeneratedScene[];
  success: boolean;
  error?: string;
  provider: AIProvider;
}
