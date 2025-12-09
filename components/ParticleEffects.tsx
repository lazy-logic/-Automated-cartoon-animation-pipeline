'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Cloud,
  Snowflake,
  Heart,
  Star,
  Droplets,
  Leaf,
  Wind,
} from 'lucide-react';
import {
  ParticleSystem,
  ParticleType,
  Particle,
  PARTICLE_PRESETS,
  SCENE_EFFECTS,
  getParticleSystem,
} from '@/lib/particle-system';

interface ParticleEffectsProps {
  activeEffect?: string;
  customEmitters?: {
    type: ParticleType;
    x: number;
    y: number;
    rate: number;
  }[];
  width?: number;
  height?: number;
  className?: string;
}

export default function ParticleEffects({
  activeEffect,
  customEmitters = [],
  width = 100,
  height = 100,
  className = '',
}: ParticleEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationFrameRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    particleSystemRef.current = getParticleSystem();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Setup effect emitters
  useEffect(() => {
    const system = particleSystemRef.current;
    if (!system) return;

    // Clear existing emitters
    system.clear();

    // Add effect emitters
    if (activeEffect) {
      const effect = SCENE_EFFECTS.find(e => e.id === activeEffect);
      if (effect) {
        effect.emitters.forEach(emitter => {
          system.addEmitter({
            ...emitter,
            x: (emitter.x / 100) * width,
            y: (emitter.y / 100) * height,
            width: (emitter.width / 100) * width,
            height: (emitter.height / 100) * height,
          });
        });
        setIsActive(true);
      }
    }

    // Add custom emitters
    customEmitters.forEach(emitter => {
      system.addEmitter({
        type: emitter.type,
        x: (emitter.x / 100) * width,
        y: (emitter.y / 100) * height,
        width: 20,
        height: 20,
        rate: emitter.rate,
        active: true,
        config: PARTICLE_PRESETS[emitter.type],
      });
    });

    if (customEmitters.length > 0) {
      setIsActive(true);
    }
  }, [activeEffect, customEmitters, width, height]);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const system = particleSystemRef.current;

    if (!canvas || !ctx || !system) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = system.update();

      for (const particle of particles) {
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);

        // Draw particle based on shape
        ctx.fillStyle = particle.color;
        
        switch (particle.shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'square':
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            break;
          case 'star':
            drawStar(ctx, 0, 0, 5, particle.size / 2, particle.size / 4);
            break;
          case 'heart':
            drawHeart(ctx, 0, 0, particle.size);
            break;
          case 'triangle':
            drawTriangle(ctx, 0, 0, particle.size);
            break;
          default:
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`pointer-events-none ${className}`}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}

// Helper drawing functions
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s / 4);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s / 4);
  ctx.bezierCurveTo(x - s, y + s / 2, x, y + s, x, y + s);
  ctx.bezierCurveTo(x, y + s, x + s, y + s / 2, x + s, y + s / 4);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s / 4);
  ctx.fill();
}

function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const h = (size * Math.sqrt(3)) / 2;
  ctx.beginPath();
  ctx.moveTo(x, y - h / 2);
  ctx.lineTo(x - size / 2, y + h / 2);
  ctx.lineTo(x + size / 2, y + h / 2);
  ctx.closePath();
  ctx.fill();
}

// Effect picker component
interface EffectPickerProps {
  selectedEffect: string | null;
  onSelectEffect: (effectId: string | null) => void;
}

export function EffectPicker({ selectedEffect, onSelectEffect }: EffectPickerProps) {
  const effectIcons: Record<string, React.ReactNode> = {
    celebration: <Sparkles className="w-4 h-4" />,
    magic: <Star className="w-4 h-4" />,
    rain: <Droplets className="w-4 h-4" />,
    snow: <Snowflake className="w-4 h-4" />,
    love: <Heart className="w-4 h-4" />,
    forest: <Leaf className="w-4 h-4" />,
    underwater: <Droplets className="w-4 h-4" />,
    dusty: <Wind className="w-4 h-4" />,
  };

  return (
    <div className="space-y-2">
      <h4 className="text-white text-sm font-medium flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        Scene Effects
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {/* None option */}
        <button
          onClick={() => onSelectEffect(null)}
          className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
            selectedEffect === null
              ? 'border-purple-500 bg-purple-500/20'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <span className="text-lg">✕</span>
          <span className="text-[10px] text-gray-400">None</span>
        </button>

        {SCENE_EFFECTS.map(effect => (
          <button
            key={effect.id}
            onClick={() => onSelectEffect(effect.id)}
            className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
              selectedEffect === effect.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
            title={effect.description}
          >
            <span className="text-lg">{effect.icon}</span>
            <span className="text-[10px] text-gray-400">{effect.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Burst trigger component
interface BurstTriggerProps {
  onBurst: (type: ParticleType, x: number, y: number, count: number) => void;
}

export function BurstTrigger({ onBurst }: BurstTriggerProps) {
  const burstTypes: { type: ParticleType; icon: string; name: string }[] = [
    { type: 'sparkle', icon: '✨', name: 'Sparkle' },
    { type: 'confetti', icon: '🎉', name: 'Confetti' },
    { type: 'hearts', icon: '💕', name: 'Hearts' },
    { type: 'stars', icon: '⭐', name: 'Stars' },
  ];

  return (
    <div className="flex gap-2">
      {burstTypes.map(({ type, icon, name }) => (
        <button
          key={type}
          onClick={() => onBurst(type, 50, 50, 20)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          title={`Burst ${name}`}
        >
          <span>{icon}</span>
          <span className="text-xs text-gray-300">{name}</span>
        </button>
      ))}
    </div>
  );
}
