'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { AnimatedCharacter, CharacterPart, AnimationKeyframes } from '@/lib/utils/characters';

interface AnimatedCharacterProps {
  character: AnimatedCharacter;
  animation?: 'idle' | 'walk' | 'wave' | 'talk' | 'jump' | 'sit';
  scale?: number;
  flipX?: boolean;
  x?: number;
  y?: number;
  isSelected?: boolean;
  onClick?: () => void;
  showName?: boolean;
}

export default function AnimatedCharacterComponent({
  character,
  animation = 'idle',
  scale = 1,
  flipX = false,
  x = 0,
  y = 0,
  isSelected = false,
  onClick,
  showName = true,
}: AnimatedCharacterProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const partRefs = useRef<Map<string, SVGGElement>>(new Map());
  const [isHovered, setIsHovered] = useState(false);

  // Store refs for each part
  const setPartRef = useCallback((id: string, el: SVGGElement | null) => {
    if (el) {
      partRefs.current.set(id, el);
    }
  }, []);

  // Apply animation
  useEffect(() => {
    if (!svgRef.current) return;

    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const animData = character.animations[animation];
    if (!animData) return;

    // Create new timeline
    const tl = gsap.timeline({
      repeat: animData.loop ? -1 : 0,
      defaults: { ease: 'power2.inOut' },
    });

    // Process keyframes
    animData.keyframes.forEach((keyframe, index) => {
      const nextKeyframe = animData.keyframes[index + 1];
      if (!nextKeyframe) return;

      const duration = (nextKeyframe.time - keyframe.time) * animData.duration;

      // Animate each part
      Object.entries(keyframe.parts).forEach(([partId, transform]) => {
        const partEl = partRefs.current.get(partId);
        if (!partEl) return;

        const part = character.parts.find(p => p.id === partId);
        if (!part) return;

        const nextTransform = nextKeyframe.parts[partId] || transform;

        // Build transform string
        const fromTransform = buildTransform(part, transform);
        const toTransform = buildTransform(part, nextTransform);

        tl.fromTo(
          partEl,
          { attr: { transform: fromTransform } },
          { attr: { transform: toTransform }, duration },
          keyframe.time * animData.duration
        );
      });
    });

    timelineRef.current = tl;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [character, animation]);

  // Build transform string for a part
  const buildTransform = (part: CharacterPart, transform: any) => {
    const rotation = transform.rotation || 0;
    const tx = transform.x || 0;
    const ty = transform.y || 0;
    const sx = transform.scaleX || 1;
    const sy = transform.scaleY || 1;

    // Rotate around pivot point
    return `translate(${part.pivotX + tx}, ${part.pivotY + ty}) rotate(${rotation}) scale(${sx}, ${sy}) translate(${-part.pivotX}, ${-part.pivotY})`;
  };

  // Sort parts by zIndex
  const sortedParts = [...character.parts].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${isHovered ? 'scale-105' : ''}`}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale}) ${flipX ? 'scaleX(-1)' : ''}`,
        transformOrigin: 'center bottom',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 -m-2 border-2 border-dashed border-indigo-500 rounded-lg animate-pulse" />
      )}

      <svg
        ref={svgRef}
        viewBox={character.viewBox}
        width={character.width * scale}
        height={character.height * scale}
        className="drop-shadow-lg"
        style={{ overflow: 'visible' }}
      >
        {/* Render each part */}
        {sortedParts.map((part) => (
          <g
            key={part.id}
            ref={(el) => setPartRef(part.id, el)}
            style={{ transformOrigin: `${part.pivotX}px ${part.pivotY}px` }}
          >
            <path
              d={part.path}
              fill={part.fill}
              stroke={part.stroke}
              strokeWidth={part.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>

      {/* Character name */}
      {showName && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 shadow-md whitespace-nowrap">
          {character.name}
        </div>
      )}
    </div>
  );
}
