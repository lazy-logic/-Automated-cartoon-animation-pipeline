'use client';

import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export type BackgroundTheme = 'meadow' | 'forest' | 'beach' | 'night' | 'bedroom' | 'park';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface ParallaxLayer {
  id: string;
  zIndex: number;
  speed: number;
  content: React.ReactNode;
  yOffset?: number;
}

interface ParallaxBackgroundProps {
  theme: BackgroundTheme;
  season?: Season;
  timeOfDay?: TimeOfDay;
  animationProgress?: number;
  enableParallax?: boolean;
  className?: string;
}

// Vibrant sky gradients
const SKY_GRADIENTS: Record<TimeOfDay, string> = {
  dawn: 'linear-gradient(180deg, #1e3c72 0%, #ff6b6b 25%, #ffa07a 50%, #ffd89b 75%, #87CEEB 100%)',
  day: 'linear-gradient(180deg, #2196F3 0%, #64B5F6 30%, #90CAF9 60%, #BBDEFB 100%)',
  dusk: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 15%, #4a1942 35%, #e94560 55%, #ff9a56 75%, #ffd89b 100%)',
  night: 'linear-gradient(180deg, #0a0a1a 0%, #16213e 40%, #1a1a3e 70%, #2d2d5a 100%)',
};

// Vibrant color palettes for each season
const SEASON_PALETTES: Record<Season, { 
  grass: string[], 
  trees: string[], 
  accent: string[],
  flowers: string[],
  ground: string 
}> = {
  spring: {
    grass: ['#7ed56f', '#55c57a', '#28b485', '#85d584'],
    trees: ['#2d5016', '#3d6b22', '#4a7c2e', '#5a9236'],
    accent: ['#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb'],
    flowers: ['#ff6b9d', '#c44cff', '#ffcc00', '#ff8c42', '#7bed9f'],
    ground: 'linear-gradient(180deg, #7ed56f 0%, #55c57a 40%, #3d8b40 100%)',
  },
  summer: {
    grass: ['#27ae60', '#2ecc71', '#58d68d', '#82e0aa'],
    trees: ['#1e5631', '#2d7a46', '#3d9a5b', '#4db970'],
    accent: ['#f39c12', '#e74c3c', '#3498db', '#9b59b6'],
    flowers: ['#ff4757', '#ffa502', '#ff6b81', '#7bed9f', '#70a1ff'],
    ground: 'linear-gradient(180deg, #2ecc71 0%, #27ae60 40%, #1e8449 100%)',
  },
  autumn: {
    grass: ['#d4a574', '#c9a066', '#b8860b', '#cd853f'],
    trees: ['#8b4513', '#a0522d', '#cd853f', '#d2691e'],
    accent: ['#e74c3c', '#f39c12', '#d35400', '#c0392b'],
    flowers: ['#e74c3c', '#f39c12', '#d35400', '#ff7675', '#fab1a0'],
    ground: 'linear-gradient(180deg, #d4a574 0%, #bc8f5f 40%, #8b7355 100%)',
  },
  winter: {
    grass: ['#ecf0f1', '#bdc3c7', '#dfe6e9', '#b2bec3'],
    trees: ['#2c3e50', '#34495e', '#5d6d7e', '#85929e'],
    accent: ['#3498db', '#1abc9c', '#9b59b6', '#e74c3c'],
    flowers: ['#dfe6e9', '#74b9ff', '#a29bfe', '#fd79a8'],
    ground: 'linear-gradient(180deg, #ecf0f1 0%, #dfe6e9 40%, #bdc3c7 100%)',
  },
};

// Vibrant Sun/Moon component
const Sun = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  if (timeOfDay === 'night') {
    return (
      <div className="absolute top-[8%] right-[15%]">
        <div 
          className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-gray-200 relative"
          style={{ boxShadow: '0 0 60px 20px rgba(255,255,200,0.3)' }}
        >
          {/* Moon craters */}
          <div className="absolute w-4 h-4 rounded-full bg-gray-300/50 top-3 left-3" />
          <div className="absolute w-2 h-2 rounded-full bg-gray-300/50 top-8 left-8" />
          <div className="absolute w-3 h-3 rounded-full bg-gray-300/50 bottom-3 right-4" />
        </div>
      </div>
    );
  }
  
  const sunColors = {
    dawn: 'from-red-400 via-orange-400 to-yellow-300',
    day: 'from-yellow-300 via-yellow-400 to-orange-400',
    dusk: 'from-orange-500 via-red-500 to-pink-500',
  };
  
  const positions = {
    dawn: { top: '50%', right: '75%' },
    day: { top: '8%', right: '20%' },
    dusk: { top: '60%', right: '10%' },
  };
  
  return (
    <div className="absolute" style={positions[timeOfDay]}>
      {/* Sun glow */}
      <div 
        className="absolute -inset-8 rounded-full opacity-50 blur-xl"
        style={{ background: `radial-gradient(circle, rgba(255,200,100,0.8) 0%, transparent 70%)` }}
      />
      {/* Sun rays */}
      <div className="absolute -inset-16 animate-spin-slow">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-8 bg-gradient-to-t from-yellow-400/60 to-transparent left-1/2 -translate-x-1/2"
            style={{ 
              top: '-20px',
              transformOrigin: '50% 60px',
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </div>
      {/* Sun body */}
      <div 
        className={`w-14 h-14 rounded-full bg-gradient-to-br ${sunColors[timeOfDay]} relative`}
        style={{ boxShadow: '0 0 40px 15px rgba(255,200,0,0.4)' }}
      />
    </div>
  );
};

// Improved clouds
const Clouds = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  const cloudColor = timeOfDay === 'night' ? 'rgba(100,100,150,0.3)' : 
                     timeOfDay === 'dusk' ? 'rgba(255,180,150,0.7)' : 
                     timeOfDay === 'dawn' ? 'rgba(255,200,180,0.8)' : 
                     'rgba(255,255,255,0.9)';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${5 + i * 8}%`,
            left: `${-20 + i * 25}%`,
          }}
          animate={{
            x: [0, 100, 0],
          }}
          transition={{
            duration: 60 + i * 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg viewBox="0 0 200 80" className="w-40 h-16">
            <ellipse cx="60" cy="50" rx="50" ry="25" fill={cloudColor} />
            <ellipse cx="100" cy="40" rx="40" ry="30" fill={cloudColor} />
            <ellipse cx="140" cy="50" rx="45" ry="22" fill={cloudColor} />
            <ellipse cx="80" cy="35" rx="30" ry="20" fill={cloudColor} />
            <ellipse cx="120" cy="35" rx="35" ry="22" fill={cloudColor} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Enhanced mountain with gradient
const Mountain = ({ color1, color2, x, scale = 1, snowCap = true }: { 
  color1: string; 
  color2: string; 
  x: number; 
  scale?: number;
  snowCap?: boolean;
}) => (
  <svg
    viewBox="0 0 200 120"
    className="absolute bottom-[25%]"
    style={{
      left: `${x}%`,
      width: `${35 * scale}%`,
      height: `${30 * scale}%`,
      transform: 'translateX(-50%)',
    }}
  >
    <defs>
      <linearGradient id={`mountain-grad-${x}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color1} />
        <stop offset="100%" stopColor={color2} />
      </linearGradient>
    </defs>
    <polygon points="100,0 200,120 0,120" fill={`url(#mountain-grad-${x})`} />
    {/* Mountain texture lines */}
    <path d="M100 0 L120 40 L140 30 L160 60" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
    <path d="M100 0 L80 35 L60 45 L40 70" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
    {/* Snow cap */}
    {snowCap && (
      <>
        <polygon points="100,0 125,30 75,30" fill="white" />
        <polygon points="100,0 115,20 85,20" fill="#f0f8ff" />
      </>
    )}
  </svg>
);

// Vibrant tree with detailed foliage
const Tree = ({ x, scale = 1, type = 'pine', colors }: { 
  x: number; 
  scale?: number; 
  type?: 'pine' | 'oak' | 'palm' | 'cherry';
  colors: string[];
}) => {
  const treeId = `tree-${x}-${type}`;
  
  if (type === 'pine') {
    return (
      <svg
        viewBox="0 0 50 100"
        className="absolute bottom-[15%]"
        style={{
          left: `${x}%`,
          width: `${6 * scale}%`,
          height: `${25 * scale}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <defs>
          <linearGradient id={`${treeId}-trunk`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5d4037" />
            <stop offset="50%" stopColor="#8d6e63" />
            <stop offset="100%" stopColor="#5d4037" />
          </linearGradient>
          <linearGradient id={`${treeId}-foliage`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {/* Trunk */}
        <rect x="21" y="60" width="8" height="40" fill={`url(#${treeId}-trunk)`} rx="2" />
        {/* Foliage layers with depth */}
        <polygon points="25,5 45,40 5,40" fill={colors[2] || colors[0]} />
        <polygon points="25,0 48,45 2,45" fill={`url(#${treeId}-foliage)`} />
        <polygon points="25,20 50,65 0,65" fill={colors[1]} />
        {/* Highlight */}
        <polygon points="25,5 35,25 25,25" fill="rgba(255,255,255,0.15)" />
      </svg>
    );
  }
  
  if (type === 'oak') {
    return (
      <svg
        viewBox="0 0 80 100"
        className="absolute bottom-[15%]"
        style={{
          left: `${x}%`,
          width: `${10 * scale}%`,
          height: `${25 * scale}%`,
          transform: 'translateX(-50%)',
        }}
      >
        <defs>
          <radialGradient id={`${treeId}-canopy`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="70%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2] || colors[1]} />
          </radialGradient>
        </defs>
        {/* Trunk */}
        <path d="M35 100 Q38 70 40 55 Q42 70 45 100" fill="#6d4c41" />
        <path d="M32 100 L35 75" stroke="#5d4037" strokeWidth="3" />
        <path d="M48 100 L45 75" stroke="#5d4037" strokeWidth="3" />
        {/* Canopy clusters */}
        <ellipse cx="40" cy="35" rx="32" ry="28" fill={`url(#${treeId}-canopy)`} />
        <ellipse cx="25" cy="40" rx="18" ry="16" fill={colors[0]} />
        <ellipse cx="55" cy="40" rx="18" ry="16" fill={colors[0]} />
        <ellipse cx="40" cy="22" rx="20" ry="18" fill={colors[0]} />
        <ellipse cx="30" cy="28" rx="12" ry="10" fill={colors[2] || colors[0]} opacity="0.7" />
        {/* Highlights */}
        <ellipse cx="35" cy="25" rx="8" ry="6" fill="rgba(255,255,255,0.1)" />
      </svg>
    );
  }
  
  if (type === 'palm') {
    return (
      <svg
        viewBox="0 0 80 120"
        className="absolute bottom-[15%]"
        style={{
          left: `${x}%`,
          width: `${8 * scale}%`,
          height: `${28 * scale}%`,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Curved trunk */}
        <path 
          d="M40 120 Q35 80 38 50 Q40 30 42 20" 
          fill="none" 
          stroke="#d4a574" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path 
          d="M40 120 Q35 80 38 50 Q40 30 42 20" 
          fill="none" 
          stroke="#c9a066" 
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Trunk texture */}
        {[...Array(8)].map((_, i) => (
          <ellipse 
            key={i} 
            cx="39" 
            cy={30 + i * 10} 
            rx="5" 
            ry="2" 
            fill="none" 
            stroke="#a67c52" 
            strokeWidth="1"
          />
        ))}
        {/* Palm fronds */}
        {[-60, -30, 0, 30, 60].map((angle, i) => (
          <ellipse
            key={i}
            cx="42"
            cy="5"
            rx="30"
            ry="6"
            fill={i % 2 === 0 ? '#27ae60' : '#2ecc71'}
            transform={`rotate(${angle} 42 20)`}
          />
        ))}
        {/* Coconuts */}
        <circle cx="38" cy="22" r="4" fill="#8d6e63" />
        <circle cx="46" cy="24" r="4" fill="#795548" />
      </svg>
    );
  }
  
  // Cherry blossom tree
  return (
    <svg
      viewBox="0 0 80 100"
      className="absolute bottom-[15%]"
      style={{
        left: `${x}%`,
        width: `${10 * scale}%`,
        height: `${25 * scale}%`,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Trunk */}
      <path d="M35 100 Q38 70 40 50" fill="none" stroke="#5d4037" strokeWidth="8" />
      <path d="M40 50 Q30 40 20 35" fill="none" stroke="#5d4037" strokeWidth="4" />
      <path d="M40 50 Q50 40 60 35" fill="none" stroke="#5d4037" strokeWidth="4" />
      {/* Blossoms */}
      {[
        { cx: 20, cy: 30 }, { cx: 35, cy: 25 }, { cx: 50, cy: 28 },
        { cx: 60, cy: 32 }, { cx: 25, cy: 40 }, { cx: 45, cy: 20 },
        { cx: 55, cy: 40 }, { cx: 40, cy: 35 }, { cx: 30, cy: 18 },
      ].map((pos, i) => (
        <g key={i}>
          <circle cx={pos.cx} cy={pos.cy} r={6 + (i % 3)} fill="#ffb7c5" opacity="0.9" />
          <circle cx={pos.cx} cy={pos.cy} r={3 + (i % 2)} fill="#ffc0cb" />
        </g>
      ))}
    </svg>
  );
};

// Rolling hills with gradient
const RollingHill = ({ x, width, height, colors, flip = false }: { 
  x: number; 
  width: number; 
  height: number; 
  colors: string[];
  flip?: boolean;
}) => (
  <svg
    viewBox="0 0 200 100"
    className="absolute bottom-[15%]"
    preserveAspectRatio="none"
    style={{
      left: `${x}%`,
      width: `${width}%`,
      height: `${height}%`,
      transform: `translateX(-50%) ${flip ? 'scaleX(-1)' : ''}`,
    }}
  >
    <defs>
      <linearGradient id={`hill-${x}`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={colors[0]} />
        <stop offset="100%" stopColor={colors[1]} />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="100" rx="120" ry="60" fill={`url(#hill-${x})`} />
  </svg>
);

// Grass blade clusters
const GrassCluster = ({ x, colors, density = 'normal' }: { 
  x: number; 
  colors: string[];
  density?: 'sparse' | 'normal' | 'dense';
}) => {
  const bladeCount = density === 'sparse' ? 3 : density === 'dense' ? 8 : 5;
  
  return (
    <svg
      viewBox="0 0 30 40"
      className="absolute bottom-[14%]"
      style={{
        left: `${x}%`,
        width: '3%',
        height: '8%',
        transform: 'translateX(-50%)',
      }}
    >
      {[...Array(bladeCount)].map((_, i) => {
        const xPos = 5 + (i * (20 / bladeCount));
        const height = 25 + Math.random() * 15;
        const curve = (Math.random() - 0.5) * 10;
        return (
          <path
            key={i}
            d={`M${xPos} 40 Q${xPos + curve} ${40 - height/2} ${xPos + curve/2} ${40 - height}`}
            stroke={colors[i % colors.length]}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

// Flower component
const Flower = ({ x, color, size = 1 }: { x: number; color: string; size?: number }) => (
  <svg
    viewBox="0 0 20 30"
    className="absolute bottom-[14%]"
    style={{
      left: `${x}%`,
      width: `${2 * size}%`,
      height: `${5 * size}%`,
      transform: 'translateX(-50%)',
    }}
  >
    {/* Stem */}
    <path d="M10 30 Q10 20 10 12" stroke="#2ecc71" strokeWidth="1.5" fill="none" />
    {/* Leaves */}
    <ellipse cx="7" cy="22" rx="3" ry="1.5" fill="#27ae60" transform="rotate(-30 7 22)" />
    <ellipse cx="13" cy="20" rx="3" ry="1.5" fill="#27ae60" transform="rotate(30 13 20)" />
    {/* Petals */}
    {[0, 72, 144, 216, 288].map((angle, i) => (
      <ellipse
        key={i}
        cx="10"
        cy="5"
        rx="3"
        ry="5"
        fill={color}
        transform={`rotate(${angle} 10 10)`}
        opacity="0.9"
      />
    ))}
    {/* Center */}
    <circle cx="10" cy="10" r="2.5" fill="#f1c40f" />
  </svg>
);

// Butterflies
const Butterflies = ({ colors }: { colors: string[] }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        initial={{ x: `${20 + i * 30}%`, y: `${30 + i * 10}%` }}
        animate={{
          x: [`${20 + i * 30}%`, `${40 + i * 20}%`, `${20 + i * 30}%`],
          y: [`${30 + i * 10}%`, `${20 + i * 5}%`, `${30 + i * 10}%`],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <svg viewBox="0 0 30 20" className="w-6 h-4">
          <motion.g
            animate={{ scaleX: [1, 0.3, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <ellipse cx="8" cy="10" rx="7" ry="8" fill={colors[i % colors.length]} opacity="0.8" />
            <ellipse cx="22" cy="10" rx="7" ry="8" fill={colors[i % colors.length]} opacity="0.8" />
          </motion.g>
          <ellipse cx="15" cy="10" rx="2" ry="8" fill="#333" />
        </svg>
      </motion.div>
    ))}
  </div>
);

// Fireflies for night
const Fireflies = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${20 + Math.random() * 60}%`,
          background: 'radial-gradient(circle, #ffff88 0%, transparent 70%)',
          boxShadow: '0 0 10px 5px rgba(255,255,100,0.3)',
        }}
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [0.5, 1, 0.5],
          x: [0, Math.random() * 30 - 15, 0],
          y: [0, Math.random() * 20 - 10, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Stars with twinkling
const Stars = () => (
  <div className="absolute inset-0">
    {[...Array(80)].map((_, i) => {
      const size = Math.random() * 2.5 + 0.5;
      return (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: size,
            height: size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            boxShadow: `0 0 ${size * 2}px ${size}px rgba(255,255,255,0.3)`,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      );
    })}
    {/* Shooting star occasionally */}
    <motion.div
      className="absolute w-1 h-1 bg-white rounded-full"
      style={{ top: '15%', left: '80%' }}
      animate={{
        x: [-100, -300],
        y: [0, 100],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatDelay: 8,
      }}
    >
      <div className="w-20 h-0.5 bg-gradient-to-l from-white to-transparent -ml-20" />
    </motion.div>
  </div>
);

// Vibrant ground with grass texture
const VibrantGround = ({ colors, season }: { colors: string[]; season: Season }) => (
  <div className="absolute bottom-0 left-0 right-0 h-[18%]">
    {/* Main ground gradient */}
    <div 
      className="absolute inset-0"
      style={{ 
        background: SEASON_PALETTES[season].ground,
        borderTopLeftRadius: '50% 20px',
        borderTopRightRadius: '50% 20px',
      }}
    />
    {/* Grass texture overlay */}
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
      <defs>
        <pattern id="grass-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M2 20 Q2 10 4 5" stroke={colors[0]} strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M8 20 Q7 12 10 3" stroke={colors[1]} strokeWidth="1.5" fill="none" opacity="0.5" />
          <path d="M14 20 Q15 8 13 2" stroke={colors[0]} strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M18 20 Q18 14 20 8" stroke={colors[1]} strokeWidth="1.5" fill="none" opacity="0.4" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#grass-pattern)" />
    </svg>
    {/* Light reflection on top */}
    <div 
      className="absolute top-0 left-0 right-0 h-2"
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)' }}
    />
  </div>
);

// Furniture for bedroom theme
const Furniture = () => (
  <div className="absolute inset-0">
    {/* Wallpaper pattern */}
    <div className="absolute inset-0 opacity-10">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-4 h-4 rounded-full border border-amber-300"
          style={{ left: `${(i % 5) * 25}%`, top: `${Math.floor(i / 5) * 25}%` }}
        />
      ))}
    </div>
    {/* Window with curtains */}
    <div className="absolute top-[8%] right-[8%] w-[22%] h-[35%]">
      {/* Window frame */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-400 to-sky-500 border-4 border-amber-700 rounded-lg"
        style={{ boxShadow: 'inset 0 0 30px rgba(255,255,255,0.5)' }}
      >
        {/* Window panes */}
        <div className="absolute inset-2 grid grid-cols-2 grid-rows-2 gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-amber-600 rounded-sm" />
          ))}
        </div>
        {/* Sun glare */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/40 rounded-full blur-md" />
      </div>
      {/* Curtains */}
      <div className="absolute -left-4 top-0 w-6 h-full bg-gradient-to-r from-pink-300 to-pink-400 rounded-b-lg" />
      <div className="absolute -right-4 top-0 w-6 h-full bg-gradient-to-l from-pink-300 to-pink-400 rounded-b-lg" />
    </div>
    
    {/* Bed */}
    <div className="absolute bottom-[8%] left-[5%] w-[45%] h-[30%]">
      {/* Mattress */}
      <div className="absolute bottom-0 w-full h-[55%] bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg border-2 border-amber-300 shadow-lg" />
      {/* Headboard */}
      <div className="absolute bottom-[50%] left-0 w-[18%] h-[90%] bg-gradient-to-r from-amber-700 to-amber-600 rounded-t-lg shadow-md" />
      <div className="absolute bottom-[50%] right-0 w-[18%] h-[50%] bg-gradient-to-l from-amber-700 to-amber-600 rounded-t-lg shadow-md" />
      {/* Pillow */}
      <div className="absolute bottom-[55%] left-[20%] w-[28%] h-[35%] bg-gradient-to-b from-white to-gray-100 rounded-xl shadow-sm" />
      {/* Blanket */}
      <div className="absolute bottom-0 left-[3%] right-[3%] h-[50%] bg-gradient-to-b from-pink-300 to-pink-400 rounded-lg shadow-md">
        <div className="absolute inset-2 border-2 border-pink-200/50 rounded-lg" />
      </div>
    </div>
    
    {/* Nightstand */}
    <div className="absolute bottom-[8%] right-[25%] w-[12%] h-[18%]">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg shadow-lg" />
      <div className="absolute top-[30%] left-[10%] right-[10%] h-[2px] bg-amber-800" />
      {/* Lamp */}
      <div className="absolute -top-[60%] left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 bg-gradient-to-b from-yellow-200 to-yellow-100 rounded-t-full" 
             style={{ boxShadow: '0 0 20px 10px rgba(255,255,100,0.3)' }} />
        <div className="w-3 h-4 bg-amber-600 mx-auto" />
      </div>
    </div>
    
    {/* Rug */}
    <div className="absolute bottom-0 left-[30%] w-[40%] h-[10%] bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-full opacity-80" />
  </div>
);

// Water for beach theme
const Water = ({ type = 'ocean' }: { type?: 'ocean' | 'lake' }) => (
  <div className="absolute bottom-[15%] left-0 right-0 h-[25%] overflow-hidden">
    <div 
      className="absolute inset-0"
      style={{
        background: type === 'ocean' 
          ? 'linear-gradient(180deg, #48dbfb 0%, #0abde3 30%, #0984e3 60%, #2d3436 100%)'
          : 'linear-gradient(180deg, #74b9ff 0%, #0984e3 50%, #2d3436 100%)',
      }}
    />
    {/* Wave layers */}
    {[0, 1, 2].map((i) => (
      <motion.svg 
        key={i}
        className="absolute w-[200%] h-10" 
        viewBox="0 0 1200 40" 
        preserveAspectRatio="none"
        style={{ bottom: `${i * 12}%`, opacity: 1 - i * 0.2 }}
        animate={{ x: [0, -600, 0] }}
        transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
      >
        <path
          d="M0 20 Q75 0 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20 V40 H0 Z"
          fill={`rgba(255,255,255,${0.4 - i * 0.1})`}
        />
      </motion.svg>
    ))}
    {/* Foam on shore */}
    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-white/50 to-transparent" />
  </div>
);

// Generate vibrant layers based on theme
function generateLayers(
  theme: BackgroundTheme,
  season: Season,
  timeOfDay: TimeOfDay
): ParallaxLayer[] {
  const layers: ParallaxLayer[] = [];
  const palette = SEASON_PALETTES[season];

  // Sky layer with gradient
  layers.push({
    id: 'sky',
    zIndex: 0,
    speed: 0,
    content: (
      <div 
        className="absolute inset-0"
        style={{ background: SKY_GRADIENTS[timeOfDay] }}
      />
    ),
  });

  // Clouds (not at night)
  if (timeOfDay !== 'night' && theme !== 'bedroom') {
    layers.push({
      id: 'clouds',
      zIndex: 1,
      speed: 0.05,
      content: <Clouds timeOfDay={timeOfDay} />,
    });
  }

  // Sun/Moon
  if (theme !== 'bedroom') {
    layers.push({
      id: 'celestial',
      zIndex: 2,
      speed: 0.02,
      content: <Sun timeOfDay={timeOfDay} />,
    });
  }

  // Stars and fireflies for night
  if (timeOfDay === 'night' && theme !== 'bedroom') {
    layers.push({
      id: 'stars',
      zIndex: 1,
      speed: 0.01,
      content: <Stars />,
    });
    
    if (theme !== 'beach') {
      layers.push({
        id: 'fireflies',
        zIndex: 8,
        speed: 0,
        content: <Fireflies />,
      });
    }
  }

  // Theme-specific layers
  switch (theme) {
    case 'meadow':
    case 'park':
      // Distant mountains with gradient
      layers.push({
        id: 'mountains',
        zIndex: 3,
        speed: 0.15,
        content: (
          <>
            <Mountain color1="#7f8c8d" color2="#95a5a6" x={15} scale={1.3} />
            <Mountain color1="#636e72" color2="#b2bec3" x={45} scale={1.6} snowCap={season !== 'summer'} />
            <Mountain color1="#7f8c8d" color2="#95a5a6" x={80} scale={1.1} />
          </>
        ),
      });
      
      // Rolling hills
      layers.push({
        id: 'hills-back',
        zIndex: 4,
        speed: 0.25,
        content: (
          <>
            <RollingHill x={20} width={60} height={18} colors={[palette.grass[2], palette.grass[3]]} />
            <RollingHill x={70} width={70} height={22} colors={[palette.grass[1], palette.grass[2]]} flip />
          </>
        ),
      });

      layers.push({
        id: 'hills-front',
        zIndex: 5,
        speed: 0.4,
        content: (
          <>
            <RollingHill x={10} width={50} height={15} colors={[palette.grass[0], palette.grass[1]]} />
            <RollingHill x={85} width={55} height={17} colors={[palette.grass[0], palette.grass[2]]} flip />
          </>
        ),
      });
      
      // Trees
      layers.push({
        id: 'trees',
        zIndex: 6,
        speed: 0.5,
        content: (
          <>
            <Tree x={8} scale={0.9} type="oak" colors={palette.trees} />
            <Tree x={22} scale={1.1} type="pine" colors={palette.trees} />
            <Tree x={78} scale={0.85} type={season === 'spring' ? 'cherry' : 'oak'} colors={palette.trees} />
            <Tree x={92} scale={1} type="pine" colors={palette.trees} />
          </>
        ),
      });
      
      // Flowers and grass
      layers.push({
        id: 'decorations',
        zIndex: 7,
        speed: 0.6,
        content: (
          <>
            {/* Grass clusters */}
            {[5, 15, 35, 55, 65, 85, 95].map((x) => (
              <GrassCluster key={x} x={x} colors={palette.grass} density={x % 2 === 0 ? 'dense' : 'normal'} />
            ))}
            {/* Flowers */}
            {season !== 'winter' && (
              <>
                <Flower x={12} color={palette.flowers[0]} size={0.8} />
                <Flower x={28} color={palette.flowers[1]} size={1} />
                <Flower x={42} color={palette.flowers[2]} size={0.9} />
                <Flower x={58} color={palette.flowers[3]} size={1.1} />
                <Flower x={72} color={palette.flowers[0]} size={0.85} />
                <Flower x={88} color={palette.flowers[4]} size={0.95} />
              </>
            )}
          </>
        ),
      });
      
      // Butterflies in day/dawn/dusk
      if (timeOfDay !== 'night' && season !== 'winter') {
        layers.push({
          id: 'butterflies',
          zIndex: 9,
          speed: 0,
          content: <Butterflies colors={palette.accent} />,
        });
      }
      break;

    case 'forest':
      // Dense tree layers
      layers.push({
        id: 'trees-far',
        zIndex: 3,
        speed: 0.15,
        content: (
          <>
            {[...Array(10)].map((_, i) => (
              <Tree key={i} x={i * 11 + 3} scale={0.5} type="pine" colors={palette.trees.map(c => c + '88')} />
            ))}
          </>
        ),
      });
      
      layers.push({
        id: 'trees-mid',
        zIndex: 4,
        speed: 0.3,
        content: (
          <>
            {[...Array(7)].map((_, i) => (
              <Tree key={i} x={i * 15 + 5} scale={0.75} type="pine" colors={palette.trees} />
            ))}
          </>
        ),
      });
      
      layers.push({
        id: 'trees-front',
        zIndex: 6,
        speed: 0.6,
        content: (
          <>
            <Tree x={3} scale={1.4} type="pine" colors={palette.trees} />
            <Tree x={97} scale={1.3} type="pine" colors={palette.trees} />
          </>
        ),
      });
      
      // Undergrowth
      layers.push({
        id: 'undergrowth',
        zIndex: 7,
        speed: 0.55,
        content: (
          <>
            {[...Array(15)].map((_, i) => (
              <GrassCluster key={i} x={i * 7 + 2} colors={palette.grass} density="dense" />
            ))}
          </>
        ),
      });
      break;

    case 'beach':
      // Ocean
      layers.push({
        id: 'ocean',
        zIndex: 3,
        speed: 0.2,
        content: <Water type="ocean" />,
      });
      
      // Palm trees
      layers.push({
        id: 'palms',
        zIndex: 5,
        speed: 0.5,
        content: (
          <>
            <Tree x={8} scale={1.1} type="palm" colors={['#27ae60', '#2ecc71']} />
            <Tree x={88} scale={1.3} type="palm" colors={['#27ae60', '#2ecc71']} />
            <Tree x={15} scale={0.8} type="palm" colors={['#27ae60', '#2ecc71']} />
          </>
        ),
      });
      
      // Beach sand gradient
      layers.push({
        id: 'sand',
        zIndex: 4,
        speed: 0.4,
        content: (
          <div 
            className="absolute bottom-0 left-0 right-0 h-[18%]"
            style={{ 
              background: 'linear-gradient(180deg, #f6d365 0%, #fda085 50%, #e6b980 100%)',
              borderTopLeftRadius: '40% 30px',
              borderTopRightRadius: '40% 30px',
            }}
          >
            {/* Sand texture */}
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 rounded-full bg-amber-200/50"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        ),
      });
      break;

    case 'night':
      // Silhouette hills
      layers.push({
        id: 'hills-silhouette',
        zIndex: 3,
        speed: 0.2,
        content: (
          <>
            <RollingHill x={25} width={70} height={25} colors={['#1a1a2e', '#16213e']} />
            <RollingHill x={75} width={65} height={22} colors={['#16213e', '#1a1a2e']} flip />
          </>
        ),
      });
      
      // Silhouette trees
      layers.push({
        id: 'trees-silhouette',
        zIndex: 4,
        speed: 0.35,
        content: (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute bottom-[18%]"
                style={{
                  left: `${i * 18 + 5}%`,
                  width: '8%',
                  height: '25%',
                  background: '#0a0a15',
                  clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                }}
              />
            ))}
          </>
        ),
      });
      break;

    case 'bedroom':
      layers.push({
        id: 'room-bg',
        zIndex: 2,
        speed: 0,
        content: (
          <div 
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%)' }}
          />
        ),
      });
      layers.push({
        id: 'furniture',
        zIndex: 3,
        speed: 0,
        content: <Furniture />,
      });
      // Skip ground layer for bedroom
      return layers;
  }

  // Vibrant ground layer
  layers.push({
    id: 'ground',
    zIndex: 10,
    speed: 0.7,
    content: <VibrantGround colors={palette.grass} season={season} />,
  });

  return layers;
}

export default function ParallaxBackground({
  theme = 'meadow',
  season = 'summer',
  timeOfDay = 'day',
  animationProgress = 0,
  enableParallax = true,
  className = '',
}: ParallaxBackgroundProps) {
  const safeTheme: BackgroundTheme = ['meadow', 'forest', 'beach', 'night', 'bedroom', 'park'].includes(theme) 
    ? theme 
    : 'meadow';
  const safeSeason: Season = ['spring', 'summer', 'autumn', 'winter'].includes(season) 
    ? season 
    : 'summer';
  const safeTimeOfDay: TimeOfDay = ['dawn', 'day', 'dusk', 'night'].includes(timeOfDay) 
    ? timeOfDay 
    : 'day';
    
  const layers = useMemo(() => 
    generateLayers(safeTheme, safeSeason, safeTimeOfDay), 
    [safeTheme, safeSeason, safeTimeOfDay]
  );
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Add animation keyframes */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
      
      {layers
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((layer) => {
          const parallaxOffset = enableParallax 
            ? (animationProgress - 0.5) * layer.speed * 60 
            : 0;

          return (
            <motion.div
              key={layer.id}
              className="absolute inset-0"
              style={{ zIndex: layer.zIndex }}
              animate={{ x: parallaxOffset }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 20,
              }}
            >
              {layer.content}
            </motion.div>
          );
        })}
    </div>
  );
}

// Export individual components for custom use
export { Sun, Mountain, Tree, RollingHill, Water, Stars, Fireflies, Furniture, Clouds, Flower, GrassCluster, Butterflies };
