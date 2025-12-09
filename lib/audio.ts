// Audio system for narration and sound effects

export interface NarrationState {
  isPlaying: boolean;
  isSpeaking: boolean;
  currentText: string;
}

let speechSynthesis: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Initialize speech synthesis
export function initAudio(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
    return true;
  }
  return false;
}

// Get available voices
export function getVoices(): SpeechSynthesisVoice[] {
  if (!speechSynthesis) return [];
  return speechSynthesis.getVoices();
}

// Speak text with narration
export function speak(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onWord?: (charIndex: number) => void;
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    // Cancel any ongoing speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    // Set voice if specified
    if (options.voice) {
      const voices = getVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      if (event.error !== 'interrupted') {
        reject(new Error(event.error));
      } else {
        resolve();
      }
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' && options.onWord) {
        options.onWord(event.charIndex);
      }
    };

    currentUtterance = utterance;
    speechSynthesis.speak(utterance);
  });
}

// Stop current speech
export function stopSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
  currentUtterance = null;
}

// Pause speech
export function pauseSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.pause();
  }
}

// Resume speech
export function resumeSpeaking(): void {
  if (speechSynthesis) {
    speechSynthesis.resume();
  }
}

// Check if currently speaking
export function isSpeaking(): boolean {
  return speechSynthesis?.speaking ?? false;
}

// Lip sync helper - returns mouth openness based on phoneme timing
export function getLipSyncValue(time: number, duration: number): number {
  // Simple oscillation for mouth movement during speech
  const frequency = 8; // Hz
  const phase = (time / 1000) * frequency * Math.PI * 2;
  const base = Math.sin(phase) * 0.5 + 0.5;
  
  // Add some variation
  const variation = Math.sin(phase * 1.7) * 0.2;
  
  return Math.max(0, Math.min(1, base + variation));
}

// Audio context for sound effects (if needed later)
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Play a simple beep sound effect
export function playBeep(frequency: number = 440, duration: number = 100): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
}
