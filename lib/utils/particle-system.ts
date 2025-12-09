// Particle Effects System for visual effects

export type ParticleType = 
  | 'sparkle' 
  | 'confetti' 
  | 'rain' 
  | 'snow' 
  | 'magic' 
  | 'hearts' 
  | 'stars' 
  | 'bubbles'
  | 'leaves'
  | 'fireflies'
  | 'dust'
  | 'smoke';

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  life: number;
  maxLife: number;
  type: ParticleType;
  shape?: 'circle' | 'square' | 'star' | 'heart' | 'triangle';
}

export interface ParticleEmitter {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  width: number;
  height: number;
  rate: number; // particles per second
  burst?: number; // instant burst count
  active: boolean;
  config: ParticleConfig;
}

export interface ParticleConfig {
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  minLife: number;
  maxLife: number;
  gravity: number;
  wind: number;
  colors: string[];
  fadeIn: boolean;
  fadeOut: boolean;
  spin: boolean;
  spread: number; // angle spread in degrees
  direction: number; // base direction in degrees
}

// Preset configurations for different particle types
export const PARTICLE_PRESETS: Record<ParticleType, ParticleConfig> = {
  sparkle: {
    minSize: 2,
    maxSize: 6,
    minSpeed: 20,
    maxSpeed: 60,
    minLife: 500,
    maxLife: 1500,
    gravity: -10,
    wind: 0,
    colors: ['#FFD700', '#FFF8DC', '#FFFACD', '#FFFFE0', '#FFFFFF'],
    fadeIn: true,
    fadeOut: true,
    spin: true,
    spread: 360,
    direction: -90,
  },
  confetti: {
    minSize: 6,
    maxSize: 12,
    minSpeed: 100,
    maxSpeed: 200,
    minLife: 2000,
    maxLife: 4000,
    gravity: 50,
    wind: 20,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
    fadeIn: false,
    fadeOut: true,
    spin: true,
    spread: 60,
    direction: -90,
  },
  rain: {
    minSize: 2,
    maxSize: 4,
    minSpeed: 300,
    maxSpeed: 500,
    minLife: 1000,
    maxLife: 2000,
    gravity: 200,
    wind: 30,
    colors: ['#87CEEB', '#B0E0E6', '#ADD8E6'],
    fadeIn: false,
    fadeOut: true,
    spin: false,
    spread: 10,
    direction: 100,
  },
  snow: {
    minSize: 3,
    maxSize: 8,
    minSpeed: 20,
    maxSpeed: 50,
    minLife: 4000,
    maxLife: 8000,
    gravity: 20,
    wind: 15,
    colors: ['#FFFFFF', '#F0F8FF', '#F5F5F5'],
    fadeIn: true,
    fadeOut: true,
    spin: true,
    spread: 30,
    direction: 90,
  },
  magic: {
    minSize: 3,
    maxSize: 8,
    minSpeed: 30,
    maxSpeed: 80,
    minLife: 800,
    maxLife: 2000,
    gravity: -20,
    wind: 0,
    colors: ['#9B59B6', '#8E44AD', '#E91E63', '#FF69B4', '#DA70D6'],
    fadeIn: true,
    fadeOut: true,
    spin: true,
    spread: 360,
    direction: -90,
  },
  hearts: {
    minSize: 8,
    maxSize: 16,
    minSpeed: 40,
    maxSpeed: 80,
    minLife: 1500,
    maxLife: 3000,
    gravity: -30,
    wind: 10,
    colors: ['#FF69B4', '#FF1493', '#DC143C', '#FF6B6B'],
    fadeIn: true,
    fadeOut: true,
    spin: false,
    spread: 60,
    direction: -90,
  },
  stars: {
    minSize: 4,
    maxSize: 10,
    minSpeed: 20,
    maxSpeed: 50,
    minLife: 1000,
    maxLife: 2500,
    gravity: 0,
    wind: 0,
    colors: ['#FFD700', '#FFA500', '#FFFF00', '#FFFACD'],
    fadeIn: true,
    fadeOut: true,
    spin: true,
    spread: 360,
    direction: 0,
  },
  bubbles: {
    minSize: 6,
    maxSize: 20,
    minSpeed: 30,
    maxSpeed: 60,
    minLife: 2000,
    maxLife: 4000,
    gravity: -40,
    wind: 10,
    colors: ['rgba(135,206,250,0.6)', 'rgba(173,216,230,0.6)', 'rgba(176,224,230,0.6)'],
    fadeIn: true,
    fadeOut: true,
    spin: false,
    spread: 30,
    direction: -90,
  },
  leaves: {
    minSize: 8,
    maxSize: 16,
    minSpeed: 30,
    maxSpeed: 70,
    minLife: 3000,
    maxLife: 6000,
    gravity: 30,
    wind: 40,
    colors: ['#228B22', '#32CD32', '#90EE90', '#8B4513', '#D2691E', '#FF8C00'],
    fadeIn: false,
    fadeOut: true,
    spin: true,
    spread: 45,
    direction: 120,
  },
  fireflies: {
    minSize: 3,
    maxSize: 6,
    minSpeed: 10,
    maxSpeed: 30,
    minLife: 2000,
    maxLife: 5000,
    gravity: 0,
    wind: 0,
    colors: ['#FFFF00', '#ADFF2F', '#7FFF00'],
    fadeIn: true,
    fadeOut: true,
    spin: false,
    spread: 360,
    direction: 0,
  },
  dust: {
    minSize: 1,
    maxSize: 3,
    minSpeed: 5,
    maxSpeed: 15,
    minLife: 3000,
    maxLife: 6000,
    gravity: 2,
    wind: 5,
    colors: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.5)', 'rgba(200,200,200,0.4)'],
    fadeIn: true,
    fadeOut: true,
    spin: false,
    spread: 360,
    direction: 0,
  },
  smoke: {
    minSize: 10,
    maxSize: 30,
    minSpeed: 20,
    maxSpeed: 40,
    minLife: 2000,
    maxLife: 4000,
    gravity: -20,
    wind: 10,
    colors: ['rgba(128,128,128,0.3)', 'rgba(169,169,169,0.3)', 'rgba(192,192,192,0.2)'],
    fadeIn: true,
    fadeOut: true,
    spin: false,
    spread: 30,
    direction: -90,
  },
};

// Particle system manager
export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: ParticleEmitter[] = [];
  private lastUpdate: number = 0;
  private particleIdCounter: number = 0;

  constructor() {
    this.lastUpdate = Date.now();
  }

  // Add an emitter
  addEmitter(emitter: Omit<ParticleEmitter, 'id'>): string {
    const id = `emitter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.emitters.push({ ...emitter, id });
    return id;
  }

  // Remove an emitter
  removeEmitter(id: string): void {
    this.emitters = this.emitters.filter(e => e.id !== id);
  }

  // Trigger a burst of particles
  burst(type: ParticleType, x: number, y: number, count: number): void {
    const config = PARTICLE_PRESETS[type];
    for (let i = 0; i < count; i++) {
      this.createParticle(type, x, y, config);
    }
  }

  // Create a single particle
  private createParticle(type: ParticleType, x: number, y: number, config: ParticleConfig): void {
    const angle = (config.direction + (Math.random() - 0.5) * config.spread) * (Math.PI / 180);
    const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
    const life = config.minLife + Math.random() * (config.maxLife - config.minLife);

    const particle: Particle = {
      id: `particle-${this.particleIdCounter++}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      opacity: config.fadeIn ? 0 : 1,
      rotation: Math.random() * 360,
      rotationSpeed: config.spin ? (Math.random() - 0.5) * 360 : 0,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      life,
      maxLife: life,
      type,
      shape: this.getShapeForType(type),
    };

    this.particles.push(particle);
  }

  // Get shape based on particle type
  private getShapeForType(type: ParticleType): Particle['shape'] {
    switch (type) {
      case 'hearts': return 'heart';
      case 'stars': return 'star';
      case 'confetti': return Math.random() > 0.5 ? 'square' : 'circle';
      case 'leaves': return 'triangle';
      default: return 'circle';
    }
  }

  // Update all particles
  update(): Particle[] {
    const now = Date.now();
    const delta = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Spawn particles from emitters
    for (const emitter of this.emitters) {
      if (!emitter.active) continue;

      const particlesToSpawn = emitter.rate * delta;
      const wholeParticles = Math.floor(particlesToSpawn);
      const fractional = particlesToSpawn - wholeParticles;

      for (let i = 0; i < wholeParticles; i++) {
        const x = emitter.x + Math.random() * emitter.width;
        const y = emitter.y + Math.random() * emitter.height;
        this.createParticle(emitter.type, x, y, emitter.config);
      }

      if (Math.random() < fractional) {
        const x = emitter.x + Math.random() * emitter.width;
        const y = emitter.y + Math.random() * emitter.height;
        this.createParticle(emitter.type, x, y, emitter.config);
      }
    }

    // Update existing particles
    this.particles = this.particles.filter(p => {
      const config = PARTICLE_PRESETS[p.type];
      
      // Update position
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      
      // Apply gravity and wind
      p.vy += config.gravity * delta;
      p.vx += config.wind * delta;
      
      // Update rotation
      p.rotation += p.rotationSpeed * delta;
      
      // Update life
      p.life -= delta * 1000;
      
      // Update opacity
      const lifeRatio = p.life / p.maxLife;
      if (config.fadeIn && lifeRatio > 0.8) {
        p.opacity = (1 - lifeRatio) / 0.2;
      } else if (config.fadeOut && lifeRatio < 0.3) {
        p.opacity = lifeRatio / 0.3;
      } else {
        p.opacity = 1;
      }
      
      return p.life > 0;
    });

    return this.particles;
  }

  // Get all particles
  getParticles(): Particle[] {
    return this.particles;
  }

  // Clear all particles
  clear(): void {
    this.particles = [];
  }

  // Get emitter by ID
  getEmitter(id: string): ParticleEmitter | undefined {
    return this.emitters.find(e => e.id === id);
  }

  // Update emitter
  updateEmitter(id: string, updates: Partial<ParticleEmitter>): void {
    const emitter = this.emitters.find(e => e.id === id);
    if (emitter) {
      Object.assign(emitter, updates);
    }
  }
}

// Singleton instance
let particleSystemInstance: ParticleSystem | null = null;

export function getParticleSystem(): ParticleSystem {
  if (!particleSystemInstance) {
    particleSystemInstance = new ParticleSystem();
  }
  return particleSystemInstance;
}

// Scene effect presets
export interface SceneEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  emitters: Omit<ParticleEmitter, 'id'>[];
}

export const SCENE_EFFECTS: SceneEffect[] = [
  {
    id: 'celebration',
    name: 'Celebration',
    description: 'Confetti and sparkles for happy moments',
    icon: '🎉',
    emitters: [
      {
        type: 'confetti',
        x: 0,
        y: -20,
        width: 100,
        height: 10,
        rate: 30,
        active: true,
        config: PARTICLE_PRESETS.confetti,
      },
      {
        type: 'sparkle',
        x: 20,
        y: 20,
        width: 60,
        height: 60,
        rate: 10,
        active: true,
        config: PARTICLE_PRESETS.sparkle,
      },
    ],
  },
  {
    id: 'magic',
    name: 'Magic',
    description: 'Magical sparkles and stars',
    icon: '✨',
    emitters: [
      {
        type: 'magic',
        x: 30,
        y: 30,
        width: 40,
        height: 40,
        rate: 15,
        active: true,
        config: PARTICLE_PRESETS.magic,
      },
      {
        type: 'stars',
        x: 20,
        y: 20,
        width: 60,
        height: 60,
        rate: 5,
        active: true,
        config: PARTICLE_PRESETS.stars,
      },
    ],
  },
  {
    id: 'rain',
    name: 'Rainy Day',
    description: 'Gentle rain effect',
    icon: '🌧️',
    emitters: [
      {
        type: 'rain',
        x: 0,
        y: -10,
        width: 100,
        height: 5,
        rate: 100,
        active: true,
        config: PARTICLE_PRESETS.rain,
      },
    ],
  },
  {
    id: 'snow',
    name: 'Snowy',
    description: 'Peaceful snowfall',
    icon: '❄️',
    emitters: [
      {
        type: 'snow',
        x: 0,
        y: -10,
        width: 100,
        height: 5,
        rate: 20,
        active: true,
        config: PARTICLE_PRESETS.snow,
      },
    ],
  },
  {
    id: 'love',
    name: 'Love',
    description: 'Floating hearts',
    icon: '💕',
    emitters: [
      {
        type: 'hearts',
        x: 20,
        y: 80,
        width: 60,
        height: 10,
        rate: 5,
        active: true,
        config: PARTICLE_PRESETS.hearts,
      },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Falling leaves and fireflies',
    icon: '🍃',
    emitters: [
      {
        type: 'leaves',
        x: 0,
        y: -10,
        width: 100,
        height: 5,
        rate: 3,
        active: true,
        config: PARTICLE_PRESETS.leaves,
      },
      {
        type: 'fireflies',
        x: 10,
        y: 40,
        width: 80,
        height: 40,
        rate: 2,
        active: true,
        config: PARTICLE_PRESETS.fireflies,
      },
    ],
  },
  {
    id: 'underwater',
    name: 'Underwater',
    description: 'Bubbles rising up',
    icon: '🫧',
    emitters: [
      {
        type: 'bubbles',
        x: 10,
        y: 90,
        width: 80,
        height: 10,
        rate: 8,
        active: true,
        config: PARTICLE_PRESETS.bubbles,
      },
    ],
  },
  {
    id: 'dusty',
    name: 'Dusty',
    description: 'Floating dust particles',
    icon: '💨',
    emitters: [
      {
        type: 'dust',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rate: 10,
        active: true,
        config: PARTICLE_PRESETS.dust,
      },
    ],
  },
];
