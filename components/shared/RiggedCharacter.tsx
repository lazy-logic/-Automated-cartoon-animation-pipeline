'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { CharacterRig, SpritePart, SpriteShape, Transform, Vector2 } from '@/lib/utils/sprite-system';
import { 
  CharacterAnimationState, 
  MouthShape, 
  createAnimationState, 
  updateAnimationState,
  getAnimationForAction 
} from '@/lib/animation/keyframe-animation';

interface CustomCharacterColors {
  primary: string;
  secondary: string;
  skin: string;
  hair: string;
  eyes: string;
}

interface CustomCharacterAccessories {
  hat: boolean;
  glasses: boolean;
  cape: boolean;
  wings: boolean;
}

interface RiggedCharacterProps {
  rig: CharacterRig;
  animation?: string;
  scale?: number;
  flipX?: boolean;
  expression?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry' | 'confused' | 'sleepy' | 'excited';
  isTalking?: boolean;
  showName?: boolean;
  label?: string;
  onClick?: () => void;
  className?: string;
  showExplorerGear?: boolean;
  showBallProp?: boolean;
  // Custom character creator settings
  customColors?: CustomCharacterColors;
  customAccessories?: CustomCharacterAccessories;
}

// Render a sprite shape to SVG elements
function renderShape(shape: SpriteShape, key: string): React.ReactNode {
  switch (shape.type) {
    case 'ellipse':
      return (
        <ellipse
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    case 'rect':
      return (
        <rect
          key={key}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          rx={shape.rx}
          fill={shape.fill}
          stroke={shape.stroke}
        />
      );
    case 'path':
      return (
        <path
          key={key}
          d={shape.d}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'polygon':
      return (
        <polygon
          key={key}
          points={shape.points}
          fill={shape.fill}
          stroke={shape.stroke}
        />
      );
    case 'group':
      return (
        <g key={key}>
          {shape.children.map((child, i) => renderShape(child, `${key}-${i}`))}
        </g>
      );
    default:
      return null;
  }
}

// Get mouth shape SVG path based on expression and mouth shape
function getMouthPath(mouthShape: MouthShape, expression: string): string {
  const mouthPaths: Record<MouthShape, string> = {
    closed: 'M -8 0 Q 0 2 8 0',
    open: 'M -8 0 Q 0 8 8 0 Q 0 4 -8 0',
    wide: 'M -10 0 Q 0 12 10 0 Q 0 6 -10 0',
    oh: 'M -6 -4 Q -8 0 -6 4 Q 0 6 6 4 Q 8 0 6 -4 Q 0 -6 -6 -4',
    ee: 'M -10 0 Q 0 3 10 0',
    smile: 'M -8 0 Q 0 10 8 0',
  };
  
  // Override based on expression
  if (expression === 'happy') {
    return mouthPaths.smile;
  } else if (expression === 'sad') {
    return 'M -8 4 Q 0 -4 8 4';
  } else if (expression === 'surprised') {
    return mouthPaths.oh;
  } else if (expression === 'angry') {
    return 'M -8 2 L 0 0 L 8 2';
  } else if (expression === 'confused') {
    return 'M -6 1 Q -2 -2 2 2 Q 6 -1 8 1'; // Squiggly confused mouth
  } else if (expression === 'sleepy') {
    return 'M -6 1 Q 0 -1 6 1'; // Slightly droopy mouth
  } else if (expression === 'excited') {
    return 'M -10 0 Q 0 14 10 0 Q 0 8 -10 0'; // Big excited smile
  }
  
  return mouthPaths[mouthShape] || mouthPaths.closed;
}

// Get eye modification based on expression
function getEyeModifier(expression: string): { scaleY: number; offsetY: number; scaleX?: number; rotation?: number } {
  switch (expression) {
    case 'happy':
      return { scaleY: 0.3, offsetY: 2 }; // Squinted happy eyes
    case 'sad':
      return { scaleY: 0.7, offsetY: 1 };
    case 'surprised':
      return { scaleY: 1.3, offsetY: 0 };
    case 'angry':
      return { scaleY: 0.6, offsetY: 0 };
    case 'confused':
      return { scaleY: 0.9, offsetY: 0, rotation: 5 }; // Slightly tilted eyes
    case 'sleepy':
      return { scaleY: 0.2, offsetY: 2 }; // Almost closed eyes
    case 'excited':
      return { scaleY: 1.2, offsetY: -1 }; // Wide excited eyes
    default:
      return { scaleY: 1, offsetY: 0 };
  }
}

function getBrowOffset(expression: string): number {
  switch (expression) {
    case 'happy':
      return -1.5;
    case 'sad':
      return 1.5;
    case 'surprised':
      return -3;
    case 'angry':
      return 0;
    case 'confused':
      return -1; // One brow raised effect
    case 'sleepy':
      return 2; // Droopy brows
    case 'excited':
      return -2.5; // Raised excited brows
    default:
      return 0;
  }
}

export default function RiggedCharacter({
  rig,
  animation = 'idle',
  scale = 1,
  flipX = false,
  expression = 'neutral',
  isTalking = false,
  showName = false,
  label,
  onClick,
  className = '',
  showExplorerGear = false,
  showBallProp = false,
  customColors,
  customAccessories,
}: RiggedCharacterProps) {
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [animState, setAnimState] = useState<CharacterAnimationState>(() => 
    createAnimationState(rig.id, animation)
  );
  
  // Smooth expression transitions
  const [currentExpression, setCurrentExpression] = useState(expression);
  const [expressionProgress, setExpressionProgress] = useState(1);
  const prevExpressionRef = useRef(expression);
  
  // Animate expression changes smoothly
  useEffect(() => {
    if (expression !== prevExpressionRef.current) {
      prevExpressionRef.current = currentExpression;
      setExpressionProgress(0);
      
      const startTime = performance.now();
      const duration = 200; // 200ms transition
      
      const animateExpression = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setExpressionProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animateExpression);
        } else {
          setCurrentExpression(expression);
        }
      };
      
      requestAnimationFrame(animateExpression);
    }
  }, [expression, currentExpression]);

  // Determine if this is an animal rig
  const isAnimal = rig.category === 'animal';
  const rigId = rig.id.toLowerCase();
  const isKiara = rigId === 'kiara';
  const isJayden = rigId === 'jayden';

  // Helper to apply custom colors to a shape based on part name
  const applyCustomColor = (shape: SpriteShape, partId: string): SpriteShape => {
    if (!customColors) return shape;
    
    // Skip group type shapes as they don't have fill
    if (shape.type === 'group') return shape;
    
    // Map part IDs to custom color categories
    const skinParts = ['head', 'face', 'leftHand', 'rightHand', 'neck'];
    const hairParts = ['hair', 'hairBack'];
    const clothingParts = ['body', 'torso', 'chest', 'shirt'];
    const secondaryParts = ['leftLeg', 'rightLeg', 'pants', 'shorts', 'leftSleeve', 'rightSleeve'];
    const eyeParts = ['leftPupil', 'rightPupil', 'leftIris', 'rightIris'];
    
    let newFill = shape.fill;
    
    if (skinParts.some(p => partId.toLowerCase().includes(p.toLowerCase()))) {
      newFill = customColors.skin;
    } else if (hairParts.some(p => partId.toLowerCase().includes(p.toLowerCase()))) {
      newFill = customColors.hair;
    } else if (eyeParts.some(p => partId.toLowerCase().includes(p.toLowerCase()))) {
      newFill = customColors.eyes;
    } else if (clothingParts.some(p => partId.toLowerCase().includes(p.toLowerCase()))) {
      newFill = customColors.primary;
    } else if (secondaryParts.some(p => partId.toLowerCase().includes(p.toLowerCase()))) {
      newFill = customColors.secondary;
    }
    
    return { ...shape, fill: newFill };
  };

  // Render shape with optional custom colors
  const renderShapeWithColors = (shape: SpriteShape, key: string, partId: string): React.ReactNode => {
    const coloredShape = applyCustomColor(shape, partId);
    return renderShape(coloredShape, key);
  };

  // Update animation clip when animation prop changes
  useEffect(() => {
    const clip = getAnimationForAction(isTalking ? 'talk' : animation, isAnimal);
    setAnimState(prev => ({
      ...prev,
      currentClip: clip,
      time: 0,
    }));
  }, [animation, isTalking, isAnimal]);

  // Animation loop
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      setAnimState(prev => updateAnimationState(prev, deltaTime));
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Calculate transform for a part including animation
  const getPartTransform = (part: SpritePart): string => {
    const animTransform = animState.partTransforms[part.id] || {};
    const baseTransform = part.defaultTransform;
    
    const pos: Vector2 = {
      x: baseTransform.position.x + (animTransform.position?.x || 0),
      y: baseTransform.position.y + (animTransform.position?.y || 0),
    };
    
    const rotation = baseTransform.rotation + (animTransform.rotation || 0);
    const scaleVal: Vector2 = {
      x: baseTransform.scale.x * (animTransform.scale?.x || 1),
      y: baseTransform.scale.y * (animTransform.scale?.y || 1),
    };
    
    const pivotX = baseTransform.pivot.x;
    const pivotY = baseTransform.pivot.y;
    
    return `translate(${pos.x}, ${pos.y}) rotate(${rotation}) scale(${scaleVal.x}, ${scaleVal.y})`;
  };

  // Render a part and its children recursively
  const renderPart = (partId: string, depth: number = 0): React.ReactNode => {
    const part = rig.parts[partId];
    if (!part) return null;

    const transform = getPartTransform(part);
    const animTransform = animState.partTransforms[part.id] || {};
    const eyeModifier = getEyeModifier(expression);
    const browOffsetY = getBrowOffset(expression);

    // Special handling for mouth
    if (part.id === 'mouth') {
      const mouthShape = animTransform.mouthShape || 'closed';
      const mouthPath = getMouthPath(mouthShape, expression);

      return (
        <g key={part.id} transform={transform} style={{ zIndex: part.zIndex }}>
          <path
            d={mouthPath}
            fill={
              mouthShape === 'oh' || mouthShape === 'open' || mouthShape === 'wide'
                ? '#8B0000'
                : 'none'
            }
            stroke="#333"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      );
    }

    // Expression-aware eyebrows
    if (part.id === 'leftBrow' || part.id === 'rightBrow') {
      return React.createElement(
        'g',
        {
          key: part.id,
          transform: `${transform} translate(0, ${browOffsetY})`,
          style: { zIndex: part.zIndex },
        },
        renderShapeWithColors(part.shape, part.id, part.id)
      );
    }

    // Expression-aware eyes (squash/stretched per emotion)
    if (part.id === 'leftEye' || part.id === 'rightEye') {
      return (
        <g
          key={part.id}
          transform={`${transform} scale(1, ${eyeModifier.scaleY}) translate(0, ${eyeModifier.offsetY})`}
          style={{ zIndex: part.zIndex }}
        >
          {renderShapeWithColors(part.shape, part.id, part.id)}
          {part.children.map((childId) => renderPart(childId, depth + 1))}
        </g>
      );
    }

    // Body: allow a subtle jersey stripe for Jayden
    if (part.id === 'body') {
      return (
        <g key={part.id} transform={transform} style={{ zIndex: part.zIndex }}>
          {renderShapeWithColors(part.shape, part.id, part.id)}
          {isJayden && !customColors && (
            <rect x={-24} y={18} width={48} height={10} rx={4} fill="#1D4ED8" />
          )}
          {part.children.map((childId) => renderPart(childId, depth + 1))}
        </g>
      );
    }

    // Right hand: attach simple props when enabled
    if (part.id === 'rightHand') {
      return (
        <g key={part.id} transform={transform} style={{ zIndex: part.zIndex }}>
          {renderShapeWithColors(part.shape, part.id, part.id)}
          {isKiara && showExplorerGear && !customColors && (
            <>
              <rect x={-4} y={12} width={18} height={10} rx={2} fill="#F97316" />
              <path d="M -3 12 L -8 4" fill="none" stroke="#F97316" strokeWidth={2} strokeLinecap="round" />
            </>
          )}
          {isJayden && showBallProp && !customColors && (
            <ellipse
              cx={4}
              cy={14}
              rx={8}
              ry={8}
              fill="#FBBF24"
              stroke="#F59E0B"
              strokeWidth={2}
            />
          )}
          {part.children.map((childId) => renderPart(childId, depth + 1))}
        </g>
      );
    }

    // Default: just render shape and children
    return (
      <g key={part.id} transform={transform} style={{ zIndex: part.zIndex }}>
        {renderShapeWithColors(part.shape, part.id, part.id)}
        {part.children.map((childId) => renderPart(childId, depth + 1))}
      </g>
    );
  };

  // Sort parts by zIndex for potential future use (kept for compatibility)
  const sortedParts = useMemo(() => {
    return Object.values(rig.parts).sort((a, b) => a.zIndex - b.zIndex);
  }, [rig.parts]);

  const viewBoxWidth = rig.width;
  const viewBoxHeight = rig.height;
  const displayWidth = viewBoxWidth * scale;
  const displayHeight = viewBoxHeight * scale;

  return (
    <div 
      className={`relative inline-block ${onClick ? 'hover:scale-[1.03]' : ''} transition-transform duration-150 ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        filter: 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.45))',
      }}
    >
      <svg
        width={displayWidth}
        height={displayHeight}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        style={{
          transform: flipX ? 'scaleX(-1)' : 'none',
          overflow: 'visible',
          shapeRendering: 'geometricPrecision',
        }}
      >
        {/* Render from root, which will recursively render children */}
        {renderPart(rig.rootPartId)}
      </svg>
      
      {showName && (
        <div 
          className="absolute -bottom-6 left-1/2 whitespace-nowrap"
          style={{ transform: 'translateX(-50%)' }}
        >
          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full shadow-lg border border-white/40 backdrop-blur-sm">
            {label || rig.name}
          </span>
        </div>
      )}
    </div>
  );
}
