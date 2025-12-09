'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useStudioStore } from '@/lib/utils/store';
import { CHARACTER_TEMPLATES, BACKGROUND_TEMPLATES, EXPRESSION_CONFIGS, SVG_BACKGROUNDS } from '@/lib/utils/templates';
import { CHARACTER_SPRITES } from '@/lib/utils/sprites';
import { isSpriteCharacter, getSpriteForCharacter, renderSpriteToCanvas } from '@/components/shared/SpriteRenderer';
import type { CharacterInstance, Expression, Scene } from '@/lib/utils/types';

interface AnimationCanvasProps {
  scene: Scene;
  isPlaying: boolean;
  currentTime: number;
  onCharacterClick?: (characterId: string) => void;
  selectedCharacterId?: string | null;
  showControls?: boolean;
}

// Draw a cartoon character using Canvas 2D
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  character: CharacterInstance,
  template: typeof CHARACTER_TEMPLATES[0],
  canvasWidth: number,
  canvasHeight: number,
  time: number,
  isSelected: boolean,
  isTalking: boolean
) {
  const x = (character.x / 100) * canvasWidth;
  const y = (character.y / 100) * canvasHeight;
  const scale = character.scale * 1.2;
  const flipX = character.flipX ? -1 : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX * scale, scale);

  // Idle animation - gentle floating
  const floatOffset = Math.sin(time / 500 + character.x) * 3;
  ctx.translate(0, floatOffset);

  const expressionConfig = EXPRESSION_CONFIGS[character.expression] || EXPRESSION_CONFIGS.neutral;

  // Selection highlight
  if (isSelected) {
    ctx.shadowColor = '#3B82F6';
    ctx.shadowBlur = 20;
  }

  // Body
  ctx.fillStyle = template.primaryColor;
  ctx.beginPath();
  ctx.ellipse(0, 20, 28, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Body detail/shirt
  ctx.fillStyle = template.secondaryColor;
  ctx.beginPath();
  ctx.ellipse(0, 15, 22, 25, 0, 0, Math.PI);
  ctx.fill();

  // Arms with animation
  const armSwing = Math.sin(time / 300) * 5;
  
  // Left arm
  ctx.save();
  ctx.translate(-25, 10);
  ctx.rotate((armSwing * Math.PI) / 180);
  ctx.fillStyle = template.skinColor;
  ctx.beginPath();
  ctx.ellipse(0, 15, 8, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(25, 10);
  ctx.rotate((-armSwing * Math.PI) / 180);
  ctx.fillStyle = template.skinColor;
  ctx.beginPath();
  ctx.ellipse(0, 15, 8, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Legs
  ctx.fillStyle = template.primaryColor;
  // Left leg
  ctx.beginPath();
  ctx.ellipse(-12, 55, 10, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.ellipse(12, 55, 10, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Feet
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(-12, 70, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, 70, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = template.skinColor;
  ctx.beginPath();
  ctx.ellipse(0, -30, 32, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Hair (for human characters)
  if (template.category === 'human') {
    ctx.fillStyle = template.id === 'luna' ? '#8B4513' : '#4A4A4A';
    ctx.beginPath();
    ctx.ellipse(0, -48, 28, 15, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Hair strands
    ctx.beginPath();
    ctx.moveTo(-20, -45);
    ctx.quadraticCurveTo(-25, -55, -18, -58);
    ctx.quadraticCurveTo(-10, -60, 0, -58);
    ctx.quadraticCurveTo(10, -60, 18, -58);
    ctx.quadraticCurveTo(25, -55, 20, -45);
    ctx.fill();
  }

  // Ears for animals
  if (template.category === 'animal') {
    ctx.fillStyle = template.skinColor;
    // Left ear
    ctx.beginPath();
    ctx.ellipse(-22, -50, 10, 15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Right ear
    ctx.beginPath();
    ctx.ellipse(22, -50, 10, 15, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Robot antenna
  if (template.category === 'robot') {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -55);
    ctx.lineTo(0, -70);
    ctx.stroke();
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(0, -73, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyes
  const eyeScale = expressionConfig.eyeScale;
  const eyeY = -32 + expressionConfig.eyebrowY;
  
  // Eye whites
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(-12, eyeY, 10 * eyeScale, 12 * eyeScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, eyeY, 10 * eyeScale, 12 * eyeScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-12, eyeY, 10 * eyeScale, 12 * eyeScale, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Pupils with blink animation
  const blinkPhase = Math.sin(time / 2000) > 0.95 ? 0.1 : 1;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(-12, eyeY + 2, 5, 6 * blinkPhase, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, eyeY + 2, 5, 6 * blinkPhase, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(-14, eyeY - 2, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, eyeY - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows based on expression
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  if (character.expression === 'angry') {
    ctx.beginPath();
    ctx.moveTo(-20, eyeY - 15);
    ctx.lineTo(-5, eyeY - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, eyeY - 15);
    ctx.lineTo(5, eyeY - 10);
    ctx.stroke();
  } else if (character.expression === 'sad') {
    ctx.beginPath();
    ctx.moveTo(-20, eyeY - 10);
    ctx.lineTo(-5, eyeY - 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, eyeY - 10);
    ctx.lineTo(5, eyeY - 15);
    ctx.stroke();
  }

  // Blush for happy expression
  if (character.expression === 'happy') {
    ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
    ctx.beginPath();
    ctx.ellipse(-20, -18, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(20, -18, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose
  ctx.fillStyle = template.skinColor;
  ctx.beginPath();
  ctx.ellipse(0, -20, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Mouth with expression and lip-sync
  const mouthY = -8;
  const mouthWidth = 20 * expressionConfig.mouthWidth;
  let mouthHeight = 8 * expressionConfig.mouthHeight;
  
  // Lip sync animation when talking
  if (isTalking) {
    const lipSync = Math.sin(time / 80) * 0.5 + 0.5;
    mouthHeight = 8 + lipSync * 12;
  }

  ctx.fillStyle = character.expression === 'happy' || isTalking ? '#FF6B6B' : '#333';
  ctx.beginPath();
  
  if (expressionConfig.mouthCurve > 0 || character.expression === 'happy') {
    // Smile
    ctx.ellipse(0, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI);
  } else if (expressionConfig.mouthCurve < 0) {
    // Frown
    ctx.ellipse(0, mouthY + 5, mouthWidth, mouthHeight, 0, Math.PI, Math.PI * 2);
  } else if (character.expression === 'surprised' || isTalking) {
    // O shape
    ctx.ellipse(0, mouthY, mouthWidth * 0.6, mouthHeight, 0, 0, Math.PI * 2);
  } else {
    // Neutral line
    ctx.moveTo(-mouthWidth, mouthY);
    ctx.lineTo(mouthWidth, mouthY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333';
    ctx.stroke();
  }
  ctx.fill();

  // Character name label
  ctx.restore();
  
  ctx.save();
  ctx.translate(x, y + 85 * scale);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const textWidth = ctx.measureText(character.name).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(-textWidth / 2 - 8, -10, textWidth + 16, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.fillText(character.name, 0, 5);
  ctx.restore();
}

// Draw background with parallax layers
function drawBackground(
  ctx: CanvasRenderingContext2D,
  backgroundId: string,
  width: number,
  height: number,
  time: number,
  cameraX: number = 0
) {
  const template = BACKGROUND_TEMPLATES.find(b => b.id === backgroundId);
  if (!template) {
    // Fallback gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Draw each layer
  template.layers.forEach((layer, index) => {
    const parallaxOffset = cameraX * layer.parallaxSpeed;
    
    ctx.save();
    ctx.translate(-parallaxOffset, 0);

    if (layer.gradient) {
      // Parse gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      // Simple gradient parsing
      if (layer.gradient.includes('180deg')) {
        const colors = layer.gradient.match(/#[A-Fa-f0-9]{6}/g) || [];
        colors.forEach((color, i) => {
          gradient.addColorStop(i / Math.max(1, colors.length - 1), color);
        });
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width * 2, height);
    } else if (layer.color) {
      ctx.fillStyle = layer.color;
      
      // Different shapes for different layer types
      if (layer.id.includes('cloud')) {
        // Draw clouds
        const cloudY = height * 0.15;
        for (let i = 0; i < 5; i++) {
          const cloudX = ((i * 250 + time * 0.02 * (i + 1)) % (width + 200)) - 100;
          drawCloud(ctx, cloudX, cloudY + Math.sin(i) * 30, 60 + i * 10);
        }
      } else if (layer.id.includes('star')) {
        // Draw stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
          const starX = (i * 73) % width;
          const starY = (i * 47) % (height * 0.6);
          const twinkle = Math.sin(time / 500 + i) * 0.5 + 0.5;
          ctx.globalAlpha = 0.3 + twinkle * 0.7;
          ctx.beginPath();
          ctx.arc(starX, starY, 1 + twinkle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      } else if (layer.id.includes('hill') || layer.id.includes('tree')) {
        // Draw hills/trees
        const layerY = height * (0.5 + index * 0.1);
        ctx.beginPath();
        ctx.moveTo(-50, height);
        for (let x = -50; x <= width + 50; x += 30) {
          const hillHeight = Math.sin(x * 0.01 + index) * 40 + 60;
          ctx.lineTo(x, layerY - hillHeight);
        }
        ctx.lineTo(width + 50, height);
        ctx.closePath();
        ctx.fill();
      } else if (layer.id.includes('ground') || layer.id.includes('grass') || layer.id.includes('sand') || layer.id.includes('floor') || layer.id.includes('road') || layer.id.includes('path')) {
        // Ground layer
        const groundY = height * (template.groundLevel / 100);
        ctx.fillRect(0, groundY, width * 2, height - groundY);
        
        // Add some texture
        if (layer.id.includes('grass')) {
          ctx.fillStyle = '#1a7a1a';
          for (let x = 0; x < width; x += 8) {
            const grassHeight = 5 + Math.sin(x + time / 200) * 3;
            ctx.fillRect(x, groundY - grassHeight, 2, grassHeight);
          }
        }
      } else if (layer.id.includes('sun') || layer.id.includes('planet') || layer.id.includes('moon')) {
        // Celestial bodies
        const sunX = width * 0.8;
        const sunY = height * 0.15;
        const radius = layer.id.includes('planet') ? 60 : layer.id.includes('moon') ? 30 : 45;
        
        // Glow
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 2);
        glow.addColorStop(0, layer.color);
        glow.addColorStop(0.5, layer.color + '80');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.arc(sunX, sunY, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (layer.id.includes('wave') || layer.id.includes('ocean')) {
        // Water/waves
        const waveY = height * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 5) {
          const waveHeight = Math.sin(x * 0.02 + time / 300) * 10 + Math.sin(x * 0.01 - time / 500) * 5;
          ctx.lineTo(x, waveY + waveHeight);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      } else if (layer.id.includes('bubble')) {
        // Bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 20; i++) {
          const bubbleX = (i * 67) % width;
          const bubbleY = height - ((time / 10 + i * 50) % height);
          const size = 3 + (i % 5) * 2;
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (layer.id.includes('building')) {
        // Buildings
        const buildingY = height * 0.4;
        for (let i = 0; i < 8; i++) {
          const bx = i * (width / 8) + 20;
          const bh = 80 + (i * 37) % 100;
          const bw = 40 + (i * 23) % 30;
          ctx.fillRect(bx, buildingY + 150 - bh, bw, bh);
          
          // Windows
          ctx.fillStyle = '#FFE4B5';
          for (let wy = 0; wy < bh - 20; wy += 20) {
            for (let wx = 5; wx < bw - 10; wx += 15) {
              if (Math.random() > 0.3) {
                ctx.fillRect(bx + wx, buildingY + 150 - bh + wy + 10, 8, 12);
              }
            }
          }
          ctx.fillStyle = layer.color;
        }
      } else {
        // Default rectangle
        ctx.fillRect(0, height * 0.5, width * 2, height * 0.5);
      }
    }
    
    ctx.restore();
  });

  // Add vignette effect
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, height * 0.3,
    width / 2, height / 2, height
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

// Helper to draw a cloud
function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y + size * 0.15, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

export default function AnimationCanvas({
  scene,
  isPlaying,
  currentTime,
  onCharacterClick,
  selectedCharacterId,
  showControls = true,
}: AnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });
  const [isTalking, setIsTalking] = useState(false);
  const [svgImage, setSvgImage] = useState<HTMLImageElement | null>(null);
  const svgImageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Load SVG background image
  useEffect(() => {
    const svgBg = SVG_BACKGROUNDS.find(s => s.id === scene.backgroundId);
    if (svgBg) {
      // Check cache first
      if (svgImageCache.current.has(svgBg.file)) {
        setSvgImage(svgImageCache.current.get(svgBg.file)!);
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        svgImageCache.current.set(svgBg.file, img);
        setSvgImage(img);
      };
      img.src = svgBg.file;
    } else {
      setSvgImage(null);
    }
  }, [scene.backgroundId]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const aspectRatio = 16 / 9;
        let width = rect.width;
        let height = width / aspectRatio;
        
        if (height > rect.height) {
          height = rect.height;
          width = height * aspectRatio;
        }
        
        setDimensions({ width: Math.floor(width), height: Math.floor(height) });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = performance.now();

    const render = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current;
      const time = isPlaying ? elapsed : currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Check if using SVG background
      const svgBg = SVG_BACKGROUNDS.find(s => s.id === scene.backgroundId);
      
      if (svgBg && svgImage) {
        // Draw SVG background with animation effects
        ctx.save();
        
        // Ken Burns effect - slow pan and zoom
        const zoomAmount = 1 + Math.sin(time / 8000) * 0.05; // Subtle zoom
        const panX = Math.sin(time / 10000) * 20; // Slow horizontal pan
        const panY = Math.cos(time / 12000) * 10; // Slow vertical pan
        
        ctx.translate(dimensions.width / 2, dimensions.height / 2);
        ctx.scale(zoomAmount, zoomAmount);
        ctx.translate(-dimensions.width / 2 + panX, -dimensions.height / 2 + panY);
        
        // Draw the SVG image to fill the canvas
        const imgAspect = svgImage.width / svgImage.height;
        const canvasAspect = dimensions.width / dimensions.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          drawHeight = dimensions.height * 1.1; // Slightly larger for pan room
          drawWidth = drawHeight * imgAspect;
          drawX = (dimensions.width - drawWidth) / 2;
          drawY = (dimensions.height - drawHeight) / 2;
        } else {
          drawWidth = dimensions.width * 1.1;
          drawHeight = drawWidth / imgAspect;
          drawX = (dimensions.width - drawWidth) / 2;
          drawY = (dimensions.height - drawHeight) / 2;
        }
        
        ctx.drawImage(svgImage, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      } else {
        // Draw procedural background
        drawBackground(
          ctx,
          scene.backgroundId,
          dimensions.width,
          dimensions.height,
          time,
          scene.cameraPanX
        );
      }

      // Sort characters by zIndex
      const sortedCharacters = [...scene.characters].sort((a, b) => a.zIndex - b.zIndex);

      // Draw characters
      sortedCharacters.forEach((character) => {
        // Check if this is a sprite-based character
        if (isSpriteCharacter(character.templateId)) {
          const sprite = getSpriteForCharacter(character.templateId);
          if (sprite) {
            renderSpriteToCanvas(
              ctx,
              character,
              sprite,
              dimensions.width,
              dimensions.height,
              time,
              character.id === selectedCharacterId,
              isTalking && character.expression === 'talking'
            );
          }
        } else {
          // Regular template-based character
          const template = CHARACTER_TEMPLATES.find((t) => t.id === character.templateId);
          if (template) {
            drawCharacter(
              ctx,
              character,
              template,
              dimensions.width,
              dimensions.height,
              time,
              character.id === selectedCharacterId,
              isTalking && character.expression === 'talking'
            );
          }
        }
      });

      // Scene title overlay
      if (showControls) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, dimensions.height - 80, dimensions.width, 80);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.fillText(scene.title, 20, dimensions.height - 50);
        
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const description = scene.description.length > 100 
          ? scene.description.substring(0, 100) + '...' 
          : scene.description;
        ctx.fillText(description, 20, dimensions.height - 25);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [scene, isPlaying, currentTime, dimensions, selectedCharacterId, isTalking, showControls, svgImage]);

  // Handle click on canvas to select characters
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onCharacterClick) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Find clicked character (simple hit detection)
      const clickedCharacter = scene.characters.find((char) => {
        const dx = Math.abs(char.x - x);
        const dy = Math.abs(char.y - y);
        return dx < 10 && dy < 15;
      });

      if (clickedCharacter) {
        onCharacterClick(clickedCharacter.id);
      }
    },
    [scene.characters, onCharacterClick]
  );

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleCanvasClick}
        className="rounded-lg shadow-2xl cursor-pointer"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  );
}
