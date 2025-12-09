/**
 * PIXI.js Compatible Camera System
 * Provides cinematic camera control for 2D cartoon animations
 * 
 * Features:
 * - Camera.follow(target) - Follow a character/object
 * - Camera.zoomTo(level) - Smooth zoom transitions
 * - Camera.panTo(x, y) - Pan to position
 * - Camera.cutToScene(scene) - Hard cut transition
 * - Camera.shake() - Screen shake effects
 * - Parallax layer support
 */

import { 
  CameraState, 
  CameraAngle, 
  CameraMovement, 
  CameraEffect,
  DEFAULT_CAMERA_STATE,
  CAMERA_ANGLE_PRESETS,
  generateShakeValues,
  generatePulseValues,
  generateWobbleValues,
  interpolateCameraState,
} from './camera-system';

// Target that camera can follow
export interface CameraTarget {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Parallax layer configuration
export interface ParallaxLayer {
  id: string;
  depth: number; // 0 = foreground (moves most), 1 = background (moves least)
  element?: HTMLElement;
}

// Camera bounds
export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZoom: number;
  maxZoom: number;
}

// Transition options
export interface TransitionOptions {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
  onComplete?: () => void;
}

/**
 * Camera class for 2D animation
 * Can be used with PIXI.js, HTML Canvas, or CSS transforms
 */
export class Camera {
  private state: CameraState;
  private targetState: CameraState | null = null;
  private transitionStartTime: number = 0;
  private transitionDuration: number = 0;
  private transitionEasing: CameraState['easing'] = 'ease-in-out';
  private onTransitionComplete: (() => void) | null = null;
  
  private followTarget: CameraTarget | null = null;
  private followOffset: { x: number; y: number } = { x: 0, y: 0 };
  private followSmoothing: number = 0.1; // 0 = instant, 1 = very slow
  
  private parallaxLayers: ParallaxLayer[] = [];
  private bounds: CameraBounds | null = null;
  
  private shakeStartTime: number = 0;
  private shakeDuration: number = 0;
  private shakeIntensity: CameraEffect = 'none';
  
  private animationFrame: number | null = null;
  private lastUpdateTime: number = 0;
  
  // Event callbacks
  public onUpdate: ((state: CameraState) => void) | null = null;
  public onShakeStart: (() => void) | null = null;
  public onShakeEnd: (() => void) | null = null;

  constructor(initialState: Partial<CameraState> = {}) {
    this.state = { ...DEFAULT_CAMERA_STATE, ...initialState };
  }

  // ==========================================
  // GETTERS
  // ==========================================

  get x(): number { return this.state.x; }
  get y(): number { return this.state.y; }
  get zoom(): number { return this.state.zoom; }
  get rotation(): number { return this.state.rotation; }
  get angle(): CameraAngle { return this.state.angle; }
  get currentState(): CameraState { return { ...this.state }; }

  // ==========================================
  // CORE CAMERA CONTROLS
  // ==========================================

  /**
   * Set camera position immediately
   */
  setPosition(x: number, y: number): this {
    this.state.x = this.clampX(x);
    this.state.y = this.clampY(y);
    this.emitUpdate();
    return this;
  }

  /**
   * Set zoom level immediately
   */
  setZoom(zoom: number): this {
    this.state.zoom = this.clampZoom(zoom);
    this.emitUpdate();
    return this;
  }

  /**
   * Set rotation immediately (degrees)
   */
  setRotation(degrees: number): this {
    this.state.rotation = degrees;
    this.emitUpdate();
    return this;
  }

  /**
   * Pan camera to position with smooth transition
   */
  panTo(x: number, y: number, options: Partial<TransitionOptions> = {}): this {
    const { duration = 500, easing = 'ease-in-out', onComplete } = options;
    
    this.startTransition({
      x: this.clampX(x),
      y: this.clampY(y),
    }, duration, easing, onComplete);
    
    return this;
  }

  /**
   * Zoom to level with smooth transition
   */
  zoomTo(level: number, options: Partial<TransitionOptions> = {}): this {
    const { duration = 500, easing = 'ease-in-out', onComplete } = options;
    
    this.startTransition({
      zoom: this.clampZoom(level),
    }, duration, easing, onComplete);
    
    return this;
  }

  /**
   * Rotate camera with smooth transition
   */
  rotateTo(degrees: number, options: Partial<TransitionOptions> = {}): this {
    const { duration = 500, easing = 'ease-in-out', onComplete } = options;
    
    this.startTransition({
      rotation: degrees,
    }, duration, easing, onComplete);
    
    return this;
  }

  /**
   * Apply a camera angle preset
   */
  setAngle(angle: CameraAngle, options: Partial<TransitionOptions> = {}): this {
    const preset = CAMERA_ANGLE_PRESETS[angle];
    const { duration = 500, easing = 'ease-in-out', onComplete } = options;
    
    this.startTransition({
      ...preset,
      angle,
    }, duration, easing, onComplete);
    
    return this;
  }

  /**
   * Hard cut to new scene/position (no transition)
   */
  cutTo(state: Partial<CameraState>): this {
    this.targetState = null;
    this.state = { 
      ...this.state, 
      ...state,
      x: state.x !== undefined ? this.clampX(state.x) : this.state.x,
      y: state.y !== undefined ? this.clampY(state.y) : this.state.y,
      zoom: state.zoom !== undefined ? this.clampZoom(state.zoom) : this.state.zoom,
    };
    this.emitUpdate();
    return this;
  }

  /**
   * Cut to a completely new scene
   */
  cutToScene(sceneState: Partial<CameraState>): this {
    // Reset follow target on scene change
    this.followTarget = null;
    return this.cutTo(sceneState);
  }

  // ==========================================
  // FOLLOW SYSTEM
  // ==========================================

  /**
   * Follow a target (character, object, etc.)
   */
  follow(target: CameraTarget, offset: { x: number; y: number } = { x: 0, y: 0 }): this {
    this.followTarget = target;
    this.followOffset = offset;
    return this;
  }

  /**
   * Stop following current target
   */
  unfollow(): this {
    this.followTarget = null;
    return this;
  }

  /**
   * Set follow smoothing (0 = instant, 1 = very slow)
   */
  setFollowSmoothing(value: number): this {
    this.followSmoothing = Math.max(0, Math.min(1, value));
    return this;
  }

  /**
   * Update follow position (call in animation loop)
   */
  private updateFollow(deltaTime: number): void {
    if (!this.followTarget) return;

    const targetX = -this.followTarget.x + this.followOffset.x;
    const targetY = -this.followTarget.y + this.followOffset.y;

    // Smooth interpolation
    const smoothFactor = 1 - Math.pow(this.followSmoothing, deltaTime / 16);
    
    this.state.x = this.clampX(this.state.x + (targetX - this.state.x) * smoothFactor);
    this.state.y = this.clampY(this.state.y + (targetY - this.state.y) * smoothFactor);
  }

  // ==========================================
  // EFFECTS
  // ==========================================

  /**
   * Start camera shake effect
   */
  shake(intensity: 'light' | 'medium' | 'heavy' = 'medium', duration: number = 500): this {
    this.shakeIntensity = `shake-${intensity}` as CameraEffect;
    this.shakeDuration = duration;
    this.shakeStartTime = performance.now();
    this.state.effect = this.shakeIntensity;
    this.onShakeStart?.();
    return this;
  }

  /**
   * Stop camera shake
   */
  stopShake(): this {
    this.shakeIntensity = 'none';
    this.shakeDuration = 0;
    this.state.effect = 'none';
    this.onShakeEnd?.();
    return this;
  }

  /**
   * Apply pulse effect (rhythmic zoom)
   */
  pulse(bpm: number = 80): this {
    this.state.effect = 'pulse';
    return this;
  }

  /**
   * Apply wobble effect (dream sequence)
   */
  wobble(): this {
    this.state.effect = 'wobble';
    return this;
  }

  /**
   * Clear all effects
   */
  clearEffects(): this {
    this.state.effect = 'none';
    this.shakeIntensity = 'none';
    return this;
  }

  // ==========================================
  // PARALLAX
  // ==========================================

  /**
   * Add a parallax layer
   */
  addParallaxLayer(layer: ParallaxLayer): this {
    this.parallaxLayers.push(layer);
    this.parallaxLayers.sort((a, b) => b.depth - a.depth); // Sort by depth
    return this;
  }

  /**
   * Remove a parallax layer
   */
  removeParallaxLayer(id: string): this {
    this.parallaxLayers = this.parallaxLayers.filter(l => l.id !== id);
    return this;
  }

  /**
   * Get parallax offset for a layer
   */
  getParallaxOffset(depth: number): { x: number; y: number } {
    const parallaxFactor = 1 - depth; // 0 depth = full movement, 1 depth = no movement
    return {
      x: this.state.x * parallaxFactor,
      y: this.state.y * parallaxFactor,
    };
  }

  /**
   * Update all parallax layers
   */
  private updateParallax(): void {
    for (const layer of this.parallaxLayers) {
      if (layer.element) {
        const offset = this.getParallaxOffset(layer.depth);
        layer.element.style.transform = `translate(${offset.x}%, ${offset.y}%)`;
      }
    }
  }

  // ==========================================
  // BOUNDS
  // ==========================================

  /**
   * Set camera bounds
   */
  setBounds(bounds: CameraBounds): this {
    this.bounds = bounds;
    return this;
  }

  /**
   * Clear camera bounds
   */
  clearBounds(): this {
    this.bounds = null;
    return this;
  }

  private clampX(x: number): number {
    if (!this.bounds) return x;
    return Math.max(this.bounds.minX, Math.min(this.bounds.maxX, x));
  }

  private clampY(y: number): number {
    if (!this.bounds) return y;
    return Math.max(this.bounds.minY, Math.min(this.bounds.maxY, y));
  }

  private clampZoom(zoom: number): number {
    if (!this.bounds) return Math.max(0.1, Math.min(5, zoom));
    return Math.max(this.bounds.minZoom, Math.min(this.bounds.maxZoom, zoom));
  }

  // ==========================================
  // TRANSITIONS
  // ==========================================

  private startTransition(
    targetState: Partial<CameraState>,
    duration: number,
    easing: CameraState['easing'],
    onComplete?: () => void
  ): void {
    this.targetState = { ...this.state, ...targetState };
    this.transitionStartTime = performance.now();
    this.transitionDuration = duration;
    this.transitionEasing = easing;
    this.onTransitionComplete = onComplete || null;
  }

  private updateTransition(currentTime: number): void {
    if (!this.targetState) return;

    const elapsed = currentTime - this.transitionStartTime;
    const progress = Math.min(1, elapsed / this.transitionDuration);

    this.state = interpolateCameraState(
      this.state,
      this.targetState,
      progress,
      this.transitionEasing
    );

    if (progress >= 1) {
      this.state = { ...this.state, ...this.targetState };
      this.targetState = null;
      this.onTransitionComplete?.();
      this.onTransitionComplete = null;
    }
  }

  // ==========================================
  // UPDATE LOOP
  // ==========================================

  /**
   * Update camera state (call every frame)
   */
  update(currentTime: number = performance.now()): CameraState {
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    // Update transition
    this.updateTransition(currentTime);

    // Update follow
    this.updateFollow(deltaTime);

    // Update shake
    if (this.shakeIntensity !== 'none') {
      const shakeElapsed = currentTime - this.shakeStartTime;
      if (shakeElapsed >= this.shakeDuration) {
        this.stopShake();
      }
    }

    // Update parallax
    this.updateParallax();

    // Emit update
    this.emitUpdate();

    return this.currentState;
  }

  /**
   * Start automatic update loop
   */
  startUpdateLoop(): this {
    const loop = () => {
      this.update();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
    return this;
  }

  /**
   * Stop automatic update loop
   */
  stopUpdateLoop(): this {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    return this;
  }

  private emitUpdate(): void {
    this.onUpdate?.(this.currentState);
  }

  // ==========================================
  // OUTPUT TRANSFORMS
  // ==========================================

  /**
   * Get CSS transform string for the camera container
   */
  getCSSTransform(time: number = performance.now()): string {
    let { x, y, zoom, rotation } = this.state;

    // Apply effects
    if (this.state.effect.startsWith('shake')) {
      const shake = generateShakeValues(this.state.effect, time - this.shakeStartTime);
      x += shake.x;
      y += shake.y;
      rotation += shake.rotation;
    } else if (this.state.effect === 'pulse') {
      zoom *= generatePulseValues(time);
    } else if (this.state.effect === 'wobble') {
      const wobble = generateWobbleValues(time);
      x += wobble.x;
      y += wobble.y;
      rotation += wobble.rotation;
    }

    return `translate(${x}%, ${y}%) scale(${zoom}) rotate(${rotation}deg)`;
  }

  /**
   * Get transform matrix for PIXI.js container
   * Apply to container: container.setTransform(...)
   */
  getPIXITransform(viewportWidth: number, viewportHeight: number): {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    pivotX: number;
    pivotY: number;
  } {
    const time = performance.now();
    let { x, y, zoom, rotation } = this.state;

    // Apply effects
    if (this.state.effect.startsWith('shake')) {
      const shake = generateShakeValues(this.state.effect, time - this.shakeStartTime);
      x += shake.x;
      y += shake.y;
      rotation += shake.rotation;
    } else if (this.state.effect === 'pulse') {
      zoom *= generatePulseValues(time);
    } else if (this.state.effect === 'wobble') {
      const wobble = generateWobbleValues(time);
      x += wobble.x;
      y += wobble.y;
      rotation += wobble.rotation;
    }

    // Convert percentage to pixels
    const pixelX = (x / 100) * viewportWidth;
    const pixelY = (y / 100) * viewportHeight;

    return {
      x: viewportWidth / 2 + pixelX,
      y: viewportHeight / 2 + pixelY,
      scaleX: zoom,
      scaleY: zoom,
      rotation: (rotation * Math.PI) / 180, // Convert to radians
      pivotX: viewportWidth / 2,
      pivotY: viewportHeight / 2,
    };
  }

  /**
   * Get canvas 2D context transform
   */
  getCanvasTransform(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const transform = this.getPIXITransform(width, height);
    
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
    ctx.translate(transform.x, transform.y);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scaleX, transform.scaleY);
    ctx.translate(-transform.pivotX, -transform.pivotY);
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  /**
   * Cleanup and dispose
   */
  dispose(): void {
    this.stopUpdateLoop();
    this.followTarget = null;
    this.parallaxLayers = [];
    this.onUpdate = null;
    this.onShakeStart = null;
    this.onShakeEnd = null;
  }
}

// ==========================================
// FACTORY FUNCTIONS
// ==========================================

/**
 * Create a camera with common cartoon animation settings
 */
export function createCartoonCamera(): Camera {
  return new Camera({
    zoom: 1,
    angle: 'wide',
    easing: 'ease-in-out',
    transitionDuration: 500,
  });
}

/**
 * Create a camera sequence for dialogue scenes
 */
export function createDialogueCamera(speakerPositions: { x: number; y: number }[]): Camera {
  const camera = new Camera({ angle: 'medium', zoom: 1.2 });
  
  // Center between speakers
  if (speakerPositions.length > 0) {
    const avgX = speakerPositions.reduce((sum, p) => sum + p.x, 0) / speakerPositions.length;
    const avgY = speakerPositions.reduce((sum, p) => sum + p.y, 0) / speakerPositions.length;
    camera.setPosition(-avgX + 50, -avgY + 50);
  }
  
  return camera;
}

/**
 * Create a camera for action sequences
 */
export function createActionCamera(): Camera {
  return new Camera({
    zoom: 1.1,
    angle: 'medium',
    easing: 'ease-out',
    transitionDuration: 300,
  });
}

// ==========================================
// REACT HOOK (for use in components)
// ==========================================

import { useState, useEffect, useCallback, useRef } from 'react';

export function useCamera(initialState: Partial<CameraState> = {}) {
  const cameraRef = useRef<Camera | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>({
    ...DEFAULT_CAMERA_STATE,
    ...initialState,
  });

  useEffect(() => {
    const camera = new Camera(initialState);
    camera.onUpdate = (state) => setCameraState(state);
    camera.startUpdateLoop();
    cameraRef.current = camera;

    return () => {
      camera.dispose();
    };
  }, []);

  const panTo = useCallback((x: number, y: number, options?: Partial<TransitionOptions>) => {
    cameraRef.current?.panTo(x, y, options);
  }, []);

  const zoomTo = useCallback((level: number, options?: Partial<TransitionOptions>) => {
    cameraRef.current?.zoomTo(level, options);
  }, []);

  const setAngle = useCallback((angle: CameraAngle, options?: Partial<TransitionOptions>) => {
    cameraRef.current?.setAngle(angle, options);
  }, []);

  const shake = useCallback((intensity?: 'light' | 'medium' | 'heavy', duration?: number) => {
    cameraRef.current?.shake(intensity, duration);
  }, []);

  const follow = useCallback((target: CameraTarget, offset?: { x: number; y: number }) => {
    cameraRef.current?.follow(target, offset);
  }, []);

  const cutTo = useCallback((state: Partial<CameraState>) => {
    cameraRef.current?.cutTo(state);
  }, []);

  return {
    state: cameraState,
    camera: cameraRef.current,
    panTo,
    zoomTo,
    setAngle,
    shake,
    follow,
    cutTo,
    getCSSTransform: () => cameraRef.current?.getCSSTransform() || '',
  };
}
