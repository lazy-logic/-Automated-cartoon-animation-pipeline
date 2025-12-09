'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Types for background elements
interface BackgroundElement {
  id: string;
  type: 'butterfly' | 'bird' | 'cloud' | 'leaf' | 'firefly' | 'star' | 'flower' | 'fish' | 'wave';
  x: number;
  y: number;
  scale: number;
  delay: number;
  duration: number;
  color?: string;
}

interface AnimatedBackgroundProps {
  backgroundType: 'meadow' | 'forest' | 'beach' | 'night' | 'bedroom' | 'park';
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

// Color palettes for different elements
const BUTTERFLY_COLORS = ['#FF6B9D', '#9B59B6', '#3498DB', '#F39C12', '#E74C3C', '#1ABC9C'];
const LEAF_COLORS = {
  spring: ['#90EE90', '#98FB98', '#00FA9A'],
  summer: ['#228B22', '#32CD32', '#7CFC00'],
  autumn: ['#FF6347', '#FF8C00', '#FFD700', '#CD853F', '#8B4513'],
  winter: ['#FFFFFF', '#E0FFFF', '#B0E0E6'],
};
const BIRD_COLORS = ['#2C3E50', '#34495E', '#5D6D7E', '#85929E'];
const FLOWER_COLORS = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#DB7093'];

// SVG Components for each element type
const Butterfly = ({ color = '#FF6B9D' }: { color?: string }) => (
  <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
    {/* Left wing */}
    <ellipse cx="6" cy="8" rx="5" ry="7" fill={color} opacity="0.8">
      <animate attributeName="rx" values="5;4;5" dur="0.3s" repeatCount="indefinite" />
    </ellipse>
    {/* Right wing */}
    <ellipse cx="18" cy="8" rx="5" ry="7" fill={color} opacity="0.8">
      <animate attributeName="rx" values="5;4;5" dur="0.3s" repeatCount="indefinite" />
    </ellipse>
    {/* Body */}
    <ellipse cx="12" cy="10" rx="1.5" ry="6" fill="#333" />
    {/* Antennae */}
    <path d="M11 4 Q9 1 7 2" stroke="#333" strokeWidth="0.5" fill="none" />
    <path d="M13 4 Q15 1 17 2" stroke="#333" strokeWidth="0.5" fill="none" />
    {/* Wing patterns */}
    <circle cx="6" cy="6" r="2" fill="white" opacity="0.4" />
    <circle cx="18" cy="6" r="2" fill="white" opacity="0.4" />
  </svg>
);

const Bird = ({ color = '#2C3E50' }: { color?: string }) => (
  <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
    {/* Body */}
    <ellipse cx="15" cy="12" rx="8" ry="5" fill={color} />
    {/* Head */}
    <circle cx="22" cy="10" r="4" fill={color} />
    {/* Beak */}
    <polygon points="26,10 30,11 26,12" fill="#F39C12" />
    {/* Eye */}
    <circle cx="23" cy="9" r="1" fill="white" />
    <circle cx="23.5" cy="9" r="0.5" fill="black" />
    {/* Wing */}
    <ellipse cx="13" cy="11" rx="5" ry="3" fill={color} opacity="0.7">
      <animate attributeName="ry" values="3;4;3" dur="0.2s" repeatCount="indefinite" />
    </ellipse>
    {/* Tail */}
    <polygon points="7,10 3,8 3,14 7,12" fill={color} />
  </svg>
);

const Cloud = () => (
  <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
    <ellipse cx="25" cy="25" rx="15" ry="12" fill="white" opacity="0.9" />
    <ellipse cx="40" cy="20" rx="18" ry="14" fill="white" opacity="0.9" />
    <ellipse cx="55" cy="25" rx="15" ry="12" fill="white" opacity="0.9" />
    <ellipse cx="35" cy="28" rx="12" ry="8" fill="white" opacity="0.9" />
    <ellipse cx="50" cy="28" rx="12" ry="8" fill="white" opacity="0.9" />
  </svg>
);

const Leaf = ({ color = '#90EE90' }: { color?: string }) => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
    <path
      d="M8 0 Q14 5 14 12 Q14 18 8 20 Q2 18 2 12 Q2 5 8 0"
      fill={color}
      opacity="0.8"
    />
    <path d="M8 2 L8 18" stroke={color} strokeWidth="0.5" opacity="0.5" />
    <path d="M8 6 Q5 8 4 10" stroke={color} strokeWidth="0.3" opacity="0.5" fill="none" />
    <path d="M8 6 Q11 8 12 10" stroke={color} strokeWidth="0.3" opacity="0.5" fill="none" />
  </svg>
);

const Firefly = () => (
  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
    <circle cx="4" cy="4" r="2" fill="#FFD700">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="4" cy="4" r="4" fill="#FFD700" opacity="0.3">
      <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const Star = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <polygon
      points="5,0 6,4 10,4 7,6 8,10 5,7.5 2,10 3,6 0,4 4,4"
      fill="white"
      opacity="0.8"
    >
      <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
    </polygon>
  </svg>
);

const Flower = ({ color = '#FF69B4' }: { color?: string }) => (
  <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
    {/* Stem */}
    <path d="M10 12 L10 24" stroke="#228B22" strokeWidth="2" />
    {/* Leaves on stem */}
    <ellipse cx="7" cy="18" rx="3" ry="2" fill="#32CD32" transform="rotate(-30 7 18)" />
    <ellipse cx="13" cy="20" rx="3" ry="2" fill="#32CD32" transform="rotate(30 13 20)" />
    {/* Petals */}
    <ellipse cx="10" cy="4" rx="3" ry="4" fill={color} />
    <ellipse cx="4" cy="8" rx="3" ry="4" fill={color} transform="rotate(-60 4 8)" />
    <ellipse cx="16" cy="8" rx="3" ry="4" fill={color} transform="rotate(60 16 8)" />
    <ellipse cx="6" cy="12" rx="3" ry="4" fill={color} transform="rotate(-30 6 12)" />
    <ellipse cx="14" cy="12" rx="3" ry="4" fill={color} transform="rotate(30 14 12)" />
    {/* Center */}
    <circle cx="10" cy="8" r="3" fill="#FFD700" />
  </svg>
);

const Fish = ({ color = '#3498DB' }: { color?: string }) => (
  <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
    {/* Body */}
    <ellipse cx="12" cy="8" rx="8" ry="5" fill={color} />
    {/* Tail */}
    <polygon points="4,8 0,3 0,13" fill={color} />
    {/* Fin */}
    <ellipse cx="12" cy="4" rx="3" ry="2" fill={color} opacity="0.7" />
    {/* Eye */}
    <circle cx="16" cy="7" r="2" fill="white" />
    <circle cx="16.5" cy="7" r="1" fill="black" />
    {/* Scales pattern */}
    <path d="M8 8 Q10 6 12 8 Q14 10 16 8" stroke="white" strokeWidth="0.5" opacity="0.3" fill="none" />
  </svg>
);

const Wave = () => (
  <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
    <path
      d="M0 10 Q25 0 50 10 Q75 20 100 10"
      stroke="#00CED1"
      strokeWidth="3"
      fill="none"
      opacity="0.6"
    />
  </svg>
);

// Generate random elements based on background type
function generateElements(
  backgroundType: string,
  season: string,
  intensity: string
): BackgroundElement[] {
  const elements: BackgroundElement[] = [];
  const count = intensity === 'low' ? 5 : intensity === 'medium' ? 10 : 15;

  const addElements = (type: BackgroundElement['type'], num: number, yRange: [number, number]) => {
    for (let i = 0; i < num; i++) {
      const colors = type === 'butterfly' ? BUTTERFLY_COLORS :
                     type === 'leaf' ? LEAF_COLORS[season as keyof typeof LEAF_COLORS] || LEAF_COLORS.summer :
                     type === 'bird' ? BIRD_COLORS :
                     type === 'flower' ? FLOWER_COLORS :
                     type === 'fish' ? ['#3498DB', '#E74C3C', '#F39C12', '#9B59B6'] :
                     undefined;
      
      elements.push({
        id: `${type}-${i}`,
        type,
        x: Math.random() * 100,
        y: yRange[0] + Math.random() * (yRange[1] - yRange[0]),
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 12,
        color: colors ? colors[Math.floor(Math.random() * colors.length)] : undefined,
      });
    }
  };

  switch (backgroundType) {
    case 'meadow':
    case 'park':
      addElements('butterfly', Math.ceil(count * 0.4), [20, 60]);
      addElements('bird', Math.ceil(count * 0.2), [5, 25]);
      addElements('cloud', Math.ceil(count * 0.2), [2, 15]);
      addElements('flower', Math.ceil(count * 0.2), [75, 85]);
      break;
    case 'forest':
      addElements('butterfly', Math.ceil(count * 0.3), [30, 70]);
      addElements('bird', Math.ceil(count * 0.2), [10, 30]);
      addElements('leaf', Math.ceil(count * 0.5), [0, 100]);
      break;
    case 'beach':
      addElements('bird', Math.ceil(count * 0.3), [5, 20]);
      addElements('cloud', Math.ceil(count * 0.3), [2, 12]);
      addElements('fish', Math.ceil(count * 0.2), [65, 75]);
      addElements('wave', Math.ceil(count * 0.2), [55, 65]);
      break;
    case 'night':
      addElements('firefly', Math.ceil(count * 0.5), [30, 80]);
      addElements('star', Math.ceil(count * 0.5), [5, 40]);
      break;
    case 'bedroom':
      // Minimal elements for indoor
      addElements('star', Math.ceil(count * 0.3), [10, 30]); // Stars visible through window
      break;
  }

  return elements;
}

// Animation variants for different element types
const getAnimationVariants = (element: BackgroundElement) => {
  const baseX = element.x;
  
  switch (element.type) {
    case 'butterfly':
      return {
        animate: {
          x: [`${baseX}%`, `${baseX + 20}%`, `${baseX - 10}%`, `${baseX + 15}%`, `${baseX}%`],
          y: [`${element.y}%`, `${element.y - 10}%`, `${element.y + 5}%`, `${element.y - 8}%`, `${element.y}%`],
          rotate: [0, 10, -10, 5, 0],
        },
        transition: {
          duration: element.duration,
          repeat: Infinity,
          delay: element.delay,
          ease: 'easeInOut',
        },
      };
    case 'bird':
      return {
        animate: {
          x: ['-10%', '110%'],
          y: [`${element.y}%`, `${element.y - 5}%`, `${element.y + 3}%`, `${element.y - 2}%`, `${element.y}%`],
        },
        transition: {
          duration: element.duration,
          repeat: Infinity,
          delay: element.delay,
          ease: 'linear',
        },
      };
    case 'cloud':
      return {
        animate: {
          x: ['-20%', '120%'],
        },
        transition: {
          duration: element.duration * 3,
          repeat: Infinity,
          delay: element.delay,
          ease: 'linear',
        },
      };
    case 'leaf':
      return {
        animate: {
          x: [`${baseX}%`, `${baseX + 30}%`],
          y: ['-10%', '110%'],
          rotate: [0, 360, 720, 1080],
        },
        transition: {
          duration: element.duration,
          repeat: Infinity,
          delay: element.delay,
          ease: 'linear',
        },
      };
    case 'firefly':
      return {
        animate: {
          x: [`${baseX}%`, `${baseX + 5}%`, `${baseX - 3}%`, `${baseX + 2}%`, `${baseX}%`],
          y: [`${element.y}%`, `${element.y - 5}%`, `${element.y + 3}%`, `${element.y - 2}%`, `${element.y}%`],
        },
        transition: {
          duration: element.duration / 2,
          repeat: Infinity,
          delay: element.delay,
          ease: 'easeInOut',
        },
      };
    case 'star':
      return {
        animate: {
          scale: [element.scale, element.scale * 1.2, element.scale],
          opacity: [0.5, 1, 0.5],
        },
        transition: {
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: element.delay,
          ease: 'easeInOut',
        },
      };
    case 'flower':
      return {
        animate: {
          rotate: [-5, 5, -5],
          scale: [element.scale, element.scale * 1.05, element.scale],
        },
        transition: {
          duration: 3,
          repeat: Infinity,
          delay: element.delay,
          ease: 'easeInOut',
        },
      };
    case 'fish':
      return {
        animate: {
          x: ['-10%', '110%'],
          y: [`${element.y}%`, `${element.y - 2}%`, `${element.y + 2}%`, `${element.y}%`],
        },
        transition: {
          duration: element.duration,
          repeat: Infinity,
          delay: element.delay,
          ease: 'linear',
        },
      };
    case 'wave':
      return {
        animate: {
          x: ['-20%', '120%'],
          opacity: [0.4, 0.7, 0.4],
        },
        transition: {
          duration: element.duration * 2,
          repeat: Infinity,
          delay: element.delay,
          ease: 'linear',
        },
      };
    default:
      return {
        animate: {},
        transition: { duration: 1 },
      };
  }
};

// Render the appropriate SVG component
const renderElement = (element: BackgroundElement) => {
  switch (element.type) {
    case 'butterfly':
      return <Butterfly color={element.color} />;
    case 'bird':
      return <Bird color={element.color} />;
    case 'cloud':
      return <Cloud />;
    case 'leaf':
      return <Leaf color={element.color} />;
    case 'firefly':
      return <Firefly />;
    case 'star':
      return <Star />;
    case 'flower':
      return <Flower color={element.color} />;
    case 'fish':
      return <Fish color={element.color} />;
    case 'wave':
      return <Wave />;
    default:
      return null;
  }
};

export default function AnimatedBackground({
  backgroundType,
  season = 'summer',
  intensity = 'medium',
  className = '',
}: AnimatedBackgroundProps) {
  const elements = useMemo(
    () => generateElements(backgroundType, season, intensity),
    [backgroundType, season, intensity]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element) => {
        const { animate, transition } = getAnimationVariants(element);
        
        return (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: `scale(${element.scale})`,
              zIndex: element.type === 'cloud' ? 1 : element.type === 'flower' ? 5 : 10,
            }}
            animate={animate}
            transition={transition}
          >
            {renderElement(element)}
          </motion.div>
        );
      })}
    </div>
  );
}

// Export individual components for custom use
export { Butterfly, Bird, Cloud, Leaf, Firefly, Star, Flower, Fish, Wave };
