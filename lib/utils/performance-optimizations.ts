/**
 * Performance Optimizations
 * Canvas rendering, Web Workers, asset preloading
 */

// ==========================================
// ASSET PRELOADER
// ==========================================

export interface PreloadableAsset {
  id: string;
  type: 'image' | 'audio' | 'font' | 'json';
  url: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
  currentAsset?: string;
}

class AssetPreloader {
  private cache: Map<string, any> = new Map();
  private loading: Map<string, Promise<any>> = new Map();
  private failed: Set<string> = new Set();

  public onProgress: ((progress: PreloadProgress) => void) | null = null;

  /**
   * Preload multiple assets
   */
  async preloadAll(assets: PreloadableAsset[]): Promise<Map<string, any>> {
    // Sort by priority
    const sorted = [...assets].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    let loaded = 0;
    const total = sorted.length;

    for (const asset of sorted) {
      this.onProgress?.({
        total,
        loaded,
        failed: this.failed.size,
        percentage: Math.round((loaded / total) * 100),
        currentAsset: asset.id,
      });

      try {
        await this.preload(asset);
        loaded++;
      } catch (error) {
        console.warn(`Failed to preload ${asset.id}:`, error);
        this.failed.add(asset.id);
      }
    }

    this.onProgress?.({
      total,
      loaded,
      failed: this.failed.size,
      percentage: 100,
    });

    return this.cache;
  }

  /**
   * Preload single asset
   */
  async preload(asset: PreloadableAsset): Promise<any> {
    // Check cache
    if (this.cache.has(asset.id)) {
      return this.cache.get(asset.id);
    }

    // Check if already loading
    if (this.loading.has(asset.id)) {
      return this.loading.get(asset.id);
    }

    // Start loading
    const loadPromise = this.loadAsset(asset);
    this.loading.set(asset.id, loadPromise);

    try {
      const result = await loadPromise;
      this.cache.set(asset.id, result);
      return result;
    } finally {
      this.loading.delete(asset.id);
    }
  }

  /**
   * Get cached asset
   */
  get(id: string): any | null {
    return this.cache.get(id) || null;
  }

  /**
   * Check if asset is cached
   */
  has(id: string): boolean {
    return this.cache.has(id);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.failed.clear();
  }

  private async loadAsset(asset: PreloadableAsset): Promise<any> {
    switch (asset.type) {
      case 'image':
        return this.loadImage(asset.url);
      case 'audio':
        return this.loadAudio(asset.url);
      case 'font':
        return this.loadFont(asset.id, asset.url);
      case 'json':
        return this.loadJSON(asset.url);
      default:
        throw new Error(`Unknown asset type: ${asset.type}`);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private async loadAudio(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioContext.decodeAudioData(arrayBuffer);
  }

  private async loadFont(family: string, url: string): Promise<FontFace> {
    const font = new FontFace(family, `url(${url})`);
    await font.load();
    document.fonts.add(font);
    return font;
  }

  private async loadJSON(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }
}

// ==========================================
// OFFSCREEN CANVAS RENDERER
// ==========================================

export interface RenderOptions {
  width: number;
  height: number;
  pixelRatio?: number;
  antialias?: boolean;
}

class OffscreenRenderer {
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private pixelRatio: number;

  constructor(options: RenderOptions) {
    this.width = options.width;
    this.height = options.height;
    this.pixelRatio = options.pixelRatio || (typeof window !== 'undefined' ? window.devicePixelRatio : 1);

    // Try to use OffscreenCanvas for better performance
    if (typeof OffscreenCanvas !== 'undefined') {
      this.canvas = new OffscreenCanvas(
        this.width * this.pixelRatio,
        this.height * this.pixelRatio
      );
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width * this.pixelRatio;
      this.canvas.height = this.height * this.pixelRatio;
    }

    const ctx = this.canvas.getContext('2d', { alpha: true }) as OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;

    // Scale for pixel ratio
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  /**
   * Clear canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Fill background
   */
  fillBackground(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw gradient background
   */
  drawGradient(colors: string[], direction: 'vertical' | 'horizontal' = 'vertical'): void {
    const gradient = direction === 'vertical'
      ? this.ctx.createLinearGradient(0, 0, 0, this.height)
      : this.ctx.createLinearGradient(0, 0, this.width, 0);

    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Draw image
   */
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): void {
    if (width && height) {
      this.ctx.drawImage(image, x, y, width, height);
    } else {
      this.ctx.drawImage(image, x, y);
    }
  }

  /**
   * Draw with transform
   */
  drawWithTransform(
    draw: (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) => void,
    transform: {
      x?: number;
      y?: number;
      rotation?: number;
      scaleX?: number;
      scaleY?: number;
      originX?: number;
      originY?: number;
    }
  ): void {
    const { x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1, originX = 0, originY = 0 } = transform;

    this.ctx.save();
    this.ctx.translate(x + originX, y + originY);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.scale(scaleX, scaleY);
    this.ctx.translate(-originX, -originY);
    draw(this.ctx);
    this.ctx.restore();
  }

  /**
   * Apply camera transform
   */
  applyCameraTransform(zoom: number, panX: number, panY: number, rotation: number = 0): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    this.ctx.translate(centerX, centerY);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.scale(zoom, zoom);
    this.ctx.translate(-centerX + panX, -centerY + panY);
  }

  /**
   * Get canvas as blob
   */
  async toBlob(type: string = 'image/png', quality?: number): Promise<Blob> {
    if (this.canvas instanceof OffscreenCanvas) {
      return this.canvas.convertToBlob({ type, quality });
    } else {
      return new Promise((resolve, reject) => {
        (this.canvas as HTMLCanvasElement).toBlob(
          (blob: Blob | null) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          type,
          quality
        );
      });
    }
  }

  /**
   * Get canvas as data URL
   */
  toDataURL(type: string = 'image/png', quality?: number): string {
    if (this.canvas instanceof HTMLCanvasElement) {
      return this.canvas.toDataURL(type, quality);
    }
    // OffscreenCanvas doesn't support toDataURL directly
    throw new Error('toDataURL not supported for OffscreenCanvas');
  }

  /**
   * Get raw context for advanced operations
   */
  getContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get canvas element
   */
  getCanvas(): OffscreenCanvas | HTMLCanvasElement {
    return this.canvas;
  }
}

// ==========================================
// WEB WORKER MANAGER
// ==========================================

export interface WorkerTask {
  id: string;
  type: string;
  data: any;
}

export interface WorkerResult {
  id: string;
  type: string;
  data: any;
  error?: string;
}

class WorkerManager {
  private workers: Map<string, Worker> = new Map();
  private taskQueue: Map<string, { resolve: Function; reject: Function }> = new Map();
  private workerScripts: Map<string, string> = new Map();

  /**
   * Register a worker script
   */
  registerWorker(type: string, script: string): void {
    this.workerScripts.set(type, script);
  }

  /**
   * Get or create worker
   */
  private getWorker(type: string): Worker {
    if (this.workers.has(type)) {
      return this.workers.get(type)!;
    }

    const script = this.workerScripts.get(type);
    if (!script) {
      throw new Error(`No worker script registered for type: ${type}`);
    }

    // Create worker from blob
    const blob = new Blob([script], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    worker.onmessage = (event: MessageEvent<WorkerResult>) => {
      const { id, data, error } = event.data;
      const task = this.taskQueue.get(id);
      if (task) {
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(data);
        }
        this.taskQueue.delete(id);
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
    };

    this.workers.set(type, worker);
    return worker;
  }

  /**
   * Run task in worker
   */
  async runTask<T>(type: string, data: any): Promise<T> {
    const worker = this.getWorker(type);
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      this.taskQueue.set(id, { resolve, reject });
      worker.postMessage({ id, type, data } as WorkerTask);
    });
  }

  /**
   * Terminate all workers
   */
  terminateAll(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.workers.clear();
    this.taskQueue.clear();
  }

  /**
   * Terminate specific worker
   */
  terminate(type: string): void {
    const worker = this.workers.get(type);
    if (worker) {
      worker.terminate();
      this.workers.delete(type);
    }
  }
}

// ==========================================
// FRAME SCHEDULER
// ==========================================

type FrameCallback = (deltaTime: number, totalTime: number) => void;

class FrameScheduler {
  private callbacks: Map<string, FrameCallback> = new Map();
  private animationFrame: number | null = null;
  private lastTime: number = 0;
  private totalTime: number = 0;
  private isRunning: boolean = false;
  private targetFPS: number = 60;
  private frameInterval: number;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  /**
   * Add callback to frame loop
   */
  add(id: string, callback: FrameCallback): void {
    this.callbacks.set(id, callback);
  }

  /**
   * Remove callback from frame loop
   */
  remove(id: string): void {
    this.callbacks.delete(id);
  }

  /**
   * Start frame loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * Stop frame loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Set target FPS
   */
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // Frame rate limiting
    if (deltaTime >= this.frameInterval) {
      this.totalTime += deltaTime;
      
      // Call all callbacks
      this.callbacks.forEach((callback) => {
        try {
          callback(deltaTime, this.totalTime);
        } catch (error) {
          console.error('Frame callback error:', error);
        }
      });

      this.lastTime = currentTime - (deltaTime % this.frameInterval);
    }

    this.animationFrame = requestAnimationFrame(this.loop);
  };
}

// ==========================================
// OBJECT POOL
// ==========================================

class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * Get object from pool
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * Return object to pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  /**
   * Get pool size
   */
  get size(): number {
    return this.pool.length;
  }

  /**
   * Clear pool
   */
  clear(): void {
    this.pool = [];
  }
}

// ==========================================
// EXPORTS
// ==========================================

// Singleton instances
let assetPreloader: AssetPreloader | null = null;
let workerManager: WorkerManager | null = null;
let frameScheduler: FrameScheduler | null = null;

export function getAssetPreloader(): AssetPreloader {
  if (!assetPreloader) {
    assetPreloader = new AssetPreloader();
  }
  return assetPreloader;
}

export function getWorkerManager(): WorkerManager {
  if (!workerManager) {
    workerManager = new WorkerManager();
  }
  return workerManager;
}

export function getFrameScheduler(targetFPS?: number): FrameScheduler {
  if (!frameScheduler) {
    frameScheduler = new FrameScheduler(targetFPS);
  }
  return frameScheduler;
}

export { AssetPreloader, OffscreenRenderer, WorkerManager, FrameScheduler, ObjectPool };

// Worker scripts for common tasks
export const WORKER_SCRIPTS = {
  // Image processing worker
  imageProcessing: `
    self.onmessage = function(e) {
      const { id, type, data } = e.data;
      
      try {
        let result;
        
        switch (data.operation) {
          case 'resize':
            result = resizeImage(data.imageData, data.width, data.height);
            break;
          case 'blur':
            result = blurImage(data.imageData, data.radius);
            break;
          case 'grayscale':
            result = grayscaleImage(data.imageData);
            break;
          default:
            throw new Error('Unknown operation: ' + data.operation);
        }
        
        self.postMessage({ id, type, data: result });
      } catch (error) {
        self.postMessage({ id, type, error: error.message });
      }
    };
    
    function resizeImage(imageData, newWidth, newHeight) {
      // Simple nearest-neighbor resize
      const { data, width, height } = imageData;
      const newData = new Uint8ClampedArray(newWidth * newHeight * 4);
      
      const xRatio = width / newWidth;
      const yRatio = height / newHeight;
      
      for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
          const srcX = Math.floor(x * xRatio);
          const srcY = Math.floor(y * yRatio);
          const srcIdx = (srcY * width + srcX) * 4;
          const dstIdx = (y * newWidth + x) * 4;
          
          newData[dstIdx] = data[srcIdx];
          newData[dstIdx + 1] = data[srcIdx + 1];
          newData[dstIdx + 2] = data[srcIdx + 2];
          newData[dstIdx + 3] = data[srcIdx + 3];
        }
      }
      
      return { data: newData, width: newWidth, height: newHeight };
    }
    
    function blurImage(imageData, radius) {
      // Box blur implementation
      const { data, width, height } = imageData;
      const newData = new Uint8ClampedArray(data.length);
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, a = 0, count = 0;
          
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                a += data[idx + 3];
                count++;
              }
            }
          }
          
          const idx = (y * width + x) * 4;
          newData[idx] = r / count;
          newData[idx + 1] = g / count;
          newData[idx + 2] = b / count;
          newData[idx + 3] = a / count;
        }
      }
      
      return { data: newData, width, height };
    }
    
    function grayscaleImage(imageData) {
      const { data, width, height } = imageData;
      const newData = new Uint8ClampedArray(data.length);
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        newData[i] = gray;
        newData[i + 1] = gray;
        newData[i + 2] = gray;
        newData[i + 3] = data[i + 3];
      }
      
      return { data: newData, width, height };
    }
  `,

  // Audio processing worker
  audioProcessing: `
    self.onmessage = function(e) {
      const { id, type, data } = e.data;
      
      try {
        let result;
        
        switch (data.operation) {
          case 'normalize':
            result = normalizeAudio(data.samples);
            break;
          case 'fade':
            result = fadeAudio(data.samples, data.fadeIn, data.fadeOut);
            break;
          default:
            throw new Error('Unknown operation: ' + data.operation);
        }
        
        self.postMessage({ id, type, data: result });
      } catch (error) {
        self.postMessage({ id, type, error: error.message });
      }
    };
    
    function normalizeAudio(samples) {
      let max = 0;
      for (let i = 0; i < samples.length; i++) {
        max = Math.max(max, Math.abs(samples[i]));
      }
      
      if (max === 0) return samples;
      
      const normalized = new Float32Array(samples.length);
      const scale = 1 / max;
      
      for (let i = 0; i < samples.length; i++) {
        normalized[i] = samples[i] * scale;
      }
      
      return normalized;
    }
    
    function fadeAudio(samples, fadeInSamples, fadeOutSamples) {
      const result = new Float32Array(samples.length);
      
      for (let i = 0; i < samples.length; i++) {
        let gain = 1;
        
        if (i < fadeInSamples) {
          gain = i / fadeInSamples;
        } else if (i > samples.length - fadeOutSamples) {
          gain = (samples.length - i) / fadeOutSamples;
        }
        
        result[i] = samples[i] * gain;
      }
      
      return result;
    }
  `,
};
