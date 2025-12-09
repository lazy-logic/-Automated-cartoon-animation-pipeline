// Lip Sync System - Sync mouth animations to narration

export type MouthShape = 
  | 'closed'      // M, B, P - lips together
  | 'open'        // A, I - mouth open
  | 'wide'        // E - wide smile
  | 'round'       // O, U - rounded lips
  | 'half'        // neutral, consonants
  | 'smile';      // happy expression

export interface LipSyncFrame {
  time: number;      // ms from start
  shape: MouthShape;
  intensity: number; // 0-1, how open
}

export interface LipSyncData {
  duration: number;
  frames: LipSyncFrame[];
}

// Phoneme to mouth shape mapping
const PHONEME_SHAPES: Record<string, MouthShape> = {
  // Vowels
  'a': 'open',
  'e': 'wide',
  'i': 'wide',
  'o': 'round',
  'u': 'round',
  
  // Consonants
  'b': 'closed',
  'm': 'closed',
  'p': 'closed',
  'f': 'half',
  'v': 'half',
  'th': 'half',
  's': 'half',
  'z': 'half',
  'sh': 'half',
  'ch': 'half',
  'j': 'half',
  'n': 'half',
  'l': 'half',
  'r': 'half',
  't': 'half',
  'd': 'half',
  'k': 'half',
  'g': 'half',
  'w': 'round',
  'y': 'wide',
  'h': 'open',
};

// Simple text-to-phoneme approximation
function textToPhonemes(text: string): string[] {
  const phonemes: string[] = [];
  const lowerText = text.toLowerCase();
  
  let i = 0;
  while (i < lowerText.length) {
    const char = lowerText[i];
    const nextChar = lowerText[i + 1];
    
    // Check for digraphs
    if (char === 't' && nextChar === 'h') {
      phonemes.push('th');
      i += 2;
      continue;
    }
    if (char === 's' && nextChar === 'h') {
      phonemes.push('sh');
      i += 2;
      continue;
    }
    if (char === 'c' && nextChar === 'h') {
      phonemes.push('ch');
      i += 2;
      continue;
    }
    
    // Single characters
    if (/[a-z]/.test(char)) {
      phonemes.push(char);
    } else if (char === ' ') {
      phonemes.push(' ');
    }
    
    i++;
  }
  
  return phonemes;
}

// Generate lip sync data from text
export function generateLipSync(
  text: string,
  duration: number, // total duration in ms
  wordsPerMinute: number = 150
): LipSyncData {
  const phonemes = textToPhonemes(text);
  const frames: LipSyncFrame[] = [];
  
  // Calculate timing
  const wordCount = text.split(/\s+/).length;
  const actualDuration = Math.min(duration, (wordCount / wordsPerMinute) * 60 * 1000);
  const phonemeDuration = actualDuration / phonemes.length;
  
  let currentTime = 0;
  let lastShape: MouthShape = 'closed';
  
  for (const phoneme of phonemes) {
    if (phoneme === ' ') {
      // Brief pause between words
      frames.push({
        time: currentTime,
        shape: 'half',
        intensity: 0.3,
      });
      currentTime += phonemeDuration * 0.5;
      continue;
    }
    
    const shape = PHONEME_SHAPES[phoneme] || 'half';
    const isVowel = 'aeiou'.includes(phoneme);
    
    // Add transition frame if shape changes significantly
    if (shape !== lastShape) {
      frames.push({
        time: currentTime,
        shape,
        intensity: isVowel ? 0.8 : 0.5,
      });
    }
    
    lastShape = shape;
    currentTime += phonemeDuration;
  }
  
  // End with closed mouth
  frames.push({
    time: currentTime,
    shape: 'closed',
    intensity: 0,
  });
  
  return {
    duration: actualDuration,
    frames,
  };
}

// Get mouth shape at a specific time
export function getMouthShapeAtTime(
  lipSyncData: LipSyncData,
  time: number
): { shape: MouthShape; intensity: number } {
  if (lipSyncData.frames.length === 0) {
    return { shape: 'closed', intensity: 0 };
  }
  
  // Find the current frame
  let currentFrame = lipSyncData.frames[0];
  let nextFrame = lipSyncData.frames[1];
  
  for (let i = 0; i < lipSyncData.frames.length - 1; i++) {
    if (lipSyncData.frames[i].time <= time && lipSyncData.frames[i + 1].time > time) {
      currentFrame = lipSyncData.frames[i];
      nextFrame = lipSyncData.frames[i + 1];
      break;
    }
  }
  
  // If past the last frame
  if (time >= lipSyncData.frames[lipSyncData.frames.length - 1].time) {
    return { shape: 'closed', intensity: 0 };
  }
  
  // Interpolate intensity
  const frameProgress = (time - currentFrame.time) / (nextFrame.time - currentFrame.time);
  const intensity = currentFrame.intensity + (nextFrame.intensity - currentFrame.intensity) * frameProgress;
  
  return {
    shape: currentFrame.shape,
    intensity: Math.max(0, Math.min(1, intensity)),
  };
}

// Generate lip sync from audio analysis (simplified)
export function generateLipSyncFromAudio(
  audioBuffer: AudioBuffer,
  sensitivity: number = 0.5
): LipSyncData {
  const frames: LipSyncFrame[] = [];
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const frameRate = 30; // frames per second
  const samplesPerFrame = Math.floor(sampleRate / frameRate);
  
  for (let i = 0; i < data.length; i += samplesPerFrame) {
    // Calculate RMS amplitude for this frame
    let sum = 0;
    const end = Math.min(i + samplesPerFrame, data.length);
    for (let j = i; j < end; j++) {
      sum += data[j] * data[j];
    }
    const rms = Math.sqrt(sum / (end - i));
    
    // Map amplitude to mouth shape
    const intensity = Math.min(1, rms / sensitivity);
    let shape: MouthShape = 'closed';
    
    if (intensity > 0.7) {
      shape = 'open';
    } else if (intensity > 0.5) {
      shape = 'wide';
    } else if (intensity > 0.3) {
      shape = 'half';
    } else if (intensity > 0.1) {
      shape = 'round';
    }
    
    frames.push({
      time: (i / sampleRate) * 1000,
      shape,
      intensity,
    });
  }
  
  return {
    duration: (data.length / sampleRate) * 1000,
    frames,
  };
}

// Mouth shape to CSS/SVG properties
export function mouthShapeToStyle(shape: MouthShape, intensity: number): {
  scaleX: number;
  scaleY: number;
  borderRadius: string;
} {
  const baseIntensity = 0.3 + intensity * 0.7;
  
  switch (shape) {
    case 'closed':
      return {
        scaleX: 1,
        scaleY: 0.1,
        borderRadius: '50%',
      };
    case 'open':
      return {
        scaleX: 0.8 * baseIntensity,
        scaleY: 1 * baseIntensity,
        borderRadius: '50%',
      };
    case 'wide':
      return {
        scaleX: 1.2 * baseIntensity,
        scaleY: 0.5 * baseIntensity,
        borderRadius: '40%',
      };
    case 'round':
      return {
        scaleX: 0.6 * baseIntensity,
        scaleY: 0.8 * baseIntensity,
        borderRadius: '50%',
      };
    case 'half':
      return {
        scaleX: 0.9 * baseIntensity,
        scaleY: 0.4 * baseIntensity,
        borderRadius: '45%',
      };
    case 'smile':
      return {
        scaleX: 1.3,
        scaleY: 0.3,
        borderRadius: '0 0 50% 50%',
      };
    default:
      return {
        scaleX: 1,
        scaleY: 0.3,
        borderRadius: '50%',
      };
  }
}

// Character lip sync manager
export class LipSyncManager {
  private lipSyncData: Map<string, LipSyncData> = new Map();
  private activeCharacters: Map<string, { startTime: number; data: LipSyncData }> = new Map();

  // Pre-generate lip sync for a character's dialogue
  prepareLipSync(characterId: string, text: string, duration: number): void {
    const data = generateLipSync(text, duration);
    this.lipSyncData.set(characterId, data);
  }

  // Start lip sync for a character
  startLipSync(characterId: string): void {
    const data = this.lipSyncData.get(characterId);
    if (data) {
      this.activeCharacters.set(characterId, {
        startTime: Date.now(),
        data,
      });
    }
  }

  // Stop lip sync for a character
  stopLipSync(characterId: string): void {
    this.activeCharacters.delete(characterId);
  }

  // Get current mouth shape for a character
  getCurrentMouthShape(characterId: string): { shape: MouthShape; intensity: number } {
    const active = this.activeCharacters.get(characterId);
    if (!active) {
      return { shape: 'closed', intensity: 0 };
    }

    const elapsed = Date.now() - active.startTime;
    return getMouthShapeAtTime(active.data, elapsed);
  }

  // Check if character is currently talking
  isTalking(characterId: string): boolean {
    const active = this.activeCharacters.get(characterId);
    if (!active) return false;
    
    const elapsed = Date.now() - active.startTime;
    return elapsed < active.data.duration;
  }

  // Clear all lip sync data
  clear(): void {
    this.lipSyncData.clear();
    this.activeCharacters.clear();
  }
}

// Singleton instance
let lipSyncManagerInstance: LipSyncManager | null = null;

export function getLipSyncManager(): LipSyncManager {
  if (!lipSyncManagerInstance) {
    lipSyncManagerInstance = new LipSyncManager();
  }
  return lipSyncManagerInstance;
}
