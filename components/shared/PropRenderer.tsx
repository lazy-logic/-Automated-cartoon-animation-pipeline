'use client';

import React from 'react';
import { Prop, getProp, PROPS } from '@/lib/utils/props-system';

interface PropRendererProps {
  propId: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  className?: string;
}

export default function PropRenderer({
  propId,
  x = 0,
  y = 0,
  scale = 1,
  rotation = 0,
  className = '',
}: PropRendererProps) {
  const prop = getProp(propId);
  
  if (!prop) return null;

  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: x,
        top: y,
        transform: `scale(${scale}) rotate(${rotation + prop.rotation}deg)`,
        transformOrigin: 'center center',
        width: prop.width,
        height: prop.height,
      }}
    >
      <svg
        width={prop.width}
        height={prop.height}
        viewBox={`0 0 ${prop.width} ${prop.height}`}
        dangerouslySetInnerHTML={{ __html: prop.svg }}
      />
    </div>
  );
}

// Prop selector component for the editor
interface PropSelectorProps {
  selectedPropId: string | null;
  onSelect: (propId: string | null) => void;
  className?: string;
}

export function PropSelector({ selectedPropId, onSelect, className = '' }: PropSelectorProps) {
  const categories = [
    { id: 'toy', name: 'Toys', emoji: '🧸' },
    { id: 'food', name: 'Food', emoji: '🍎' },
    { id: 'nature', name: 'Nature', emoji: '🌸' },
    { id: 'book', name: 'Books', emoji: '📚' },
    { id: 'accessory', name: 'Accessories', emoji: '👑' },
  ];

  const [activeCategory, setActiveCategory] = React.useState<string>('toy');

  const filteredProps = PROPS.filter(p => p.category === activeCategory);

  return (
    <div className={`bg-gray-800 rounded-xl p-4 ${className}`}>
      <h3 className="text-white font-bold mb-3">Props</h3>
      
      {/* Category tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Props grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* None option */}
        <button
          onClick={() => onSelect(null)}
          className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${
            selectedPropId === null
              ? 'bg-purple-500 ring-2 ring-purple-300'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <span className="text-white/50 text-xs">None</span>
        </button>

        {filteredProps.map(prop => (
          <button
            key={prop.id}
            onClick={() => onSelect(prop.id)}
            className={`aspect-square rounded-lg p-2 flex items-center justify-center transition-colors ${
              selectedPropId === prop.id
                ? 'bg-purple-500 ring-2 ring-purple-300'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            title={prop.name}
          >
            <svg
              width={prop.width * 0.6}
              height={prop.height * 0.6}
              viewBox={`0 0 ${prop.width} ${prop.height}`}
              dangerouslySetInnerHTML={{ __html: prop.svg }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// Props display for a character (shows prop attached to character)
interface CharacterPropsProps {
  propId: string | null;
  characterScale?: number;
  flipX?: boolean;
}

export function CharacterProps({ propId, characterScale = 1, flipX = false }: CharacterPropsProps) {
  if (!propId) return null;
  
  const prop = getProp(propId);
  if (!prop) return null;

  // Calculate position based on attach point
  let x = 0, y = 0;
  
  switch (prop.attachPoint) {
    case 'rightHand':
      x = flipX ? -30 : 60;
      y = 80;
      break;
    case 'leftHand':
      x = flipX ? 60 : -30;
      y = 80;
      break;
    case 'head':
      x = 20;
      y = -10;
      break;
    case 'body':
      x = 25;
      y = 50;
      break;
    case 'ground':
      x = 0;
      y = 120;
      break;
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x + prop.offsetX,
        top: y + prop.offsetY,
        transform: `scale(${characterScale * 0.8}) rotate(${prop.rotation}deg) ${flipX ? 'scaleX(-1)' : ''}`,
        transformOrigin: 'center center',
      }}
    >
      <svg
        width={prop.width}
        height={prop.height}
        viewBox={`0 0 ${prop.width} ${prop.height}`}
        dangerouslySetInnerHTML={{ __html: prop.svg }}
      />
    </div>
  );
}
