// Background Music System with procedural generation and presets

export type MusicMood = 
  | 'happy' 
  | 'sad' 
  | 'adventure' 
  | 'mystery' 
  | 'calm' 
  | 'exciting' 
  | 'romantic' 
  | 'scary'
  | 'funny'
  | 'epic';

export interface MusicTrack {
  id: string;
  name: string;
  mood: MusicMood;
  icon: string;
  description: string;
  bpm: number;
  key: string;
  duration: number; // seconds, 0 for looping
  loopable: boolean;
}

// Music track presets
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'happy-day',
    name: 'Happy Day',
    mood: 'happy',
    icon: '☀️',
    description: 'Cheerful and upbeat melody',
    bpm: 120,
    key: 'C',
    duration: 0,
    loopable: true,
  },
  {
    id: 'gentle-breeze',
    name: 'Gentle Breeze',
    mood: 'calm',
    icon: '🍃',
    description: 'Peaceful and relaxing',
    bpm: 70,
    key: 'G',
    duration: 0,
    loopable: true,
  },
  {
    id: 'grand-adventure',
    name: 'Grand Adventure',
    mood: 'adventure',
    icon: '⚔️',
    description: 'Epic journey theme',
    bpm: 140,
    key: 'D',
    duration: 0,
    loopable: true,
  },
  {
    id: 'mysterious-forest',
    name: 'Mysterious Forest',
    mood: 'mystery',
    icon: '🌲',
    description: 'Intriguing and curious',
    bpm: 90,
    key: 'Am',
    duration: 0,
    loopable: true,
  },
  {
    id: 'tearful-goodbye',
    name: 'Tearful Goodbye',
    mood: 'sad',
    icon: '💧',
    description: 'Emotional and touching',
    bpm: 60,
    key: 'Em',
    duration: 0,
    loopable: true,
  },
  {
    id: 'heart-racing',
    name: 'Heart Racing',
    mood: 'exciting',
    icon: '💓',
    description: 'Fast-paced and thrilling',
    bpm: 160,
    key: 'E',
    duration: 0,
    loopable: true,
  },
  {
    id: 'love-story',
    name: 'Love Story',
    mood: 'romantic',
    icon: '💕',
    description: 'Sweet and tender',
    bpm: 80,
    key: 'F',
    duration: 0,
    loopable: true,
  },
  {
    id: 'spooky-night',
    name: 'Spooky Night',
    mood: 'scary',
    icon: '👻',
    description: 'Eerie and suspenseful',
    bpm: 85,
    key: 'Dm',
    duration: 0,
    loopable: true,
  },
  {
    id: 'silly-antics',
    name: 'Silly Antics',
    mood: 'funny',
    icon: '🤡',
    description: 'Playful and comedic',
    bpm: 130,
    key: 'Bb',
    duration: 0,
    loopable: true,
  },
  {
    id: 'final-battle',
    name: 'Final Battle',
    mood: 'epic',
    icon: '🏆',
    description: 'Dramatic and powerful',
    bpm: 150,
    key: 'Cm',
    duration: 0,
    loopable: true,
  },
];

// Note frequencies
const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
};

// Scale patterns
const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
};

// Chord patterns (intervals from root)
const CHORDS: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus4: [0, 5, 7],
  '7': [0, 4, 7, 10],
};

// Procedural music generator
export class MusicGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentNodes: AudioNode[] = [];
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  // Set volume
  setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Play a music track
  async play(trackId: string): Promise<void> {
    const track = MUSIC_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    // Stop current track
    this.stop();

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.isPlaying = true;
    this.currentTrackId = trackId;

    // Generate and play music based on mood
    this.generateMusicForMood(track);
  }

  // Stop playback
  stop(): void {
    this.isPlaying = false;
    this.currentTrackId = null;
    
    for (const node of this.currentNodes) {
      try {
        if (node instanceof OscillatorNode) {
          node.stop();
        }
        node.disconnect();
      } catch (e) {
        // Node may already be stopped
      }
    }
    this.currentNodes = [];
  }

  // Generate music based on mood
  private generateMusicForMood(track: MusicTrack): void {
    const ctx = this.getContext();
    if (!this.masterGain) return;

    const beatDuration = 60 / track.bpm;
    
    // Get scale based on key
    const isMinor = track.key.includes('m');
    const rootNote = track.key.replace('m', '');
    const scale = isMinor ? SCALES.minor : SCALES.major;

    // Generate pattern based on mood
    switch (track.mood) {
      case 'happy':
        this.playHappyPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'sad':
        this.playSadPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'adventure':
        this.playAdventurePattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'calm':
        this.playCalmPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'mystery':
        this.playMysteryPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'exciting':
        this.playExcitingPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'romantic':
        this.playRomanticPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'scary':
        this.playScaryPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'funny':
        this.playFunnyPattern(ctx, beatDuration, rootNote, scale);
        break;
      case 'epic':
        this.playEpicPattern(ctx, beatDuration, rootNote, scale);
        break;
    }
  }

  // Create an oscillator with envelope
  private createNote(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    if (!this.masterGain || !this.isPlaying) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.currentNodes.push(osc, gain);
  }

  // Get frequency for a scale degree
  private getFrequency(root: string, scale: number[], degree: number, octave: number = 4): number {
    const rootFreq = NOTE_FREQUENCIES[`${root}${octave}`] || 261.63;
    const semitones = scale[degree % scale.length] + Math.floor(degree / scale.length) * 12;
    return rootFreq * Math.pow(2, semitones / 12);
  }

  // Happy pattern - bouncy, major key arpeggios
  private playHappyPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 8;
    const pattern = [0, 2, 4, 2, 0, 4, 2, 4];
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      pattern.forEach((degree, i) => {
        this.createNote(ctx, this.getFrequency(root, scale, degree), now + i * beat, beat * 0.8, 'triangle', 0.2);
        // Add harmony
        if (i % 2 === 0) {
          this.createNote(ctx, this.getFrequency(root, scale, degree + 2), now + i * beat, beat * 0.8, 'sine', 0.1);
        }
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Sad pattern - slow, minor key
  private playSadPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 8;
    const pattern = [0, 2, 0, -1, 0, 2, 4, 2];
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      pattern.forEach((degree, i) => {
        this.createNote(ctx, this.getFrequency(root, scale, degree, 3), now + i * beat, beat * 1.5, 'sine', 0.15);
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Adventure pattern - driving rhythm
  private playAdventurePattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 4;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      // Bass
      this.createNote(ctx, this.getFrequency(root, scale, 0, 2), now, beat * 2, 'sawtooth', 0.15);
      this.createNote(ctx, this.getFrequency(root, scale, 4, 2), now + beat * 2, beat * 2, 'sawtooth', 0.15);
      // Melody
      [0, 2, 4, 7].forEach((degree, i) => {
        this.createNote(ctx, this.getFrequency(root, scale, degree, 4), now + i * beat, beat * 0.5, 'square', 0.1);
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Calm pattern - ambient pads
  private playCalmPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 16;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      // Long sustained notes
      this.createNote(ctx, this.getFrequency(root, scale, 0, 3), now, beat * 8, 'sine', 0.1);
      this.createNote(ctx, this.getFrequency(root, scale, 4, 3), now, beat * 8, 'sine', 0.08);
      this.createNote(ctx, this.getFrequency(root, scale, 2, 4), now + beat * 8, beat * 8, 'sine', 0.1);
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Mystery pattern - dissonant, sparse
  private playMysteryPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 8;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      // Sparse, eerie notes
      this.createNote(ctx, this.getFrequency(root, scale, 0, 3), now, beat * 4, 'sine', 0.12);
      this.createNote(ctx, this.getFrequency(root, scale, 6, 4), now + beat * 2, beat * 2, 'triangle', 0.08);
      this.createNote(ctx, this.getFrequency(root, scale, 3, 4), now + beat * 5, beat * 3, 'sine', 0.1);
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Exciting pattern - fast arpeggios
  private playExcitingPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 4;
    const pattern = [0, 2, 4, 7, 4, 2, 0, 2];
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      pattern.forEach((degree, i) => {
        this.createNote(ctx, this.getFrequency(root, scale, degree, 4), now + i * beat * 0.5, beat * 0.4, 'square', 0.12);
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Romantic pattern - gentle, flowing
  private playRomanticPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 8;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      [0, 4, 7, 4, 2, 4, 0, 2].forEach((degree, i) => {
        this.createNote(ctx, this.getFrequency(root, scale, degree, 4), now + i * beat, beat * 1.2, 'sine', 0.15);
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Scary pattern - low drones, dissonance
  private playScaryPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 8;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      // Low drone
      this.createNote(ctx, this.getFrequency(root, scale, 0, 2), now, beat * 8, 'sawtooth', 0.08);
      // Dissonant notes
      this.createNote(ctx, this.getFrequency(root, scale, 1, 4), now + beat * 3, beat * 2, 'sine', 0.06);
      this.createNote(ctx, this.getFrequency(root, scale, 6, 3), now + beat * 5, beat * 3, 'triangle', 0.07);
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Funny pattern - bouncy, quirky
  private playFunnyPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 4;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      // Quirky melody
      [0, 4, 2, 7, 0, 2, 4, 0].forEach((degree, i) => {
        const freq = this.getFrequency(root, scale, degree, 4 + (i % 2));
        this.createNote(ctx, freq, now + i * beat * 0.5, beat * 0.3, 'square', 0.1);
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Epic pattern - powerful, building
  private playEpicPattern(ctx: AudioContext, beat: number, root: string, scale: number[]): void {
    const loopDuration = beat * 8;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      
      const now = ctx.currentTime;
      // Power chords
      [0, 0, 5, 4].forEach((degree, i) => {
        const time = now + i * beat * 2;
        this.createNote(ctx, this.getFrequency(root, scale, degree, 2), time, beat * 1.8, 'sawtooth', 0.12);
        this.createNote(ctx, this.getFrequency(root, scale, degree + 4, 2), time, beat * 1.8, 'sawtooth', 0.1);
        this.createNote(ctx, this.getFrequency(root, scale, degree, 3), time, beat * 1.8, 'square', 0.08);
      });
      
      setTimeout(playLoop, loopDuration * 1000);
    };
    
    playLoop();
  }

  // Get current track
  getCurrentTrack(): MusicTrack | null {
    if (!this.currentTrackId) return null;
    return MUSIC_TRACKS.find(t => t.id === this.currentTrackId) || null;
  }

  // Check if playing
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// Singleton instance
let musicGeneratorInstance: MusicGenerator | null = null;

export function getMusicGenerator(): MusicGenerator {
  if (!musicGeneratorInstance) {
    musicGeneratorInstance = new MusicGenerator();
  }
  return musicGeneratorInstance;
}

// Get tracks by mood
export function getTracksByMood(mood: MusicMood): MusicTrack[] {
  return MUSIC_TRACKS.filter(t => t.mood === mood);
}

// Suggest music based on scene content
export function suggestMusicForScene(narration: string): MusicTrack[] {
  const lowerNarration = narration.toLowerCase();
  const suggestions: MusicTrack[] = [];

  const moodKeywords: Record<MusicMood, string[]> = {
    happy: ['happy', 'joy', 'fun', 'laugh', 'smile', 'celebrate', 'wonderful', 'great'],
    sad: ['sad', 'cry', 'tears', 'miss', 'goodbye', 'sorry', 'alone', 'lost'],
    adventure: ['adventure', 'journey', 'quest', 'explore', 'discover', 'brave', 'hero'],
    mystery: ['mystery', 'secret', 'hidden', 'strange', 'curious', 'wonder', 'puzzle'],
    calm: ['calm', 'peace', 'quiet', 'gentle', 'soft', 'rest', 'sleep', 'dream'],
    exciting: ['exciting', 'fast', 'run', 'chase', 'hurry', 'quick', 'race'],
    romantic: ['love', 'heart', 'together', 'forever', 'beautiful', 'sweet'],
    scary: ['scary', 'dark', 'night', 'afraid', 'fear', 'spooky', 'ghost'],
    funny: ['funny', 'silly', 'joke', 'laugh', 'giggle', 'oops', 'whoops'],
    epic: ['battle', 'fight', 'victory', 'power', 'strong', 'final', 'ultimate'],
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(k => lowerNarration.includes(k))) {
      const tracks = getTracksByMood(mood as MusicMood);
      suggestions.push(...tracks);
    }
  }

  // Default to calm if no matches
  if (suggestions.length === 0) {
    suggestions.push(...getTracksByMood('calm'));
  }

  return suggestions.slice(0, 3);
}
