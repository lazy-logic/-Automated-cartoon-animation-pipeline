/**
 * Cloud TTS Integration
 * Supports ElevenLabs, Google Cloud TTS, and browser fallback
 */

export type TTSProvider = 'elevenlabs' | 'google' | 'browser';

export interface TTSVoice {
  id: string;
  name: string;
  provider: TTSProvider;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  style?: string;
}

export interface TTSOptions {
  voice?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // 0.5 - 2.0
  volume?: number; // 0 - 1
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm';
}

export interface TTSResult {
  audioUrl: string;
  duration: number;
  provider: TTSProvider;
}

// Available voices
export const TTS_VOICES: TTSVoice[] = [
  // ElevenLabs voices
  { id: 'rachel', name: 'Rachel (Narrator)', provider: 'elevenlabs', language: 'en', gender: 'female', style: 'narrative' },
  { id: 'domi', name: 'Domi (Young)', provider: 'elevenlabs', language: 'en', gender: 'female', style: 'young' },
  { id: 'bella', name: 'Bella (Soft)', provider: 'elevenlabs', language: 'en', gender: 'female', style: 'soft' },
  { id: 'antoni', name: 'Antoni (Warm)', provider: 'elevenlabs', language: 'en', gender: 'male', style: 'warm' },
  { id: 'josh', name: 'Josh (Deep)', provider: 'elevenlabs', language: 'en', gender: 'male', style: 'deep' },
  { id: 'arnold', name: 'Arnold (Strong)', provider: 'elevenlabs', language: 'en', gender: 'male', style: 'strong' },
  { id: 'sam', name: 'Sam (Raspy)', provider: 'elevenlabs', language: 'en', gender: 'male', style: 'raspy' },
  
  // Google Cloud TTS voices
  { id: 'en-US-Wavenet-A', name: 'US English (Male)', provider: 'google', language: 'en-US', gender: 'male' },
  { id: 'en-US-Wavenet-C', name: 'US English (Female)', provider: 'google', language: 'en-US', gender: 'female' },
  { id: 'en-US-Wavenet-F', name: 'US English (Female 2)', provider: 'google', language: 'en-US', gender: 'female' },
  { id: 'en-GB-Wavenet-A', name: 'British English (Female)', provider: 'google', language: 'en-GB', gender: 'female' },
  { id: 'en-GB-Wavenet-B', name: 'British English (Male)', provider: 'google', language: 'en-GB', gender: 'male' },
  
  // Browser voices (fallback)
  { id: 'browser-default', name: 'Browser Default', provider: 'browser', language: 'en', gender: 'neutral' },
];

// Voice mapping for characters
export const CHARACTER_VOICE_MAP: Record<string, string> = {
  kiara: 'domi',
  jayden: 'josh',
  milo: 'antoni',
  luna: 'bella',
  narrator: 'rachel',
};

/**
 * Cloud TTS Service
 */
class CloudTTSService {
  private elevenLabsApiKey: string | null = null;
  private googleApiKey: string | null = null;
  private audioCache: Map<string, TTSResult> = new Map();

  constructor() {
    // Load API keys from environment
    if (typeof window !== 'undefined') {
      // Client-side: keys should be fetched from API
    }
  }

  /**
   * Set API keys
   */
  setApiKeys(elevenLabs?: string, google?: string) {
    this.elevenLabsApiKey = elevenLabs || null;
    this.googleApiKey = google || null;
  }

  /**
   * Get available provider based on API keys
   */
  getAvailableProvider(): TTSProvider {
    if (this.elevenLabsApiKey) return 'elevenlabs';
    if (this.googleApiKey) return 'google';
    return 'browser';
  }

  /**
   * Generate speech from text
   */
  async synthesize(
    text: string,
    options: TTSOptions = {}
  ): Promise<TTSResult> {
    const cacheKey = `${text}-${JSON.stringify(options)}`;
    
    // Check cache
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey)!;
    }

    const provider = this.getAvailableProvider();

    let result: TTSResult;

    switch (provider) {
      case 'elevenlabs':
        result = await this.synthesizeElevenLabs(text, options);
        break;
      case 'google':
        result = await this.synthesizeGoogle(text, options);
        break;
      default:
        result = await this.synthesizeBrowser(text, options);
    }

    // Cache result
    this.audioCache.set(cacheKey, result);
    return result;
  }

  /**
   * ElevenLabs TTS
   */
  private async synthesizeElevenLabs(
    text: string,
    options: TTSOptions
  ): Promise<TTSResult> {
    const voiceId = options.voice || 'rachel';
    const voice = TTS_VOICES.find(v => v.id === voiceId && v.provider === 'elevenlabs');
    
    if (!this.elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`/api/tts/elevenlabs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId,
          stability: options.emotion === 'calm' ? 0.8 : 0.5,
          similarityBoost: 0.75,
          speed: options.speed || 1,
        }),
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      // Estimate duration (rough: ~150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const duration = (wordCount / 150) * 60 * 1000 / (options.speed || 1);

      return { audioUrl, duration, provider: 'elevenlabs' };
    } catch (error) {
      console.warn('ElevenLabs failed, falling back to browser TTS:', error);
      return this.synthesizeBrowser(text, options);
    }
  }

  /**
   * Google Cloud TTS
   */
  private async synthesizeGoogle(
    text: string,
    options: TTSOptions
  ): Promise<TTSResult> {
    const voiceId = options.voice || 'en-US-Wavenet-C';
    
    if (!this.googleApiKey) {
      throw new Error('Google Cloud TTS API key not configured');
    }

    try {
      const response = await fetch(`/api/tts/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId,
          speakingRate: options.speed || 1,
          pitch: options.pitch || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Google TTS API error');
      }

      const data = await response.json();
      const audioContent = data.audioContent;
      const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      // Estimate duration
      const wordCount = text.split(/\s+/).length;
      const duration = (wordCount / 150) * 60 * 1000 / (options.speed || 1);

      return { audioUrl, duration, provider: 'google' };
    } catch (error) {
      console.warn('Google TTS failed, falling back to browser TTS:', error);
      return this.synthesizeBrowser(text, options);
    }
  }

  /**
   * Browser TTS (fallback)
   */
  private async synthesizeBrowser(
    text: string,
    options: TTSOptions
  ): Promise<TTSResult> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        // Return silent audio for SSR
        resolve({
          audioUrl: '',
          duration: text.split(/\s+/).length * 400,
          provider: 'browser',
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 0.9;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 1;

      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && v.name.includes('Female')
      ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Estimate duration
      const wordCount = text.split(/\s+/).length;
      const duration = (wordCount / 150) * 60 * 1000 / (options.speed || 0.9);

      resolve({
        audioUrl: '', // Browser TTS doesn't provide URL
        duration,
        provider: 'browser',
      });
    });
  }

  /**
   * Speak text directly (browser TTS)
   */
  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 0.9;
      utterance.pitch = options.pitch || 1.1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop speaking
   */
  stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.forEach((result) => {
      if (result.audioUrl) {
        URL.revokeObjectURL(result.audioUrl);
      }
    });
    this.audioCache.clear();
  }
}

// Helper function
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Singleton instance
let ttsService: CloudTTSService | null = null;

export function getCloudTTSService(): CloudTTSService {
  if (!ttsService) {
    ttsService = new CloudTTSService();
  }
  return ttsService;
}

export default CloudTTSService;
