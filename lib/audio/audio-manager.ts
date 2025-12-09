/**
 * Audio Manager - Centralized audio control for the animation pipeline
 * Handles narration TTS, background music, SFX, and volume mixing
 */

import { AudioController, getAudioController, generateLipSync, LipSyncData } from './audio-system';
import { AmbientSoundController, getAmbientSoundController } from './ambient-sounds';

export interface AudioSettings {
  masterVolume: number;
  narrationVolume: number;
  musicVolume: number;
  sfxVolume: number;
  autoNarration: boolean;
  narratorVoice: string | null;
}

export interface SceneAudioConfig {
  narration: string;
  mood: 'happy' | 'sad' | 'exciting' | 'calm' | 'mysterious' | 'neutral';
  background: string;
  dialogue?: { speaker: string; text: string }[];
}

// Mood to music style mapping
const MOOD_MUSIC_CONFIG: Record<string, { tempo: number; key: string; style: string }> = {
  happy: { tempo: 120, key: 'major', style: 'upbeat' },
  sad: { tempo: 60, key: 'minor', style: 'slow' },
  exciting: { tempo: 140, key: 'major', style: 'energetic' },
  calm: { tempo: 70, key: 'major', style: 'gentle' },
  mysterious: { tempo: 80, key: 'minor', style: 'ambient' },
  neutral: { tempo: 90, key: 'major', style: 'light' },
};

// Background to ambient sound mapping
const BACKGROUND_AMBIENT: Record<string, string> = {
  meadow: 'meadow',
  forest: 'forest',
  beach: 'beach',
  night: 'night',
  park: 'park',
  bedroom: 'bedroom',
};

// Action keywords to SFX mapping
const ACTION_SFX: Record<string, string> = {
  jump: 'boing',
  walk: 'footsteps',
  run: 'footsteps_fast',
  laugh: 'giggle',
  cry: 'sob',
  wave: 'whoosh',
  dance: 'music_note',
  eat: 'munch',
  sleep: 'snore',
  surprise: 'gasp',
  clap: 'clap',
  splash: 'splash',
};

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private narrationGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  private audioController: AudioController;
  private ambientController: AmbientSoundController | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private currentMood: string = 'neutral';
  
  private settings: AudioSettings = {
    masterVolume: 0.8,
    narrationVolume: 1.0,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    autoNarration: true,
    narratorVoice: null,
  };

  constructor() {
    this.audioController = getAudioController();
  }

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new AudioContext();
    
    // Create gain nodes for mixing
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.settings.masterVolume;
    this.masterGain.connect(this.audioContext.destination);

    this.narrationGain = this.audioContext.createGain();
    this.narrationGain.gain.value = this.settings.narrationVolume;
    this.narrationGain.connect(this.masterGain);

    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = this.settings.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.value = this.settings.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    // Initialize ambient sound controller
    this.ambientController = getAmbientSoundController();
  }

  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
    if (this.narrationGain) {
      this.narrationGain.gain.value = this.settings.narrationVolume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicVolume;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.sfxVolume;
    }
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // Play narration with lip-sync data
  async playNarration(
    text: string,
    onMouthShapeChange?: (shape: string) => void,
    onComplete?: () => void
  ): Promise<LipSyncData> {
    if (!this.settings.autoNarration) {
      onComplete?.();
      return { frames: [], totalDuration: 0 };
    }

    const lipSyncData = generateLipSync(text);

    this.audioController.speak(text, {
      rate: 0.9,
      pitch: 1.1,
      volume: this.settings.narrationVolume * this.settings.masterVolume,
      onMouthShapeChange: onMouthShapeChange as any,
      onEnd: onComplete,
    });

    return lipSyncData;
  }

  stopNarration(): void {
    this.audioController.stop();
  }

  // Play background music based on mood
  async playMoodMusic(mood: string): Promise<void> {
    if (!this.audioContext || !this.musicGain) {
      await this.initialize();
    }

    // Stop current music
    this.stopMusic();

    this.currentMood = mood;
    const config = MOOD_MUSIC_CONFIG[mood] || MOOD_MUSIC_CONFIG.neutral;

    // Generate simple procedural music
    this.generateProceduralMusic(config);
  }

  private generateProceduralMusic(config: { tempo: number; key: string; style: string }): void {
    if (!this.audioContext || !this.musicGain) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Base frequencies for major/minor keys
    const majorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
    const minorScale = [261.63, 293.66, 311.13, 349.23, 392.00, 415.30, 466.16];
    const scale = config.key === 'minor' ? minorScale : majorScale;

    // Create a simple melody pattern
    const beatDuration = 60 / config.tempo;
    const patternLength = 8;

    // Pad/drone for atmosphere
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = 'sine';
    padOsc.frequency.value = scale[0] / 2; // Root note, one octave down
    padGain.gain.value = 0.1;
    padOsc.connect(padGain);
    padGain.connect(this.musicGain);
    padOsc.start(now);
    this.musicOscillators.push(padOsc);

    // Simple arpeggio pattern
    for (let i = 0; i < patternLength * 4; i++) {
      const noteIndex = [0, 2, 4, 2][i % 4]; // Simple pattern
      const freq = scale[noteIndex];
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = config.style === 'upbeat' ? 'square' : 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + i * beatDuration * 0.5;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + beatDuration * 0.4);
      
      osc.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start(startTime);
      osc.stop(startTime + beatDuration * 0.5);
    }
  }

  stopMusic(): void {
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.musicOscillators = [];
  }

  // Play ambient sounds based on background
  async playAmbientSound(background: string): Promise<void> {
    const ambientType = BACKGROUND_AMBIENT[background] || 'meadow';
    
    if (this.ambientController) {
      this.ambientController.setVolume(this.settings.sfxVolume * this.settings.masterVolume * 0.5);
      this.ambientController.play(ambientType as any, true); // fadeIn = true
    }
  }

  stopAmbientSound(): void {
    if (this.ambientController) {
      this.ambientController.stop(true); // fadeOut = true
    }
  }

  // Play sound effect for action
  playSFX(action: string): void {
    if (!this.audioContext || !this.sfxGain) return;

    const sfxType = ACTION_SFX[action.toLowerCase()];
    if (!sfxType) return;

    this.generateSFX(sfxType);
  }

  private generateSFX(type: string): void {
    if (!this.audioContext || !this.sfxGain) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    switch (type) {
      case 'boing': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'footsteps':
      case 'footsteps_fast': {
        const count = type === 'footsteps_fast' ? 4 : 2;
        const interval = type === 'footsteps_fast' ? 0.15 : 0.3;
        for (let i = 0; i < count; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = 100 + Math.random() * 50;
          gain.gain.setValueAtTime(0.2, now + i * interval);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * interval + 0.1);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * interval);
          osc.stop(now + i * interval + 0.15);
        }
        break;
      }
      case 'giggle': {
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400 + i * 100, now + i * 0.15);
          osc.frequency.exponentialRampToValueAtTime(600 + i * 100, now + i * 0.15 + 0.1);
          gain.gain.setValueAtTime(0.15, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.12);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.15);
        }
        break;
      }
      case 'whoosh': {
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        const gain = ctx.createGain();
        gain.gain.value = 0.3;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start(now);
        break;
      }
      case 'splash': {
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const env = Math.exp(-i / (ctx.sampleRate * 0.1));
          data[i] = (Math.random() * 2 - 1) * env;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.value = 0.4;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start(now);
        break;
      }
      default: {
        // Generic beep for unknown SFX
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    }
  }

  // Configure audio for a scene
  async configureForScene(config: SceneAudioConfig): Promise<void> {
    await this.initialize();

    // Set up ambient sound based on background
    await this.playAmbientSound(config.background);

    // Set up mood music
    await this.playMoodMusic(config.mood || 'neutral');
  }

  // Stop all audio
  stopAll(): void {
    this.stopNarration();
    this.stopMusic();
    this.stopAmbientSound();
  }

  // Cleanup
  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

// Detect action keywords in narration for SFX triggers
export function detectActionsForSFX(narration: string): string[] {
  const actions: string[] = [];
  const lowerNarration = narration.toLowerCase();
  
  for (const action of Object.keys(ACTION_SFX)) {
    if (lowerNarration.includes(action)) {
      actions.push(action);
    }
  }
  
  return actions;
}

// Detect mood from narration text
export function detectMoodFromNarration(narration: string): string {
  const lowerNarration = narration.toLowerCase();
  
  const happyWords = ['happy', 'joy', 'laugh', 'smile', 'fun', 'play', 'excited', 'wonderful', 'great'];
  const sadWords = ['sad', 'cry', 'tears', 'lonely', 'miss', 'sorry', 'upset'];
  const excitingWords = ['adventure', 'discover', 'explore', 'amazing', 'incredible', 'wow', 'surprise'];
  const calmWords = ['peaceful', 'quiet', 'gentle', 'soft', 'sleep', 'rest', 'calm'];
  const mysteriousWords = ['mystery', 'secret', 'hidden', 'strange', 'wonder', 'magic'];

  let maxScore = 0;
  let detectedMood = 'neutral';

  const moods = [
    { name: 'happy', words: happyWords },
    { name: 'sad', words: sadWords },
    { name: 'exciting', words: excitingWords },
    { name: 'calm', words: calmWords },
    { name: 'mysterious', words: mysteriousWords },
  ];

  for (const mood of moods) {
    const score = mood.words.filter(word => lowerNarration.includes(word)).length;
    if (score > maxScore) {
      maxScore = score;
      detectedMood = mood.name;
    }
  }

  return detectedMood;
}
