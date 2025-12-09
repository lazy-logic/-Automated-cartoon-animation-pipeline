/**
 * Layer Control System
 * Inspired by LayerAnimate for layer-specific animation control
 * 
 * Enables independent control of different visual layers:
 * - Background layers (sky, mountains, ground)
 * - Midground layers (trees, props)
 * - Character layers
 * - Foreground layers (particles, effects)
 * - UI/Overlay layers
 */

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  zIndex: number;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  
  // Transform
  x: number;
  y: number;
  scale: number;
  rotation: number;
  
  // Animation
  parallaxSpeed: number;  // 0 = static, 1 = full movement
  animationSpeed: number; // Multiplier for layer animations
  
  // Effects
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  
  // Content
  content?: LayerContent;
}

export type LayerType = 
  | 'background'
  | 'environment'
  | 'character'
  | 'prop'
  | 'effect'
  | 'foreground'
  | 'ui';

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn';

export interface LayerContent {
  type: 'image' | 'svg' | 'component' | 'particles';
  data: any;
}

// Layer animation keyframe
export interface LayerKeyframe {
  time: number;
  properties: Partial<Layer>;
  easing?: string;
}

// Layer animation track
export interface LayerAnimation {
  layerId: string;
  keyframes: LayerKeyframe[];
  loop: boolean;
  duration: number;
}

// Scene composition with layers
export interface LayerComposition {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  animations: LayerAnimation[];
  duration: number;
}

// ============================================
// DEFAULT LAYER PRESETS
// ============================================

export const DEFAULT_LAYER_PRESETS: Record<string, Partial<Layer>> = {
  // Background layers
  sky: {
    type: 'background',
    zIndex: 0,
    parallaxSpeed: 0,
    blur: 0,
    opacity: 1,
  },
  distantMountains: {
    type: 'background',
    zIndex: 10,
    parallaxSpeed: 0.1,
    blur: 2,
    opacity: 0.8,
  },
  nearMountains: {
    type: 'background',
    zIndex: 20,
    parallaxSpeed: 0.2,
    blur: 1,
    opacity: 0.9,
  },
  
  // Environment layers
  trees: {
    type: 'environment',
    zIndex: 30,
    parallaxSpeed: 0.4,
    blur: 0,
    opacity: 1,
  },
  ground: {
    type: 'environment',
    zIndex: 40,
    parallaxSpeed: 0.6,
    blur: 0,
    opacity: 1,
  },
  
  // Character layer
  character: {
    type: 'character',
    zIndex: 50,
    parallaxSpeed: 1,
    blur: 0,
    opacity: 1,
  },
  
  // Foreground layers
  particles: {
    type: 'effect',
    zIndex: 60,
    parallaxSpeed: 1.2,
    blur: 0,
    opacity: 0.8,
  },
  foregroundProps: {
    type: 'foreground',
    zIndex: 70,
    parallaxSpeed: 1.5,
    blur: 3,
    opacity: 0.6,
  },
  
  // UI layer
  overlay: {
    type: 'ui',
    zIndex: 100,
    parallaxSpeed: 0,
    blur: 0,
    opacity: 1,
  },
};

// ============================================
// LAYER CREATION
// ============================================

let layerIdCounter = 0;

export function createLayer(
  name: string,
  type: LayerType,
  options: Partial<Layer> = {}
): Layer {
  const preset = Object.values(DEFAULT_LAYER_PRESETS).find(p => p.type === type) || {};
  
  return {
    id: `layer_${++layerIdCounter}`,
    name,
    type,
    zIndex: 50,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    parallaxSpeed: 1,
    animationSpeed: 1,
    blur: 0,
    brightness: 1,
    contrast: 1,
    saturation: 1,
    ...preset,
    ...options,
  };
}

// Create a standard scene composition with default layers
export function createSceneComposition(
  name: string,
  theme: 'meadow' | 'forest' | 'beach' | 'night' | 'bedroom' | 'park'
): LayerComposition {
  const layers: Layer[] = [
    createLayer('Sky', 'background', { ...DEFAULT_LAYER_PRESETS.sky }),
    createLayer('Distant Background', 'background', { ...DEFAULT_LAYER_PRESETS.distantMountains }),
    createLayer('Near Background', 'background', { ...DEFAULT_LAYER_PRESETS.nearMountains }),
    createLayer('Environment', 'environment', { ...DEFAULT_LAYER_PRESETS.trees }),
    createLayer('Ground', 'environment', { ...DEFAULT_LAYER_PRESETS.ground }),
    createLayer('Characters', 'character', { ...DEFAULT_LAYER_PRESETS.character }),
    createLayer('Particles', 'effect', { ...DEFAULT_LAYER_PRESETS.particles }),
    createLayer('Foreground', 'foreground', { ...DEFAULT_LAYER_PRESETS.foregroundProps }),
  ];
  
  // Apply theme-specific adjustments
  applyThemeToLayers(layers, theme);
  
  return {
    id: `comp_${Date.now()}`,
    name,
    width: 1920,
    height: 1080,
    layers,
    animations: [],
    duration: 5000,
  };
}

// Apply theme-specific settings to layers
function applyThemeToLayers(layers: Layer[], theme: string): void {
  switch (theme) {
    case 'night':
      // Darker, more atmospheric
      layers.forEach(layer => {
        if (layer.type === 'background') {
          layer.brightness = 0.6;
          layer.saturation = 0.8;
        }
      });
      break;
    case 'beach':
      // Brighter, more saturated
      layers.forEach(layer => {
        layer.brightness = 1.1;
        layer.saturation = 1.2;
      });
      break;
    case 'forest':
      // Green tint, slightly darker
      layers.forEach(layer => {
        if (layer.type === 'background') {
          layer.brightness = 0.9;
        }
      });
      break;
  }
}

// ============================================
// LAYER ANIMATION
// ============================================

// Animate layer properties over time
export function animateLayer(
  layer: Layer,
  animation: LayerAnimation,
  time: number
): Partial<Layer> {
  if (animation.keyframes.length === 0) return {};
  
  const { keyframes, duration, loop } = animation;
  
  // Handle looping
  let adjustedTime = time;
  if (loop && duration > 0) {
    adjustedTime = time % duration;
  }
  
  // Find surrounding keyframes
  let prevKeyframe = keyframes[0];
  let nextKeyframe = keyframes[keyframes.length - 1];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (adjustedTime >= keyframes[i].time && adjustedTime < keyframes[i + 1].time) {
      prevKeyframe = keyframes[i];
      nextKeyframe = keyframes[i + 1];
      break;
    }
  }
  
  // Calculate progress between keyframes
  const timeDiff = nextKeyframe.time - prevKeyframe.time;
  const progress = timeDiff > 0 
    ? (adjustedTime - prevKeyframe.time) / timeDiff 
    : 1;
  
  // Interpolate properties
  return interpolateLayerProperties(
    prevKeyframe.properties,
    nextKeyframe.properties,
    progress
  );
}

// Interpolate between layer property sets
function interpolateLayerProperties(
  from: Partial<Layer>,
  to: Partial<Layer>,
  t: number
): Partial<Layer> {
  const result: Partial<Layer> = {};
  
  const numericProps: (keyof Layer)[] = [
    'x', 'y', 'scale', 'rotation', 'opacity',
    'blur', 'brightness', 'contrast', 'saturation',
    'parallaxSpeed', 'animationSpeed'
  ];
  
  for (const prop of numericProps) {
    if (from[prop] !== undefined && to[prop] !== undefined) {
      const fromVal = from[prop] as number;
      const toVal = to[prop] as number;
      (result as any)[prop] = fromVal + (toVal - fromVal) * t;
    }
  }
  
  return result;
}

// ============================================
// LAYER EFFECTS
// ============================================

// Generate CSS filter string for layer effects
export function getLayerFilterCSS(layer: Layer): string {
  const filters: string[] = [];
  
  if (layer.blur > 0) {
    filters.push(`blur(${layer.blur}px)`);
  }
  if (layer.brightness !== 1) {
    filters.push(`brightness(${layer.brightness})`);
  }
  if (layer.contrast !== 1) {
    filters.push(`contrast(${layer.contrast})`);
  }
  if (layer.saturation !== 1) {
    filters.push(`saturate(${layer.saturation})`);
  }
  
  return filters.length > 0 ? filters.join(' ') : 'none';
}

// Generate CSS transform string for layer
export function getLayerTransformCSS(layer: Layer, parallaxOffset: number = 0): string {
  const x = layer.x + (parallaxOffset * layer.parallaxSpeed);
  return `translate(${x}px, ${layer.y}px) scale(${layer.scale}) rotate(${layer.rotation}deg)`;
}

// Get blend mode CSS value
export function getBlendModeCSS(blendMode: BlendMode): string {
  const blendModeMap: Record<BlendMode, string> = {
    'normal': 'normal',
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'soft-light': 'soft-light',
    'hard-light': 'hard-light',
    'color-dodge': 'color-dodge',
    'color-burn': 'color-burn',
  };
  return blendModeMap[blendMode] || 'normal';
}

// ============================================
// LAYER COMPOSITION UTILITIES
// ============================================

// Sort layers by z-index
export function sortLayersByZIndex(layers: Layer[]): Layer[] {
  return [...layers].sort((a, b) => a.zIndex - b.zIndex);
}

// Get visible layers
export function getVisibleLayers(layers: Layer[]): Layer[] {
  return layers.filter(layer => layer.visible && layer.opacity > 0);
}

// Find layer by ID
export function findLayerById(layers: Layer[], id: string): Layer | undefined {
  return layers.find(layer => layer.id === id);
}

// Update layer in composition
export function updateLayer(
  composition: LayerComposition,
  layerId: string,
  updates: Partial<Layer>
): LayerComposition {
  return {
    ...composition,
    layers: composition.layers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ),
  };
}

// Add layer to composition
export function addLayer(
  composition: LayerComposition,
  layer: Layer
): LayerComposition {
  return {
    ...composition,
    layers: sortLayersByZIndex([...composition.layers, layer]),
  };
}

// Remove layer from composition
export function removeLayer(
  composition: LayerComposition,
  layerId: string
): LayerComposition {
  return {
    ...composition,
    layers: composition.layers.filter(layer => layer.id !== layerId),
  };
}

// Duplicate layer
export function duplicateLayer(
  composition: LayerComposition,
  layerId: string
): LayerComposition {
  const layer = findLayerById(composition.layers, layerId);
  if (!layer) return composition;
  
  const newLayer: Layer = {
    ...layer,
    id: `layer_${++layerIdCounter}`,
    name: `${layer.name} (Copy)`,
    zIndex: layer.zIndex + 1,
  };
  
  return addLayer(composition, newLayer);
}
