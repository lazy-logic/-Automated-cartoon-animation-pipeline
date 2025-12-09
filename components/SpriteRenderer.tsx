'use client';

import React from 'react';
import { CHARACTER_SPRITES, type CharacterSprite } from '@/lib/sprites';
import type { CharacterInstance } from '@/lib/types';

interface SpriteRendererProps {
  character: CharacterInstance;
  width: number;
  height: number;
  time: number;
  isSelected?: boolean;
  isTalking?: boolean;
}

// Image cache for loaded SVG sprites
const spriteImageCache = new Map<string, HTMLImageElement>();

/**
 * Load an SVG sprite image (with caching)
 */
export function loadSpriteImage(svgFile: string): Promise<HTMLImageElement> {
  if (spriteImageCache.has(svgFile)) {
    return Promise.resolve(spriteImageCache.get(svgFile)!);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      spriteImageCache.set(svgFile, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = svgFile;
  });
}

/**
 * Renders a character sprite using SVG file
 * Uses image-based rendering for better quality
 */
export function renderSpriteToCanvas(
  ctx: CanvasRenderingContext2D,
  character: CharacterInstance,
  sprite: CharacterSprite,
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  isSelected: boolean = false,
  isTalking: boolean = false
) {
  const x = (character.x / 100) * canvasWidth;
  const y = (character.y / 100) * canvasHeight;
  const scale = character.scale;
  
  // Get cached image or load it
  const cachedImage = spriteImageCache.get(sprite.svgFile);
  
  if (!cachedImage) {
    // Start loading the image
    loadSpriteImage(sprite.svgFile);
    
    // Draw placeholder while loading
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(0, 0, 30 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#999';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Loading...', 0, 5);
    ctx.restore();
    return;
  }
  
  ctx.save();
  ctx.translate(x, y);
  
  // Flip if needed
  if (character.flipX) {
    ctx.scale(-1, 1);
  }
  
  // Calculate dimensions maintaining aspect ratio
  const aspectRatio = sprite.width / sprite.height;
  const drawHeight = 150 * scale;
  const drawWidth = drawHeight * aspectRatio;
  
  // Apply subtle animation (breathing/idle)
  const breatheOffset = Math.sin(time / 1000) * 2;
  const bounceOffset = Math.sin(time / 500) * (isTalking ? 3 : 0);
  
  // Draw the sprite image
  ctx.drawImage(
    cachedImage,
    -drawWidth / 2,
    -drawHeight / 2 + breatheOffset + bounceOffset,
    drawWidth,
    drawHeight
  );
  
  // Selection indicator
  if (isSelected) {
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-drawWidth / 2 - 5, -drawHeight / 2 - 5, drawWidth + 10, drawHeight + 10);
    ctx.setLineDash([]);
  }
  
  // Draw name label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 12px system-ui, sans-serif';
  const textWidth = ctx.measureText(character.name).width;
  ctx.beginPath();
  ctx.roundRect(-textWidth / 2 - 6, drawHeight / 2 + 5, textWidth + 12, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(character.name, 0, drawHeight / 2 + 19);
  
  ctx.restore();
}

/**
 * Check if a character uses a sprite template
 */
export function isSpriteCharacter(templateId: string): boolean {
  return templateId.startsWith('sprite-');
}

/**
 * Get sprite by template ID
 */
export function getSpriteForCharacter(templateId: string): CharacterSprite | undefined {
  return CHARACTER_SPRITES.find(s => s.id === templateId);
}

/**
 * React component for rendering a sprite (for use outside canvas)
 */
export default function SpriteRenderer({
  character,
  width,
  height,
  isSelected = false,
}: SpriteRendererProps) {
  const sprite = getSpriteForCharacter(character.templateId);
  
  if (!sprite) {
    return null;
  }
  
  const scale = character.scale;
  
  return (
    <div
      className={`absolute transition-transform ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
      style={{
        left: `${character.x}%`,
        top: `${character.y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) ${character.flipX ? 'scaleX(-1)' : ''}`,
      }}
    >
      <img
        src={sprite.svgFile}
        alt={sprite.name}
        width={width}
        height={height}
        className="drop-shadow-lg object-contain"
      />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-white/90 rounded text-xs font-medium whitespace-nowrap">
        {character.name}
      </div>
    </div>
  );
}
