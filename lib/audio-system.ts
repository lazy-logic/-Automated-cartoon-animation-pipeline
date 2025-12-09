// Audio System - Handles narration, dialogue, and lip-sync

import { MouthShape } from './keyframe-animation';

// Phoneme to mouth shape mapping
const PHONEME_TO_MOUTH: Record<string, MouthShape> = {
  // Vowels
  'a': 'wide',
  'e': 'ee',
  'i': 'ee',
  'o': 'oh',
  'u': 'oh',
  // Consonants that show teeth
  'f': 'ee',
  'v': 'ee',
  's': 'ee',
  'z': 'ee',
  'th': 'ee',
  // Lip consonants
  'b': 'closed',
  'p': 'closed',
  'm': 'closed',
  // Open mouth consonants
  'l': 'open',
  'n': 'open',
  'd': 'open',
  't': 'open',
  'r': 'open',
  // Wide mouth
  'w': 'oh',
  'y': 'ee',
  'k': 'open',
  'g': 'open',
  'h': 'open',
  'j': 'open',
  'ch': 'open',
  'sh': 'open',
};

// Simple phoneme extraction from text
function extractPhonemes(text: string): string[] {
  const phonemes: string[] = [];
  const lowerText = text.toLowerCase();
  
  let i = 0;
  while (i < lowerText.length) {
    const char = lowerText[i];
    const nextChar = lowerText[i + 1];
    
    // Check for digraphs
    if (nextChar) {
      const digraph = char + nextChar;
      if (digraph === 'th' || digraph === 'ch' || digraph === 'sh') {
        phonemes.push(digraph);
        i += 2;
        continue;
      }
    }
    
    // Single character
    if (/[a-z]/.test(char)) {
      phonemes.push(char);
    } else if (char === ' ' || char === ',' || char === '.') {
      phonemes.push('pause');
    }
    
    i++;
  }
  
  return phonemes;
}

// Generate lip-sync data from text
export interface LipSyncFrame {
  time: number;
  mouthShape: MouthShape;
  duration: number;
}

export interface LipSyncData {
  frames: LipSyncFrame[];
  totalDuration: number;
}

export function generateLipSync(
  text: string,
  speechRate: number = 0.9,
  wordsPerMinute: number = 150
): LipSyncData {
  const phonemes = extractPhonemes(text);
  const frames: LipSyncFrame[] = [];
  
  // Calculate timing based on speech rate
  const basePhonemeLength = (60 / wordsPerMinute / 4) * 1000 / speechRate; // ms per phoneme
  const pauseLength = basePhonemeLength * 2;
  
  let currentTime = 0;
  
  for (const phoneme of phonemes) {
    if (phoneme === 'pause') {
      frames.push({
        time: currentTime,
        mouthShape: 'closed',
        duration: pauseLength,
      });
      currentTime += pauseLength;
    } else {
      const mouthShape = PHONEME_TO_MOUTH[phoneme] || 'open';
      frames.push({
        time: currentTime,
        mouthShape,
        duration: basePhonemeLength,
      });
      currentTime += basePhonemeLength;
    }
  }
  
  // Add closing frame
  frames.push({
    time: currentTime,
    mouthShape: 'closed',
    duration: 100,
  });
  
  return {
    frames,
    totalDuration: currentTime + 100,
  };
}

// Get mouth shape at a specific time
export function getMouthShapeAtTime(lipSync: LipSyncData, time: number): MouthShape {
  for (let i = lipSync.frames.length - 1; i >= 0; i--) {
    if (time >= lipSync.frames[i].time) {
      return lipSync.frames[i].mouthShape;
    }
  }
  return 'closed';
}

// Audio controller for managing speech synthesis
export class AudioController {
  private utterance: SpeechSynthesisUtterance | null = null;
  private lipSyncData: LipSyncData | null = null;
  private startTime: number = 0;
  private isPlaying: boolean = false;
  private onMouthShapeChange: ((shape: MouthShape) => void) | null = null;
  private animationFrame: number | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  
  constructor() {
    // Load voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectBestVoice();
      };
      this.selectBestVoice();
    }
  }
  
  private selectBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer natural-sounding voices
    this.selectedVoice = voices.find(v => 
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Daniel') ||
      v.name.includes('Google') ||
      (v.lang.startsWith('en') && v.localService)
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }
  
  speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onMouthShapeChange?: (shape: MouthShape) => void;
    } = {}
  ): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not available');
      return;
    }
    
    // Cancel any existing speech
    this.stop();
    
    const {
      rate = 0.9,
      pitch = 1.1,
      volume = 0.8,
      onStart,
      onEnd,
      onMouthShapeChange,
    } = options;
    
    // Generate lip sync data
    this.lipSyncData = generateLipSync(text, rate);
    this.onMouthShapeChange = onMouthShapeChange || null;
    
    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.rate = rate;
    this.utterance.pitch = pitch;
    this.utterance.volume = volume;
    
    if (this.selectedVoice) {
      this.utterance.voice = this.selectedVoice;
    }
    
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.startTime = performance.now();
      this.startLipSyncAnimation();
      onStart?.();
    };
    
    this.utterance.onend = () => {
      this.isPlaying = false;
      this.stopLipSyncAnimation();
      this.onMouthShapeChange?.('closed');
      onEnd?.();
    };
    
    this.utterance.onerror = () => {
      this.isPlaying = false;
      this.stopLipSyncAnimation();
      this.onMouthShapeChange?.('closed');
    };
    
    window.speechSynthesis.speak(this.utterance);
  }
  
  private startLipSyncAnimation() {
    const animate = () => {
      if (!this.isPlaying || !this.lipSyncData) return;
      
      const elapsed = performance.now() - this.startTime;
      const mouthShape = getMouthShapeAtTime(this.lipSyncData, elapsed);
      this.onMouthShapeChange?.(mouthShape);
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  private stopLipSyncAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.stopLipSyncAnimation();
    this.onMouthShapeChange?.('closed');
  }
  
  pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this.isPlaying = false;
    this.stopLipSyncAnimation();
  }
  
  resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.isPlaying = true;
      this.startLipSyncAnimation();
    }
  }
  
  get playing(): boolean {
    return this.isPlaying;
  }
}

// Singleton audio controller
let audioController: AudioController | null = null;

export function getAudioController(): AudioController {
  if (!audioController) {
    audioController = new AudioController();
  }
  return audioController;
}

// Dialogue system for character conversations
export interface DialogueLine {
  characterId: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';
  delay?: number; // Delay before this line starts (ms)
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
}

export class DialoguePlayer {
  private audioController: AudioController;
  private currentLineIndex: number = 0;
  private sequence: DialogueSequence | null = null;
  private onLineStart: ((line: DialogueLine, index: number) => void) | null = null;
  private onLineEnd: ((line: DialogueLine, index: number) => void) | null = null;
  private onSequenceEnd: (() => void) | null = null;
  private onMouthShapeChange: ((characterId: string, shape: MouthShape) => void) | null = null;
  
  constructor() {
    this.audioController = getAudioController();
  }
  
  play(
    sequence: DialogueSequence,
    callbacks: {
      onLineStart?: (line: DialogueLine, index: number) => void;
      onLineEnd?: (line: DialogueLine, index: number) => void;
      onSequenceEnd?: () => void;
      onMouthShapeChange?: (characterId: string, shape: MouthShape) => void;
    } = {}
  ): void {
    this.sequence = sequence;
    this.currentLineIndex = 0;
    this.onLineStart = callbacks.onLineStart || null;
    this.onLineEnd = callbacks.onLineEnd || null;
    this.onSequenceEnd = callbacks.onSequenceEnd || null;
    this.onMouthShapeChange = callbacks.onMouthShapeChange || null;
    
    this.playNextLine();
  }
  
  private playNextLine(): void {
    if (!this.sequence || this.currentLineIndex >= this.sequence.lines.length) {
      this.onSequenceEnd?.();
      return;
    }
    
    const line = this.sequence.lines[this.currentLineIndex];
    const delay = line.delay || 0;
    
    setTimeout(() => {
      this.onLineStart?.(line, this.currentLineIndex);
      
      this.audioController.speak(line.text, {
        onMouthShapeChange: (shape) => {
          this.onMouthShapeChange?.(line.characterId, shape);
        },
        onEnd: () => {
          this.onLineEnd?.(line, this.currentLineIndex);
          this.currentLineIndex++;
          
          // Small pause between lines
          setTimeout(() => this.playNextLine(), 300);
        },
      });
    }, delay);
  }
  
  stop(): void {
    this.audioController.stop();
    this.sequence = null;
    this.currentLineIndex = 0;
  }
}

// Create dialogue from narration text
export function createNarrationDialogue(
  narration: string,
  characterIds: string[]
): DialogueSequence {
  // Split narration into sentences
  const sentences = narration.match(/[^.!?]+[.!?]+/g) || [narration];
  
  const lines: DialogueLine[] = sentences.map((sentence, index) => ({
    characterId: characterIds[index % characterIds.length] || 'narrator',
    text: sentence.trim(),
    emotion: 'neutral',
    delay: index === 0 ? 500 : 200,
  }));
  
  return {
    id: `dialogue-${Date.now()}`,
    lines,
  };
}
