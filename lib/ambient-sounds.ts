/**
 * Ambient Sound System
 * Provides background audio for different scene types
 * Uses Web Audio API for seamless looping and crossfading
 */

export type AmbientSoundType = 
  | 'meadow' 
  | 'forest' 
  | 'beach' 
  | 'night' 
  | 'bedroom' 
  | 'park'
  | 'rain'
  | 'wind';

export interface AmbientSoundConfig {
  type: AmbientSoundType;
  volume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

// Sound effect definitions using oscillator-based synthesis
// This avoids needing external audio files
interface SoundDefinition {
  name: string;
  generator: (ctx: AudioContext, destination: AudioNode) => AudioNode[];
}

// Create bird chirp sound
function createBirdChirp(ctx: AudioContext, destination: AudioNode, frequency: number = 2000): AudioNode[] {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + 0.1);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, ctx.currentTime + 0.2);
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  
  oscillator.connect(gainNode);
  gainNode.connect(destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
  
  return [oscillator, gainNode];
}

// Create cricket sound
function createCricketChirp(ctx: AudioContext, destination: AudioNode): AudioNode[] {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(4000, ctx.currentTime);
  
  // Rapid on-off pattern
  const now = ctx.currentTime;
  for (let i = 0; i < 6; i++) {
    gainNode.gain.setValueAtTime(0.03, now + i * 0.05);
    gainNode.gain.setValueAtTime(0, now + i * 0.05 + 0.02);
  }
  
  oscillator.connect(gainNode);
  gainNode.connect(destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.4);
  
  return [oscillator, gainNode];
}

// Create wave sound using filtered noise
function createWaveSound(ctx: AudioContext, destination: AudioNode): AudioNode[] {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate pink noise
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
    b6 = white * 0.115926;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, ctx.currentTime);
  
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  
  // Wave modulation
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
  lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  lfo.start();
  
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(destination);
  source.start();
  
  return [source, filter, gainNode, lfo, lfoGain];
}

// Create wind sound
function createWindSound(ctx: AudioContext, destination: AudioNode): AudioNode[] {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);
  filter.Q.setValueAtTime(0.5, ctx.currentTime);
  
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  
  // Slow modulation for wind gusts
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.05, ctx.currentTime);
  lfoGain.gain.setValueAtTime(0.05, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(gainNode.gain);
  lfo.start();
  
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(destination);
  source.start();
  
  return [source, filter, gainNode, lfo, lfoGain];
}

// Create gentle rain sound
function createRainSound(ctx: AudioContext, destination: AudioNode): AudioNode[] {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(destination);
  source.start();
  
  return [source, filter, gainNode];
}

// Create soft music box tone for bedroom
function createMusicBoxTone(ctx: AudioContext, destination: AudioNode, note: number): AudioNode[] {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(note, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
  
  oscillator.connect(gainNode);
  gainNode.connect(destination);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 2);
  
  return [oscillator, gainNode];
}

// Ambient sound controller class
export class AmbientSoundController {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private intervalIds: NodeJS.Timeout[] = [];
  private currentType: AmbientSoundType | null = null;
  private isPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureContext() {
    if (!this.audioContext || !this.masterGain) {
      this.initAudioContext();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private clearAll() {
    // Clear intervals
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds = [];
    
    // Stop and disconnect nodes
    this.activeNodes.forEach(node => {
      try {
        if (node instanceof AudioScheduledSourceNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) {
        // Node might already be stopped
      }
    });
    this.activeNodes = [];
  }

  setVolume(volume: number) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.audioContext.currentTime + 0.1
      );
    }
  }

  play(type: AmbientSoundType, fadeIn: boolean = true) {
    if (!this.audioContext || !this.masterGain) {
      this.ensureContext();
      if (!this.audioContext || !this.masterGain) return;
    }

    // If same type is already playing, do nothing
    if (this.currentType === type && this.isPlaying) return;

    // Clear previous sounds
    this.clearAll();
    this.currentType = type;
    this.isPlaying = true;

    const ctx = this.audioContext;
    const dest = this.masterGain;

    // Fade in
    if (fadeIn) {
      this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1);
    }

    switch (type) {
      case 'meadow':
      case 'park':
        // Birds chirping randomly
        const birdInterval = setInterval(() => {
          if (this.isPlaying && Math.random() > 0.3) {
            const freq = 1800 + Math.random() * 800;
            createBirdChirp(ctx, dest, freq);
          }
        }, 2000 + Math.random() * 3000);
        this.intervalIds.push(birdInterval);
        
        // Light wind
        const windNodes = createWindSound(ctx, dest);
        this.activeNodes.push(...windNodes);
        break;

      case 'forest':
        // Birds
        const forestBirdInterval = setInterval(() => {
          if (this.isPlaying && Math.random() > 0.5) {
            createBirdChirp(ctx, dest, 1500 + Math.random() * 500);
          }
        }, 3000 + Math.random() * 4000);
        this.intervalIds.push(forestBirdInterval);
        
        // Crickets (more frequent)
        const cricketInterval = setInterval(() => {
          if (this.isPlaying && Math.random() > 0.4) {
            createCricketChirp(ctx, dest);
          }
        }, 1000 + Math.random() * 2000);
        this.intervalIds.push(cricketInterval);
        
        // Rustling leaves (wind)
        const rustleNodes = createWindSound(ctx, dest);
        this.activeNodes.push(...rustleNodes);
        break;

      case 'beach':
        // Waves
        const waveNodes = createWaveSound(ctx, dest);
        this.activeNodes.push(...waveNodes);
        
        // Seagulls occasionally
        const seagullInterval = setInterval(() => {
          if (this.isPlaying && Math.random() > 0.7) {
            createBirdChirp(ctx, dest, 800 + Math.random() * 400);
          }
        }, 5000 + Math.random() * 5000);
        this.intervalIds.push(seagullInterval);
        break;

      case 'night':
        // Crickets
        const nightCricketInterval = setInterval(() => {
          if (this.isPlaying) {
            createCricketChirp(ctx, dest);
          }
        }, 800 + Math.random() * 1500);
        this.intervalIds.push(nightCricketInterval);
        
        // Occasional owl hoot (low frequency bird)
        const owlInterval = setInterval(() => {
          if (this.isPlaying && Math.random() > 0.8) {
            createBirdChirp(ctx, dest, 300 + Math.random() * 100);
          }
        }, 8000 + Math.random() * 7000);
        this.intervalIds.push(owlInterval);
        
        // Gentle wind
        const nightWindNodes = createWindSound(ctx, dest);
        if (nightWindNodes[2] instanceof GainNode) {
          nightWindNodes[2].gain.setValueAtTime(0.03, ctx.currentTime);
        }
        this.activeNodes.push(...nightWindNodes);
        break;

      case 'bedroom':
        // Soft music box melody
        const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00]; // C5 to A5
        let noteIndex = 0;
        const musicBoxInterval = setInterval(() => {
          if (this.isPlaying) {
            const note = notes[noteIndex % notes.length];
            createMusicBoxTone(ctx, dest, note);
            noteIndex++;
          }
        }, 3000);
        this.intervalIds.push(musicBoxInterval);
        
        // Clock ticking (very subtle)
        const tickInterval = setInterval(() => {
          if (this.isPlaying) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
          }
        }, 1000);
        this.intervalIds.push(tickInterval);
        break;

      case 'rain':
        const rainNodes = createRainSound(ctx, dest);
        this.activeNodes.push(...rainNodes);
        break;

      case 'wind':
        const strongWindNodes = createWindSound(ctx, dest);
        if (strongWindNodes[2] instanceof GainNode) {
          strongWindNodes[2].gain.setValueAtTime(0.15, ctx.currentTime);
        }
        this.activeNodes.push(...strongWindNodes);
        break;
    }
  }

  stop(fadeOut: boolean = true) {
    if (!this.audioContext || !this.masterGain) return;

    this.isPlaying = false;
    this.currentType = null;

    if (fadeOut) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
      setTimeout(() => this.clearAll(), 600);
    } else {
      this.clearAll();
    }
  }

  pause() {
    if (this.audioContext?.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentType(): AmbientSoundType | null {
    return this.currentType;
  }
}

// Singleton instance
let ambientController: AmbientSoundController | null = null;

export function getAmbientSoundController(): AmbientSoundController {
  if (!ambientController) {
    ambientController = new AmbientSoundController();
  }
  return ambientController;
}

// React hook for ambient sounds
export function useAmbientSound(
  backgroundType: AmbientSoundType | null,
  enabled: boolean = true,
  volume: number = 0.5
) {
  if (typeof window === 'undefined') return;

  const controller = getAmbientSoundController();

  if (enabled && backgroundType) {
    controller.setVolume(volume);
    controller.play(backgroundType);
  } else {
    controller.stop();
  }

  return controller;
}
