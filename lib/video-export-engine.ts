// Video Export Engine - Canvas capture + MediaRecorder for real video export
// With proper audio synthesis that routes to MediaRecorder

export interface ExportOptions {
  format: 'webm' | 'mp4' | 'gif';
  quality: 'low' | 'medium' | 'high';
  fps: number;
  width: number;
  height: number;
  includeAudio: boolean;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface ExportProgress {
  phase: 'preparing' | 'rendering' | 'encoding' | 'complete' | 'error';
  progress: number; // 0-100
  currentScene?: number;
  totalScenes?: number;
  message?: string;
}

export interface SceneRenderData {
  id: string;
  duration: number;
  background: string;
  narration: string;
  characters: {
    rigId: string;
    name: string;
    x: number;
    y: number;
    scale: number;
    flipX: boolean;
    animation: string;
    expression: string;
  }[];
  cameraZoom?: number;
  cameraPanX?: number;
  cameraPanY?: number;
}

// Audio synthesis for video export - creates tones to represent speech rhythm
class AudioSynthesizer {
  private audioContext: AudioContext;
  private destination: MediaStreamAudioDestinationNode;
  private gainNode: GainNode;

  constructor(audioContext: AudioContext, destination: MediaStreamAudioDestinationNode) {
    this.audioContext = audioContext;
    this.destination = destination;
    this.gainNode = audioContext.createGain();
    this.gainNode.gain.value = 0.3;
    this.gainNode.connect(destination);
  }

  // Generate speech-like audio based on text (simple tone patterns)
  async speakText(text: string, duration: number): Promise<void> {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return;

    const wordDuration = Math.min(duration / words.length, 400);
    const pauseDuration = 100;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Create a tone for each word
      await this.playWordTone(word, wordDuration - pauseDuration);
      // Small pause between words
      await this.wait(pauseDuration);
    }
  }

  private async playWordTone(word: string, duration: number): Promise<void> {
    const oscillator = this.audioContext.createOscillator();
    const wordGain = this.audioContext.createGain();
    
    // Vary frequency based on word characteristics
    const baseFreq = 180 + (word.length * 10) % 100;
    oscillator.type = 'sine';
    oscillator.frequency.value = baseFreq;
    
    // Add slight frequency variation for natural sound
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(baseFreq + 20, this.audioContext.currentTime + duration / 2000);
    oscillator.frequency.linearRampToValueAtTime(baseFreq - 10, this.audioContext.currentTime + duration / 1000);
    
    // Envelope for natural speech-like sound
    wordGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    wordGain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.02);
    wordGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + duration / 2000);
    wordGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);
    
    oscillator.connect(wordGain);
    wordGain.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
    
    await this.wait(duration);
  }

  // Play background ambient tone
  async playAmbient(duration: number, mood: string = 'neutral'): Promise<void> {
    const oscillator = this.audioContext.createOscillator();
    const ambientGain = this.audioContext.createGain();
    
    const moodFreqs: Record<string, number> = {
      happy: 440,
      sad: 220,
      exciting: 523,
      calm: 330,
      neutral: 261,
    };
    
    oscillator.type = 'sine';
    oscillator.frequency.value = moodFreqs[mood] || 261;
    ambientGain.gain.value = 0.02; // Very quiet ambient
    
    oscillator.connect(ambientGain);
    ambientGain.connect(this.gainNode);
    
    oscillator.start();
    
    setTimeout(() => {
      ambientGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
      setTimeout(() => oscillator.stop(), 500);
    }, duration - 500);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const QUALITY_PRESETS = {
  low: { bitrate: 1000000, audioBitrate: 64000 },
  medium: { bitrate: 2500000, audioBitrate: 128000 },
  high: { bitrate: 5000000, audioBitrate: 192000 },
};

const ASPECT_RATIOS = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
};

// Background color mapping
const BACKGROUND_COLORS: Record<string, string> = {
  meadow: '#90EE90',
  forest: '#228B22',
  beach: '#F4A460',
  night: '#1a1a2e',
  park: '#7CFC00',
  bedroom: '#E6E6FA',
  default: '#87CEEB',
};

// Character color mapping for simple rendering
const CHARACTER_COLORS: Record<string, string> = {
  luna: '#FFB6C1',
  milo: '#87CEEB',
  coco: '#DEB887',
  pip: '#98FB98',
  default: '#FFA500',
};

export class VideoExportEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;
  private audioSynthesizer: AudioSynthesizer | null = null;
  private onProgress: (progress: ExportProgress) => void;

  constructor(
    width: number,
    height: number,
    onProgress: (progress: ExportProgress) => void
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.onProgress = onProgress;
  }

  async exportVideo(
    scenes: SceneRenderData[],
    options: ExportOptions
  ): Promise<Blob> {
    this.onProgress({ phase: 'preparing', progress: 0, message: 'Initializing export...' });

    // Apply aspect ratio if specified
    if (options.aspectRatio && ASPECT_RATIOS[options.aspectRatio]) {
      const dims = ASPECT_RATIOS[options.aspectRatio];
      this.canvas.width = dims.width;
      this.canvas.height = dims.height;
    } else {
      this.canvas.width = options.width;
      this.canvas.height = options.height;
    }

    // Setup audio context if needed
    if (options.includeAudio) {
      this.audioContext = new AudioContext();
      this.audioDestination = this.audioContext.createMediaStreamDestination();
      this.audioSynthesizer = new AudioSynthesizer(this.audioContext, this.audioDestination);
    }

    // Get canvas stream
    const canvasStream = this.canvas.captureStream(options.fps);

    // Combine video and audio streams
    let combinedStream: MediaStream;
    if (this.audioDestination) {
      const audioTrack = this.audioDestination.stream.getAudioTracks()[0];
      if (audioTrack) {
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          audioTrack,
        ]);
      } else {
        combinedStream = canvasStream;
      }
    } else {
      combinedStream = canvasStream;
    }

    // Determine MIME type
    const mimeType = this.getMimeType(options.format);
    const preset = QUALITY_PRESETS[options.quality];

    // Create MediaRecorder
    this.mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: preset.bitrate,
      audioBitsPerSecond: options.includeAudio ? preset.audioBitrate : undefined,
    });

    this.recordedChunks = [];
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    // Start recording
    this.mediaRecorder.start(100); // Collect data every 100ms

    // Render all scenes
    await this.renderScenes(scenes, options);

    // Stop recording and get blob
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.onProgress({ phase: 'encoding', progress: 95, message: 'Finalizing video...' });
        
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        
        // Cleanup
        if (this.audioContext) {
          this.audioContext.close();
        }
        
        this.onProgress({ phase: 'complete', progress: 100, message: 'Export complete!' });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error('Recording failed'));
      };

      this.mediaRecorder.stop();
    });
  }

  private getMimeType(format: string): string {
    // Check browser support
    const webmCodecs = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mp4Codecs = ['video/mp4;codecs=h264', 'video/mp4'];

    if (format === 'webm') {
      for (const codec of webmCodecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          return codec;
        }
      }
    }

    if (format === 'mp4') {
      for (const codec of mp4Codecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          return codec;
        }
      }
      // Fallback to webm if mp4 not supported
      for (const codec of webmCodecs) {
        if (MediaRecorder.isTypeSupported(codec)) {
          return codec;
        }
      }
    }

    return 'video/webm';
  }

  private async renderScenes(
    scenes: SceneRenderData[],
    options: ExportOptions
  ): Promise<void> {
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
    let elapsedTime = 0;

    for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
      const scene = scenes[sceneIndex];
      const sceneDuration = scene.duration;
      const frameCount = Math.ceil((sceneDuration / 1000) * options.fps);

      this.onProgress({
        phase: 'rendering',
        progress: Math.round((elapsedTime / totalDuration) * 90),
        currentScene: sceneIndex + 1,
        totalScenes: scenes.length,
        message: `Rendering scene ${sceneIndex + 1} of ${scenes.length}...`,
      });

      // Start audio for this scene (narration + ambient)
      let audioPromise: Promise<void> | null = null;
      if (options.includeAudio && scene.narration) {
        audioPromise = this.speakNarration(scene.narration, sceneDuration);
        // Also play ambient background audio
        this.playAmbientAudio(sceneDuration, 'neutral');
      }

      // Render frames for this scene
      for (let frame = 0; frame < frameCount; frame++) {
        const frameProgress = frame / frameCount;
        await this.renderFrame(scene, frameProgress, options);
        
        // Wait for next frame timing
        await this.waitFrame(options.fps);
      }

      elapsedTime += sceneDuration;
    }
  }

  private async renderFrame(
    scene: SceneRenderData,
    progress: number,
    options: ExportOptions
  ): Promise<void> {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply camera transform
    ctx.save();
    const zoom = scene.cameraZoom || 1;
    const panX = (scene.cameraPanX || 0) * width * 0.1;
    const panY = (scene.cameraPanY || 0) * height * 0.1;
    
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2 + panX, -height / 2 + panY);

    // Draw background
    this.drawBackground(scene.background, width, height);

    // Draw characters
    for (const char of scene.characters) {
      this.drawCharacter(char, progress, width, height);
    }

    ctx.restore();

    // Draw narration text overlay
    if (scene.narration) {
      this.drawNarrationOverlay(scene.narration, width, height);
    }
  }

  private drawBackground(backgroundId: string, width: number, height: number): void {
    const ctx = this.ctx;
    const bgColor = BACKGROUND_COLORS[backgroundId] || BACKGROUND_COLORS.default;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.lightenColor(bgColor, 30));
    gradient.addColorStop(1, bgColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add simple ground
    ctx.fillStyle = this.darkenColor(bgColor, 20);
    ctx.fillRect(0, height * 0.7, width, height * 0.3);

    // Add simple decorations based on background type
    this.drawBackgroundDecorations(backgroundId, width, height);
  }

  private drawBackgroundDecorations(bgId: string, width: number, height: number): void {
    const ctx = this.ctx;

    switch (bgId) {
      case 'meadow':
      case 'park':
        // Draw simple flowers
        for (let i = 0; i < 10; i++) {
          const x = (width / 10) * i + Math.random() * 50;
          const y = height * 0.75 + Math.random() * 50;
          ctx.fillStyle = ['#FF69B4', '#FFD700', '#FF6347'][i % 3];
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'forest':
        // Draw simple trees
        for (let i = 0; i < 5; i++) {
          const x = (width / 5) * i + 50;
          const y = height * 0.7;
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x - 10, y - 80, 20, 80);
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.moveTo(x, y - 150);
          ctx.lineTo(x - 50, y - 50);
          ctx.lineTo(x + 50, y - 50);
          ctx.closePath();
          ctx.fill();
        }
        break;

      case 'beach':
        // Draw waves
        ctx.fillStyle = '#4169E1';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, height * 0.8 + i * 20);
          for (let x = 0; x <= width; x += 50) {
            ctx.quadraticCurveTo(
              x + 25,
              height * 0.8 + i * 20 - 10,
              x + 50,
              height * 0.8 + i * 20
            );
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.globalAlpha = 0.3 + i * 0.2;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;

      case 'night':
        // Draw stars
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height * 0.6;
          const size = Math.random() * 3 + 1;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        // Draw moon
        ctx.fillStyle = '#FFFACD';
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.2, 50, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'bedroom':
        // Draw window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(width * 0.6, height * 0.1, width * 0.25, height * 0.3);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.strokeRect(width * 0.6, height * 0.1, width * 0.25, height * 0.3);
        // Draw bed
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(width * 0.1, height * 0.5, width * 0.35, height * 0.25);
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(width * 0.1, height * 0.5, width * 0.1, height * 0.15);
        break;
    }
  }

  private drawCharacter(
    char: SceneRenderData['characters'][0],
    progress: number,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const ctx = this.ctx;
    const color = CHARACTER_COLORS[char.rigId] || CHARACTER_COLORS.default;

    // Calculate position
    const x = (char.x / 100) * canvasWidth;
    const y = (char.y / 100) * canvasHeight;
    const scale = char.scale * 0.8;
    const baseSize = Math.min(canvasWidth, canvasHeight) * 0.15;

    ctx.save();
    ctx.translate(x, y);
    if (char.flipX) {
      ctx.scale(-1, 1);
    }
    ctx.scale(scale, scale);

    // Apply animation bounce
    let bounceY = 0;
    if (char.animation === 'walk' || char.animation === 'jump' || char.animation === 'dance') {
      bounceY = Math.sin(progress * Math.PI * 4) * 10;
    }

    // Draw body (simple cartoon style)
    ctx.fillStyle = color;
    
    // Body
    ctx.beginPath();
    ctx.ellipse(0, bounceY, baseSize * 0.4, baseSize * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -baseSize * 0.5 + bounceY, baseSize * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(-baseSize * 0.12, -baseSize * 0.55 + bounceY, baseSize * 0.1, baseSize * 0.12, 0, 0, Math.PI * 2);
    ctx.ellipse(baseSize * 0.12, -baseSize * 0.55 + bounceY, baseSize * 0.1, baseSize * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-baseSize * 0.12, -baseSize * 0.55 + bounceY, baseSize * 0.05, 0, Math.PI * 2);
    ctx.arc(baseSize * 0.12, -baseSize * 0.55 + bounceY, baseSize * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Mouth based on expression
    this.drawMouth(char.expression, baseSize, bounceY);

    // Draw name label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${baseSize * 0.15}px Arial`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(char.name, 0, baseSize * 0.7 + bounceY);
    ctx.fillText(char.name, 0, baseSize * 0.7 + bounceY);

    ctx.restore();
  }

  private drawMouth(expression: string, baseSize: number, bounceY: number): void {
    const ctx = this.ctx;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const mouthY = -baseSize * 0.35 + bounceY;

    switch (expression) {
      case 'happy':
      case 'excited':
        ctx.beginPath();
        ctx.arc(0, mouthY, baseSize * 0.12, 0, Math.PI);
        ctx.stroke();
        break;
      case 'sad':
        ctx.beginPath();
        ctx.arc(0, mouthY + baseSize * 0.1, baseSize * 0.12, Math.PI, 0);
        ctx.stroke();
        break;
      case 'surprised':
        ctx.beginPath();
        ctx.ellipse(0, mouthY, baseSize * 0.08, baseSize * 0.1, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'angry':
        ctx.beginPath();
        ctx.moveTo(-baseSize * 0.1, mouthY);
        ctx.lineTo(baseSize * 0.1, mouthY);
        ctx.stroke();
        break;
      default: // neutral
        ctx.beginPath();
        ctx.moveTo(-baseSize * 0.08, mouthY);
        ctx.lineTo(baseSize * 0.08, mouthY);
        ctx.stroke();
    }
  }

  private drawNarrationOverlay(text: string, width: number, height: number): void {
    const ctx = this.ctx;
    const padding = 20;
    const maxWidth = width * 0.8;
    const fontSize = Math.max(16, Math.min(24, width / 40));

    ctx.font = `${fontSize}px Arial`;
    
    // Word wrap
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    const lineHeight = fontSize * 1.4;
    const boxHeight = lines.length * lineHeight + padding * 2;
    const boxY = height - boxHeight - 20;

    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect((width - maxWidth - padding * 2) / 2, boxY, maxWidth + padding * 2, boxHeight, 10);
    ctx.fill();

    // Draw text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, boxY + padding + i * lineHeight);
    }
  }

  private async speakNarration(text: string, duration: number): Promise<void> {
    if (!this.audioSynthesizer) return;
    
    // Use our audio synthesizer which properly routes to MediaRecorder
    await this.audioSynthesizer.speakText(text, duration);
  }

  private async playAmbientAudio(duration: number, mood: string = 'neutral'): Promise<void> {
    if (!this.audioSynthesizer) return;
    await this.audioSynthesizer.playAmbient(duration, mood);
  }

  private waitFrame(fps: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000 / fps));
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Capture current frame as canvas for GIF export
  captureFrame(): HTMLCanvasElement {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = this.canvas.width;
    frameCanvas.height = this.canvas.height;
    const frameCtx = frameCanvas.getContext('2d')!;
    frameCtx.drawImage(this.canvas, 0, 0);
    return frameCanvas;
  }

  // Render a single frame and return it for GIF capture
  async renderSingleFrame(scene: SceneRenderData, progress: number, options: ExportOptions): Promise<HTMLCanvasElement> {
    await this.renderFrame(scene, progress, options);
    return this.captureFrame();
  }
}

// GIF Export using proper LZW encoding
export async function exportAsGif(
  scenes: SceneRenderData[],
  options: ExportOptions,
  onProgress: (progress: ExportProgress) => void
): Promise<Blob> {
  // Import the GIF encoder
  const { GifEncoder } = await import('./gif-export');
  
  onProgress({ 
    phase: 'preparing', 
    progress: 0, 
    message: 'Preparing GIF export...' 
  });

  const encoder = new GifEncoder({
    width: options.width,
    height: options.height,
    fps: Math.min(options.fps, 15), // GIFs work best at lower FPS
    quality: 10,
    loop: true,
  });

  // Create a temporary engine for rendering frames
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const ctx = canvas.getContext('2d')!;

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  let elapsedTime = 0;
  const frameDelay = 1000 / Math.min(options.fps, 15);

  // Create a simple render engine for GIF frames
  const engine = new VideoExportEngine(options.width, options.height, () => {});

  for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
    const scene = scenes[sceneIndex];
    const sceneDuration = scene.duration;
    const frameCount = Math.ceil((sceneDuration / 1000) * Math.min(options.fps, 15));

    onProgress({
      phase: 'rendering',
      progress: Math.round((elapsedTime / totalDuration) * 90),
      currentScene: sceneIndex + 1,
      totalScenes: scenes.length,
      message: `Rendering GIF frame ${sceneIndex + 1} of ${scenes.length}...`,
    });

    for (let frame = 0; frame < frameCount; frame++) {
      const frameProgress = frame / frameCount;
      const frameCanvas = await engine.renderSingleFrame(scene, frameProgress, options);
      
      encoder.addFrame({
        imageData: frameCanvas,
        delay: frameDelay,
      });
    }

    elapsedTime += sceneDuration;
  }

  onProgress({ 
    phase: 'encoding', 
    progress: 95, 
    message: 'Encoding GIF...' 
  });

  const blob = await encoder.encode();

  onProgress({ 
    phase: 'complete', 
    progress: 100, 
    message: 'GIF export complete!' 
  });

  return blob;
}

// Helper to convert EditableScene to SceneRenderData
export function editableSceneToRenderData(scene: any): SceneRenderData {
  return {
    id: scene.id,
    duration: scene.duration || 5000,
    background: scene.background || 'meadow',
    narration: scene.narration || '',
    characters: (scene.characters || []).map((c: any) => ({
      rigId: c.rigId || 'luna',
      name: c.name || 'Character',
      x: c.x ?? 50,
      y: c.y ?? 70,
      scale: c.scale ?? 1,
      flipX: c.flipX ?? false,
      animation: c.animation || 'idle',
      expression: c.expression || 'neutral',
    })),
    cameraZoom: scene.cameraZoom,
    cameraPanX: scene.cameraPanX,
    cameraPanY: scene.cameraPanY,
  };
}
