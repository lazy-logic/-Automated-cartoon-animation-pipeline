// Sound Effects Library

export type SoundCategory = 
  | 'ui' 
  | 'action' 
  | 'emotion' 
  | 'nature' 
  | 'magic' 
  | 'comedy' 
  | 'transition'
  | 'ambient';

export interface SoundEffect {
  id: string;
  name: string;
  category: SoundCategory;
  icon: string;
  duration: number; // ms
  url?: string; // URL to audio file
  generator?: () => AudioBuffer; // Procedural generation
  tags: string[];
}

// Web Audio API sound generator
class SoundGenerator {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a simple beep/tone
  generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
          break;
        case 'triangle':
          sample = Math.abs(2 * (t * frequency - Math.floor(0.5 + t * frequency))) * 2 - 1;
          break;
      }

      // Apply envelope
      const attack = 0.01;
      const release = 0.1;
      let envelope = 1;
      if (t < attack) {
        envelope = t / attack;
      } else if (t > duration - release) {
        envelope = (duration - t) / release;
      }

      data[i] = sample * envelope * 0.5;
    }

    return buffer;
  }

  // Generate a "pop" sound
  generatePop(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 0.1;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 400 * Math.exp(-t * 30);
      const sample = Math.sin(2 * Math.PI * frequency * t);
      const envelope = Math.exp(-t * 20);
      data[i] = sample * envelope * 0.7;
    }

    return buffer;
  }

  // Generate a "whoosh" sound
  generateWhoosh(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 0.4;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      // Filtered noise with frequency sweep
      const noise = Math.random() * 2 - 1;
      const envelope = Math.sin(Math.PI * t / duration);
      const filterFreq = 200 + 2000 * Math.sin(Math.PI * t / duration);
      data[i] = noise * envelope * 0.3 * (filterFreq / 2200);
    }

    return buffer;
  }

  // Generate a "ding" sound
  generateDing(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 0.8;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const frequencies = [880, 1320, 1760]; // A5, E6, A6

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (const freq of frequencies) {
        sample += Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 4);
      }

      data[i] = sample / frequencies.length * 0.5;
    }

    return buffer;
  }

  // Generate a "boing" sound
  generateBoing(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 0.5;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + 300 * Math.sin(t * 20) * Math.exp(-t * 5);
      const sample = Math.sin(2 * Math.PI * frequency * t);
      const envelope = Math.exp(-t * 3);
      data[i] = sample * envelope * 0.6;
    }

    return buffer;
  }

  // Generate a "sparkle" sound
  generateSparkle(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 0.6;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const notes = [1200, 1500, 1800, 2100, 2400];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (let n = 0; n < notes.length; n++) {
        const noteStart = n * 0.08;
        if (t >= noteStart) {
          const noteT = t - noteStart;
          sample += Math.sin(2 * Math.PI * notes[n] * noteT) * Math.exp(-noteT * 8);
        }
      }

      data[i] = sample / notes.length * 0.4;
    }

    return buffer;
  }

  // Generate a "sad trombone" sound
  generateSadTrombone(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 1.5;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const notes = [
      { freq: 311, start: 0, dur: 0.3 },
      { freq: 293, start: 0.35, dur: 0.3 },
      { freq: 277, start: 0.7, dur: 0.3 },
      { freq: 261, start: 1.05, dur: 0.45 },
    ];

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (const note of notes) {
        if (t >= note.start && t < note.start + note.dur) {
          const noteT = t - note.start;
          const envelope = Math.sin(Math.PI * noteT / note.dur);
          sample += Math.sin(2 * Math.PI * note.freq * noteT) * envelope;
        }
      }

      data[i] = sample * 0.4;
    }

    return buffer;
  }

  // Generate footstep sound
  generateFootstep(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 0.15;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const envelope = Math.exp(-t * 30);
      const lowFreq = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 20);
      data[i] = (noise * 0.3 + lowFreq * 0.7) * envelope * 0.5;
    }

    return buffer;
  }

  // Generate laugh sound (simplified)
  generateLaugh(): AudioBuffer {
    const ctx = this.getContext();
    const duration = 1.0;
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const haCount = 5;
    const haDuration = duration / haCount;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const haIndex = Math.floor(t / haDuration);
      const haT = (t % haDuration) / haDuration;
      
      const freq = 300 + haIndex * 20;
      const sample = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.sin(Math.PI * haT) * (1 - haIndex * 0.15);
      
      data[i] = sample * Math.max(0, envelope) * 0.4;
    }

    return buffer;
  }
}

// Sound effect definitions
export const SOUND_EFFECTS: SoundEffect[] = [
  // UI Sounds
  { id: 'click', name: 'Click', category: 'ui', icon: '👆', duration: 50, tags: ['button', 'tap'] },
  { id: 'pop', name: 'Pop', category: 'ui', icon: '💥', duration: 100, tags: ['bubble', 'appear'] },
  { id: 'ding', name: 'Ding', category: 'ui', icon: '🔔', duration: 800, tags: ['notification', 'success'] },
  { id: 'whoosh', name: 'Whoosh', category: 'ui', icon: '💨', duration: 400, tags: ['swipe', 'transition'] },
  
  // Action Sounds
  { id: 'footstep', name: 'Footstep', category: 'action', icon: '👣', duration: 150, tags: ['walk', 'step'] },
  { id: 'jump', name: 'Jump', category: 'action', icon: '🦘', duration: 300, tags: ['hop', 'bounce'] },
  { id: 'boing', name: 'Boing', category: 'action', icon: '🏀', duration: 500, tags: ['bounce', 'spring'] },
  { id: 'splash', name: 'Splash', category: 'action', icon: '💦', duration: 600, tags: ['water', 'dive'] },
  { id: 'crash', name: 'Crash', category: 'action', icon: '💥', duration: 500, tags: ['impact', 'collision'] },
  { id: 'slide', name: 'Slide', category: 'action', icon: '🛝', duration: 400, tags: ['slip', 'glide'] },
  
  // Emotion Sounds
  { id: 'laugh', name: 'Laugh', category: 'emotion', icon: '😂', duration: 1000, tags: ['happy', 'funny'] },
  { id: 'gasp', name: 'Gasp', category: 'emotion', icon: '😮', duration: 400, tags: ['surprise', 'shock'] },
  { id: 'cry', name: 'Cry', category: 'emotion', icon: '😢', duration: 800, tags: ['sad', 'tears'] },
  { id: 'cheer', name: 'Cheer', category: 'emotion', icon: '🎉', duration: 1200, tags: ['celebration', 'happy'] },
  { id: 'sigh', name: 'Sigh', category: 'emotion', icon: '😔', duration: 600, tags: ['tired', 'relief'] },
  { id: 'hmm', name: 'Hmm', category: 'emotion', icon: '🤔', duration: 500, tags: ['thinking', 'curious'] },
  
  // Nature Sounds
  { id: 'bird', name: 'Bird Chirp', category: 'nature', icon: '🐦', duration: 800, tags: ['tweet', 'morning'] },
  { id: 'wind', name: 'Wind', category: 'nature', icon: '🌬️', duration: 2000, tags: ['breeze', 'gust'] },
  { id: 'thunder', name: 'Thunder', category: 'nature', icon: '⛈️', duration: 1500, tags: ['storm', 'lightning'] },
  { id: 'rain', name: 'Rain', category: 'nature', icon: '🌧️', duration: 3000, tags: ['drizzle', 'storm'] },
  { id: 'ocean', name: 'Ocean Waves', category: 'nature', icon: '🌊', duration: 3000, tags: ['beach', 'sea'] },
  { id: 'crickets', name: 'Crickets', category: 'nature', icon: '🦗', duration: 2000, tags: ['night', 'summer'] },
  
  // Magic Sounds
  { id: 'sparkle', name: 'Sparkle', category: 'magic', icon: '✨', duration: 600, tags: ['magic', 'shine'] },
  { id: 'spell', name: 'Magic Spell', category: 'magic', icon: '🪄', duration: 1000, tags: ['cast', 'enchant'] },
  { id: 'transform', name: 'Transform', category: 'magic', icon: '🔮', duration: 800, tags: ['change', 'morph'] },
  { id: 'teleport', name: 'Teleport', category: 'magic', icon: '🌀', duration: 500, tags: ['disappear', 'appear'] },
  { id: 'powerup', name: 'Power Up', category: 'magic', icon: '⚡', duration: 700, tags: ['boost', 'energy'] },
  
  // Comedy Sounds
  { id: 'bonk', name: 'Bonk', category: 'comedy', icon: '🔨', duration: 200, tags: ['hit', 'bump'] },
  { id: 'slip', name: 'Slip', category: 'comedy', icon: '🍌', duration: 400, tags: ['fall', 'banana'] },
  { id: 'sadtrombone', name: 'Sad Trombone', category: 'comedy', icon: '🎺', duration: 1500, tags: ['fail', 'womp'] },
  { id: 'rimshot', name: 'Rim Shot', category: 'comedy', icon: '🥁', duration: 500, tags: ['joke', 'punchline'] },
  { id: 'cartoon-run', name: 'Cartoon Run', category: 'comedy', icon: '🏃', duration: 600, tags: ['scurry', 'flee'] },
  
  // Transition Sounds
  { id: 'swipe', name: 'Swipe', category: 'transition', icon: '👋', duration: 300, tags: ['page', 'slide'] },
  { id: 'reveal', name: 'Reveal', category: 'transition', icon: '🎭', duration: 500, tags: ['show', 'unveil'] },
  { id: 'fade', name: 'Fade', category: 'transition', icon: '🌅', duration: 600, tags: ['dissolve', 'blend'] },
  { id: 'zoom', name: 'Zoom', category: 'transition', icon: '🔍', duration: 400, tags: ['focus', 'camera'] },
];

// Sound effect player
export class SoundEffectPlayer {
  private audioContext: AudioContext | null = null;
  private generator: SoundGenerator;
  private loadedBuffers: Map<string, AudioBuffer> = new Map();
  private masterVolume: number = 0.8;

  constructor() {
    this.generator = new SoundGenerator();
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Set master volume
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Play a sound effect by ID
  async play(soundId: string, volume: number = 1): Promise<void> {
    const ctx = this.getContext();
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    let buffer = this.loadedBuffers.get(soundId);
    
    if (!buffer) {
      buffer = this.generateSound(soundId);
      if (buffer) {
        this.loadedBuffers.set(soundId, buffer);
      }
    }

    if (!buffer) {
      console.warn(`Sound effect not found: ${soundId}`);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
  }

  // Generate sound buffer
  private generateSound(soundId: string): AudioBuffer | undefined {
    switch (soundId) {
      case 'pop':
        return this.generator.generatePop();
      case 'whoosh':
      case 'swipe':
        return this.generator.generateWhoosh();
      case 'ding':
        return this.generator.generateDing();
      case 'boing':
      case 'jump':
        return this.generator.generateBoing();
      case 'sparkle':
      case 'spell':
        return this.generator.generateSparkle();
      case 'sadtrombone':
        return this.generator.generateSadTrombone();
      case 'footstep':
        return this.generator.generateFootstep();
      case 'laugh':
        return this.generator.generateLaugh();
      case 'click':
        return this.generator.generateTone(800, 0.05, 'square');
      case 'gasp':
        return this.generator.generateTone(400, 0.4, 'sine');
      default:
        // Generate a default tone
        return this.generator.generateTone(440, 0.3, 'sine');
    }
  }

  // Preload sounds
  preload(soundIds: string[]): void {
    for (const id of soundIds) {
      if (!this.loadedBuffers.has(id)) {
        const buffer = this.generateSound(id);
        if (buffer) {
          this.loadedBuffers.set(id, buffer);
        }
      }
    }
  }
}

// Singleton instance
let soundPlayerInstance: SoundEffectPlayer | null = null;

export function getSoundEffectPlayer(): SoundEffectPlayer {
  if (!soundPlayerInstance) {
    soundPlayerInstance = new SoundEffectPlayer();
  }
  return soundPlayerInstance;
}

// Get sounds by category
export function getSoundsByCategory(category: SoundCategory): SoundEffect[] {
  return SOUND_EFFECTS.filter(s => s.category === category);
}

// Search sounds by tag
export function searchSounds(query: string): SoundEffect[] {
  const lowerQuery = query.toLowerCase();
  return SOUND_EFFECTS.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) ||
    s.tags.some(t => t.includes(lowerQuery))
  );
}
