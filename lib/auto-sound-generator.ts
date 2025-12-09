/**
 * Auto Sound Generator
 * Inspired by Diff-Foley for synchronized video-to-audio synthesis
 * 
 * Generates appropriate sound effects and music based on:
 * - Scene content (background, characters, actions)
 * - Mood and atmosphere
 * - Timing and synchronization with animations
 */

// Sound event types
export type SoundEventType = 
  | 'footstep'
  | 'jump'
  | 'land'
  | 'whoosh'
  | 'pop'
  | 'splash'
  | 'rustle'
  | 'wind'
  | 'bird'
  | 'cricket'
  | 'wave'
  | 'bell'
  | 'chime'
  | 'laugh'
  | 'gasp'
  | 'applause'
  | 'magic'
  | 'heartbeat'
  | 'clock'
  | 'door'
  | 'bounce';

// Sound event with timing
export interface SoundEvent {
  type: SoundEventType;
  time: number;        // When to play (ms)
  duration: number;    // How long (ms)
  volume: number;      // 0-1
  pitch?: number;      // Pitch multiplier (1 = normal)
  pan?: number;        // -1 (left) to 1 (right)
}

// Background music mood
export type MusicMood = 
  | 'happy'
  | 'adventurous'
  | 'calm'
  | 'mysterious'
  | 'sad'
  | 'exciting'
  | 'magical'
  | 'playful';

// Music configuration
export interface MusicConfig {
  mood: MusicMood;
  tempo: number;       // BPM
  key: string;         // Musical key
  intensity: number;   // 0-1
}

// Scene analysis result
export interface SceneAudioAnalysis {
  backgroundSounds: SoundEventType[];
  characterSounds: SoundEvent[];
  suggestedMood: MusicMood;
  suggestedTempo: number;
}

// ============================================
// SCENE ANALYSIS
// ============================================

// Analyze scene content to determine appropriate sounds
export function analyzeSceneForAudio(
  background: string,
  characters: { action: string; position: number }[],
  narration: string,
  duration: number
): SceneAudioAnalysis {
  const backgroundSounds = getBackgroundSounds(background);
  const characterSounds = getCharacterSounds(characters, duration);
  const { mood, tempo } = analyzeMoodFromNarration(narration, background);
  
  return {
    backgroundSounds,
    characterSounds,
    suggestedMood: mood,
    suggestedTempo: tempo,
  };
}

// Get ambient sounds based on background
function getBackgroundSounds(background: string): SoundEventType[] {
  const soundMap: Record<string, SoundEventType[]> = {
    meadow: ['bird', 'wind', 'rustle'],
    forest: ['bird', 'rustle', 'wind', 'cricket'],
    beach: ['wave', 'wind', 'bird'],
    night: ['cricket', 'wind'],
    bedroom: ['clock'],
    park: ['bird', 'wind', 'rustle'],
  };
  
  return soundMap[background] || ['wind'];
}

// Generate sound events for character actions
function getCharacterSounds(
  characters: { action: string; position: number }[],
  duration: number
): SoundEvent[] {
  const events: SoundEvent[] = [];
  
  characters.forEach((char, index) => {
    const pan = char.position < 0.5 ? -0.5 : 0.5;
    
    switch (char.action) {
      case 'walk':
        // Generate footstep sounds
        const stepInterval = 400; // ms between steps
        const stepCount = Math.floor(duration / stepInterval);
        for (let i = 0; i < stepCount; i++) {
          events.push({
            type: 'footstep',
            time: i * stepInterval + (index * 100), // Offset for multiple characters
            duration: 100,
            volume: 0.3,
            pitch: 0.9 + Math.random() * 0.2,
            pan,
          });
        }
        break;
        
      case 'run':
        // Faster footsteps
        const runInterval = 250;
        const runSteps = Math.floor(duration / runInterval);
        for (let i = 0; i < runSteps; i++) {
          events.push({
            type: 'footstep',
            time: i * runInterval + (index * 50),
            duration: 80,
            volume: 0.4,
            pitch: 1.1 + Math.random() * 0.2,
            pan,
          });
        }
        break;
        
      case 'jump':
        events.push({
          type: 'whoosh',
          time: 200,
          duration: 300,
          volume: 0.5,
          pitch: 1.2,
          pan,
        });
        events.push({
          type: 'land',
          time: 600,
          duration: 150,
          volume: 0.6,
          pan,
        });
        break;
        
      case 'wave':
        events.push({
          type: 'whoosh',
          time: 100,
          duration: 200,
          volume: 0.2,
          pitch: 1.5,
          pan,
        });
        break;
        
      case 'dance':
        // Rhythmic sounds
        const beatInterval = 500;
        const beats = Math.floor(duration / beatInterval);
        for (let i = 0; i < beats; i++) {
          events.push({
            type: 'pop',
            time: i * beatInterval,
            duration: 100,
            volume: 0.3,
            pitch: 1 + (i % 2) * 0.2,
            pan,
          });
        }
        break;
        
      case 'surprised':
        events.push({
          type: 'gasp',
          time: 100,
          duration: 300,
          volume: 0.5,
          pan,
        });
        break;
        
      case 'talk':
        // Subtle mouth sounds handled by TTS
        break;
    }
  });
  
  return events;
}

// Analyze narration text for mood
function analyzeMoodFromNarration(
  narration: string,
  background: string
): { mood: MusicMood; tempo: number } {
  const text = narration.toLowerCase();
  
  // Keyword-based mood detection
  if (text.includes('adventure') || text.includes('explore') || text.includes('discover')) {
    return { mood: 'adventurous', tempo: 120 };
  }
  if (text.includes('magic') || text.includes('wonder') || text.includes('sparkle')) {
    return { mood: 'magical', tempo: 90 };
  }
  if (text.includes('sad') || text.includes('lonely') || text.includes('miss')) {
    return { mood: 'sad', tempo: 60 };
  }
  if (text.includes('exciting') || text.includes('fast') || text.includes('run')) {
    return { mood: 'exciting', tempo: 140 };
  }
  if (text.includes('play') || text.includes('fun') || text.includes('laugh')) {
    return { mood: 'playful', tempo: 110 };
  }
  if (text.includes('mystery') || text.includes('strange') || text.includes('secret')) {
    return { mood: 'mysterious', tempo: 70 };
  }
  if (text.includes('sleep') || text.includes('dream') || text.includes('peaceful')) {
    return { mood: 'calm', tempo: 60 };
  }
  
  // Background-based defaults
  const bgMoods: Record<string, { mood: MusicMood; tempo: number }> = {
    meadow: { mood: 'happy', tempo: 100 },
    forest: { mood: 'adventurous', tempo: 90 },
    beach: { mood: 'calm', tempo: 80 },
    night: { mood: 'calm', tempo: 60 },
    bedroom: { mood: 'calm', tempo: 50 },
    park: { mood: 'playful', tempo: 100 },
  };
  
  return bgMoods[background] || { mood: 'happy', tempo: 100 };
}

// ============================================
// SOUND SYNTHESIS (Web Audio API)
// ============================================

export class SoundSynthesizer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.5;
    }
  }
  
  // Play a synthesized sound effect
  playSound(event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const startTime = now + event.time / 1000;
    const duration = event.duration / 1000;
    
    switch (event.type) {
      case 'footstep':
        this.playFootstep(startTime, duration, event);
        break;
      case 'jump':
      case 'whoosh':
        this.playWhoosh(startTime, duration, event);
        break;
      case 'land':
        this.playImpact(startTime, duration, event);
        break;
      case 'pop':
        this.playPop(startTime, duration, event);
        break;
      case 'bird':
        this.playBirdChirp(startTime, duration, event);
        break;
      case 'cricket':
        this.playCricket(startTime, duration, event);
        break;
      case 'wave':
        this.playWave(startTime, duration, event);
        break;
      case 'wind':
        this.playWind(startTime, duration, event);
        break;
      case 'magic':
        this.playMagic(startTime, duration, event);
        break;
      case 'chime':
        this.playChime(startTime, duration, event);
        break;
    }
  }
  
  private playFootstep(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'triangle';
    osc.frequency.value = 80 * (event.pitch || 1);
    
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(event.volume * 0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
  
  private playWhoosh(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const envelope = Math.sin(t * Math.PI);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000 * (event.pitch || 1);
    filter.Q.value = 0.5;
    
    const gain = ctx.createGain();
    gain.gain.value = event.volume;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(startTime);
  }
  
  private playImpact(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(50, startTime + duration);
    
    gain.gain.setValueAtTime(event.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
  
  private playPop(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 * (event.pitch || 1), startTime);
    osc.frequency.exponentialRampToValueAtTime(200, startTime + duration);
    
    gain.gain.setValueAtTime(event.volume * 0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
  
  private playBirdChirp(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const baseFreq = 2000 + Math.random() * 1000;
    osc.frequency.setValueAtTime(baseFreq, startTime);
    osc.frequency.setValueAtTime(baseFreq * 1.2, startTime + duration * 0.3);
    osc.frequency.setValueAtTime(baseFreq * 0.9, startTime + duration * 0.6);
    osc.frequency.setValueAtTime(baseFreq * 1.1, startTime + duration);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(event.volume * 0.3, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(event.volume * 0.2, startTime + duration * 0.5);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
  
  private playCricket(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 4000 + Math.random() * 500;
    
    // Rapid on-off pattern
    const pulseRate = 30;
    for (let i = 0; i < duration * pulseRate; i++) {
      const t = startTime + i / pulseRate;
      gain.gain.setValueAtTime(i % 2 === 0 ? event.volume * 0.1 : 0, t);
    }
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
  
  private playWave(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      const envelope = Math.sin(t / duration * Math.PI);
      const noise = Math.random() * 2 - 1;
      data[i] = noise * envelope * 0.2;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    const gain = ctx.createGain();
    gain.gain.value = event.volume;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(startTime);
  }
  
  private playWind(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.3;
    
    const gain = ctx.createGain();
    gain.gain.value = event.volume * 0.3;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    source.start(startTime);
  }
  
  private playMagic(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    
    // Multiple oscillators for sparkle effect
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      const freq = 800 + i * 200 + Math.random() * 100;
      osc.frequency.setValueAtTime(freq, startTime + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, startTime + duration);
      
      gain.gain.setValueAtTime(0, startTime + i * 0.05);
      gain.gain.linearRampToValueAtTime(event.volume * 0.2, startTime + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start(startTime + i * 0.05);
      osc.stop(startTime + duration);
    }
  }
  
  private playChime(startTime: number, duration: number, event: SoundEvent): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const ctx = this.audioContext;
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq * (event.pitch || 1);
      
      gain.gain.setValueAtTime(0, startTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(event.volume * 0.3, startTime + i * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      if (this.masterGain) {
        gain.connect(this.masterGain);
      }
      
      osc.start(startTime + i * 0.1);
      osc.stop(startTime + duration);
    });
  }
  
  // Set master volume
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  // Resume audio context (required after user interaction)
  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
  
  // Clean up
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

// ============================================
// AUTO SOUND GENERATION
// ============================================

// Generate all sounds for a scene
export function generateSceneSounds(
  background: string,
  characters: { action: string; position: number }[],
  narration: string,
  duration: number
): SoundEvent[] {
  const analysis = analyzeSceneForAudio(background, characters, narration, duration);
  const events: SoundEvent[] = [];
  
  // Add character action sounds
  events.push(...analysis.characterSounds);
  
  // Add ambient background sounds
  analysis.backgroundSounds.forEach(soundType => {
    // Scatter ambient sounds throughout the scene
    const count = Math.floor(duration / 2000) + 1;
    for (let i = 0; i < count; i++) {
      events.push({
        type: soundType,
        time: (i / count) * duration + Math.random() * 500,
        duration: 500 + Math.random() * 500,
        volume: 0.2 + Math.random() * 0.1,
        pan: Math.random() * 2 - 1,
      });
    }
  });
  
  return events;
}

// Singleton synthesizer
let synthesizerInstance: SoundSynthesizer | null = null;

export function getSoundSynthesizer(): SoundSynthesizer {
  if (!synthesizerInstance) {
    synthesizerInstance = new SoundSynthesizer();
  }
  return synthesizerInstance;
}
