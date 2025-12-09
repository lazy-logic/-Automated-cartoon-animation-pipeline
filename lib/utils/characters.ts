/**
 * Professional Character System with Full Animation Support
 * Uses GSAP for smooth, realistic animations
 * Designed for children's cartoon animations (Peppa Pig / Dora style)
 */

export interface CharacterPart {
  id: string;
  name: string;
  path: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  pivotX: number;
  pivotY: number;
  zIndex: number;
  parentId?: string;
}

export interface AnimatedCharacter {
  id: string;
  name: string;
  category: 'child' | 'adult' | 'animal' | 'fantasy';
  description: string;
  viewBox: string;
  width: number;
  height: number;
  parts: CharacterPart[];
  animations: CharacterAnimationSet;
  colors: {
    primary: string;
    secondary: string;
    skin: string;
  };
}

export interface CharacterAnimationSet {
  idle: AnimationKeyframes;
  walk: AnimationKeyframes;
  wave: AnimationKeyframes;
  talk: AnimationKeyframes;
  jump: AnimationKeyframes;
  sit: AnimationKeyframes;
}

export interface AnimationKeyframes {
  duration: number;
  loop: boolean;
  keyframes: {
    time: number;
    parts: Record<string, PartTransform>;
  }[];
}

export interface PartTransform {
  rotation?: number;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
}

// ============================================================================
// PROFESSIONAL ANIMATED CHARACTERS
// ============================================================================

export const ANIMATED_CHARACTERS: AnimatedCharacter[] = [
  {
    id: 'char-girl',
    name: 'Luna',
    category: 'child',
    description: 'A curious and brave girl with a pink dress',
    viewBox: '0 0 200 300',
    width: 200,
    height: 300,
    colors: {
      primary: '#FF6B9D',
      secondary: '#FF8FB3',
      skin: '#FFDAB9',
    },
    parts: [
      // Shadow
      {
        id: 'shadow',
        name: 'Shadow',
        path: 'M60,290 Q100,300 140,290 Q100,295 60,290',
        fill: 'rgba(0,0,0,0.15)',
        pivotX: 100,
        pivotY: 290,
        zIndex: 0,
      },
      // Left Leg
      {
        id: 'leg-left',
        name: 'Left Leg',
        path: 'M75,195 L70,260 Q68,275 75,280 L90,280 Q95,275 93,260 L88,195 Z',
        fill: '#5B8DEE',
        stroke: '#4A7BD9',
        strokeWidth: 2,
        pivotX: 82,
        pivotY: 195,
        zIndex: 1,
      },
      // Right Leg
      {
        id: 'leg-right',
        name: 'Right Leg',
        path: 'M112,195 L107,260 Q105,275 112,280 L127,280 Q132,275 130,260 L125,195 Z',
        fill: '#5B8DEE',
        stroke: '#4A7BD9',
        strokeWidth: 2,
        pivotX: 118,
        pivotY: 195,
        zIndex: 1,
      },
      // Left Shoe
      {
        id: 'shoe-left',
        name: 'Left Shoe',
        path: 'M65,275 Q60,280 62,288 L95,288 Q98,280 95,275 Z',
        fill: '#E74C3C',
        stroke: '#C0392B',
        strokeWidth: 1,
        pivotX: 78,
        pivotY: 280,
        zIndex: 2,
        parentId: 'leg-left',
      },
      // Right Shoe
      {
        id: 'shoe-right',
        name: 'Right Shoe',
        path: 'M105,275 Q102,280 105,288 L138,288 Q140,280 137,275 Z',
        fill: '#E74C3C',
        stroke: '#C0392B',
        strokeWidth: 1,
        pivotX: 122,
        pivotY: 280,
        zIndex: 2,
        parentId: 'leg-right',
      },
      // Body/Dress
      {
        id: 'body',
        name: 'Body',
        path: 'M65,110 Q60,130 62,160 Q65,200 75,200 L125,200 Q135,200 138,160 Q140,130 135,110 Q120,105 100,105 Q80,105 65,110 Z',
        fill: '#FF6B9D',
        stroke: '#E55A8A',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 150,
        zIndex: 3,
      },
      // Dress Pattern
      {
        id: 'dress-pattern',
        name: 'Dress Pattern',
        path: 'M80,140 Q100,145 120,140 M75,165 Q100,172 125,165 M78,190 Q100,198 122,190',
        fill: 'none',
        stroke: '#FF8FB3',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 165,
        zIndex: 4,
      },
      // Left Arm
      {
        id: 'arm-left',
        name: 'Left Arm',
        path: 'M65,115 Q50,130 45,160 Q43,175 50,180 L60,175 Q65,165 68,140 Q70,125 68,115 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 65,
        pivotY: 115,
        zIndex: 5,
      },
      // Right Arm
      {
        id: 'arm-right',
        name: 'Right Arm',
        path: 'M135,115 Q150,130 155,160 Q157,175 150,180 L140,175 Q135,165 132,140 Q130,125 132,115 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 135,
        pivotY: 115,
        zIndex: 5,
      },
      // Left Hand
      {
        id: 'hand-left',
        name: 'Left Hand',
        path: 'M45,175 Q38,180 40,190 Q45,195 55,192 Q62,188 60,180 Q58,175 50,175 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 50,
        pivotY: 182,
        zIndex: 6,
        parentId: 'arm-left',
      },
      // Right Hand
      {
        id: 'hand-right',
        name: 'Right Hand',
        path: 'M155,175 Q162,180 160,190 Q155,195 145,192 Q138,188 140,180 Q142,175 150,175 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 150,
        pivotY: 182,
        zIndex: 6,
        parentId: 'arm-right',
      },
      // Neck
      {
        id: 'neck',
        name: 'Neck',
        path: 'M90,95 L90,110 L110,110 L110,95 Z',
        fill: '#FFDAB9',
        pivotX: 100,
        pivotY: 102,
        zIndex: 7,
      },
      // Head
      {
        id: 'head',
        name: 'Head',
        path: 'M60,50 Q60,20 100,15 Q140,20 140,50 Q145,80 130,95 Q100,105 70,95 Q55,80 60,50 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 100,
        pivotY: 60,
        zIndex: 8,
      },
      // Hair Back
      {
        id: 'hair-back',
        name: 'Hair Back',
        path: 'M55,45 Q50,20 100,10 Q150,20 145,45 Q150,100 130,120 Q100,130 70,120 Q50,100 55,45 Z',
        fill: '#8B4513',
        pivotX: 100,
        pivotY: 60,
        zIndex: 7,
      },
      // Hair Front
      {
        id: 'hair-front',
        name: 'Hair Front',
        path: 'M60,45 Q55,25 100,18 Q145,25 140,45 Q142,55 135,55 Q130,40 100,35 Q70,40 65,55 Q58,55 60,45 Z',
        fill: '#A0522D',
        pivotX: 100,
        pivotY: 40,
        zIndex: 10,
      },
      // Left Eye
      {
        id: 'eye-left',
        name: 'Left Eye',
        path: 'M75,55 Q75,45 85,45 Q95,45 95,55 Q95,65 85,65 Q75,65 75,55 Z',
        fill: '#FFFFFF',
        stroke: '#333',
        strokeWidth: 1,
        pivotX: 85,
        pivotY: 55,
        zIndex: 11,
      },
      // Left Pupil
      {
        id: 'pupil-left',
        name: 'Left Pupil',
        path: 'M82,55 Q82,50 87,50 Q92,50 92,55 Q92,60 87,60 Q82,60 82,55 Z',
        fill: '#4A90D9',
        pivotX: 87,
        pivotY: 55,
        zIndex: 12,
      },
      // Left Pupil Center
      {
        id: 'pupil-center-left',
        name: 'Left Pupil Center',
        path: 'M85,54 A3,3 0 1,1 85,55 A3,3 0 1,1 85,54',
        fill: '#222',
        pivotX: 85,
        pivotY: 55,
        zIndex: 13,
      },
      // Right Eye
      {
        id: 'eye-right',
        name: 'Right Eye',
        path: 'M105,55 Q105,45 115,45 Q125,45 125,55 Q125,65 115,65 Q105,65 105,55 Z',
        fill: '#FFFFFF',
        stroke: '#333',
        strokeWidth: 1,
        pivotX: 115,
        pivotY: 55,
        zIndex: 11,
      },
      // Right Pupil
      {
        id: 'pupil-right',
        name: 'Right Pupil',
        path: 'M108,55 Q108,50 113,50 Q118,50 118,55 Q118,60 113,60 Q108,60 108,55 Z',
        fill: '#4A90D9',
        pivotX: 113,
        pivotY: 55,
        zIndex: 12,
      },
      // Right Pupil Center
      {
        id: 'pupil-center-right',
        name: 'Right Pupil Center',
        path: 'M113,54 A3,3 0 1,1 113,55 A3,3 0 1,1 113,54',
        fill: '#222',
        pivotX: 113,
        pivotY: 55,
        zIndex: 13,
      },
      // Eyebrows
      {
        id: 'eyebrow-left',
        name: 'Left Eyebrow',
        path: 'M73,42 Q85,38 95,42',
        fill: 'none',
        stroke: '#6B3A1F',
        strokeWidth: 2,
        pivotX: 84,
        pivotY: 40,
        zIndex: 14,
      },
      {
        id: 'eyebrow-right',
        name: 'Right Eyebrow',
        path: 'M105,42 Q115,38 127,42',
        fill: 'none',
        stroke: '#6B3A1F',
        strokeWidth: 2,
        pivotX: 116,
        pivotY: 40,
        zIndex: 14,
      },
      // Nose
      {
        id: 'nose',
        name: 'Nose',
        path: 'M98,60 Q100,70 102,60',
        fill: 'none',
        stroke: '#D4A574',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 65,
        zIndex: 14,
      },
      // Mouth
      {
        id: 'mouth',
        name: 'Mouth',
        path: 'M85,78 Q100,88 115,78',
        fill: 'none',
        stroke: '#E74C3C',
        strokeWidth: 3,
        pivotX: 100,
        pivotY: 83,
        zIndex: 14,
      },
      // Blush Left
      {
        id: 'blush-left',
        name: 'Left Blush',
        path: 'M70,70 Q75,72 80,70 Q75,68 70,70',
        fill: '#FFB6C1',
        pivotX: 75,
        pivotY: 70,
        zIndex: 14,
      },
      // Blush Right
      {
        id: 'blush-right',
        name: 'Right Blush',
        path: 'M120,70 Q125,72 130,70 Q125,68 120,70',
        fill: '#FFB6C1',
        pivotX: 125,
        pivotY: 70,
        zIndex: 14,
      },
    ],
    animations: {
      idle: {
        duration: 2,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'head': { y: 0, rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
          { time: 0.5, parts: { 'body': { y: -3 }, 'head': { y: -3, rotation: 1 }, 'arm-left': { rotation: 2 }, 'arm-right': { rotation: -2 } } },
          { time: 1, parts: { 'body': { y: 0 }, 'head': { y: 0, rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
        ],
      },
      walk: {
        duration: 0.8,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 }, 'body': { y: 0 } } },
          { time: 0.25, parts: { 'leg-left': { rotation: -25 }, 'leg-right': { rotation: 25 }, 'arm-left': { rotation: 20 }, 'arm-right': { rotation: -20 }, 'body': { y: -5 } } },
          { time: 0.5, parts: { 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 }, 'body': { y: 0 } } },
          { time: 0.75, parts: { 'leg-left': { rotation: 25 }, 'leg-right': { rotation: -25 }, 'arm-left': { rotation: -20 }, 'arm-right': { rotation: 20 }, 'body': { y: -5 } } },
          { time: 1, parts: { 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 }, 'body': { y: 0 } } },
        ],
      },
      wave: {
        duration: 1.2,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'arm-right': { rotation: 0 } } },
          { time: 0.15, parts: { 'arm-right': { rotation: -120 } } },
          { time: 0.3, parts: { 'arm-right': { rotation: -100 } } },
          { time: 0.45, parts: { 'arm-right': { rotation: -120 } } },
          { time: 0.6, parts: { 'arm-right': { rotation: -100 } } },
          { time: 0.75, parts: { 'arm-right': { rotation: -120 } } },
          { time: 1, parts: { 'arm-right': { rotation: 0 } } },
        ],
      },
      talk: {
        duration: 0.3,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'mouth': { scaleY: 1 }, 'head': { rotation: 0 } } },
          { time: 0.5, parts: { 'mouth': { scaleY: 1.5 }, 'head': { rotation: 2 } } },
          { time: 1, parts: { 'mouth': { scaleY: 1 }, 'head': { rotation: 0 } } },
        ],
      },
      jump: {
        duration: 0.8,
        loop: false,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
          { time: 0.2, parts: { 'body': { y: 10 }, 'leg-left': { rotation: 15 }, 'leg-right': { rotation: -15 } } },
          { time: 0.5, parts: { 'body': { y: -50 }, 'leg-left': { rotation: -20 }, 'leg-right': { rotation: 20 }, 'arm-left': { rotation: -45 }, 'arm-right': { rotation: -45 } } },
          { time: 0.8, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
          { time: 1, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
        ],
      },
      sit: {
        duration: 0.5,
        loop: false,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 } } },
          { time: 1, parts: { 'body': { y: 30 }, 'leg-left': { rotation: 90 }, 'leg-right': { rotation: 90 } } },
        ],
      },
    },
  },
  {
    id: 'char-boy',
    name: 'Max',
    category: 'child',
    description: 'A friendly and adventurous boy in blue',
    viewBox: '0 0 200 300',
    width: 200,
    height: 300,
    colors: {
      primary: '#3498DB',
      secondary: '#2980B9',
      skin: '#FFDAB9',
    },
    parts: [
      // Shadow
      {
        id: 'shadow',
        name: 'Shadow',
        path: 'M60,290 Q100,300 140,290 Q100,295 60,290',
        fill: 'rgba(0,0,0,0.15)',
        pivotX: 100,
        pivotY: 290,
        zIndex: 0,
      },
      // Left Leg
      {
        id: 'leg-left',
        name: 'Left Leg',
        path: 'M75,190 L72,255 Q70,270 77,275 L92,275 Q97,270 95,255 L90,190 Z',
        fill: '#4A5568',
        stroke: '#2D3748',
        strokeWidth: 2,
        pivotX: 83,
        pivotY: 190,
        zIndex: 1,
      },
      // Right Leg
      {
        id: 'leg-right',
        name: 'Right Leg',
        path: 'M110,190 L108,255 Q106,270 113,275 L128,275 Q133,270 130,255 L125,190 Z',
        fill: '#4A5568',
        stroke: '#2D3748',
        strokeWidth: 2,
        pivotX: 117,
        pivotY: 190,
        zIndex: 1,
      },
      // Left Shoe
      {
        id: 'shoe-left',
        name: 'Left Shoe',
        path: 'M68,270 Q62,275 65,285 L98,285 Q102,275 98,270 Z',
        fill: '#2ECC71',
        stroke: '#27AE60',
        strokeWidth: 1,
        pivotX: 80,
        pivotY: 277,
        zIndex: 2,
        parentId: 'leg-left',
      },
      // Right Shoe
      {
        id: 'shoe-right',
        name: 'Right Shoe',
        path: 'M102,270 Q98,275 102,285 L135,285 Q138,275 135,270 Z',
        fill: '#2ECC71',
        stroke: '#27AE60',
        strokeWidth: 1,
        pivotX: 118,
        pivotY: 277,
        zIndex: 2,
        parentId: 'leg-right',
      },
      // Body/Shirt
      {
        id: 'body',
        name: 'Body',
        path: 'M68,105 Q62,125 65,155 Q68,195 78,195 L122,195 Q132,195 135,155 Q138,125 132,105 Q118,100 100,100 Q82,100 68,105 Z',
        fill: '#3498DB',
        stroke: '#2980B9',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 145,
        zIndex: 3,
      },
      // Shirt Collar
      {
        id: 'collar',
        name: 'Collar',
        path: 'M85,105 L100,120 L115,105',
        fill: 'none',
        stroke: '#2980B9',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 112,
        zIndex: 4,
      },
      // Left Arm
      {
        id: 'arm-left',
        name: 'Left Arm',
        path: 'M68,110 Q52,125 48,155 Q45,170 52,175 L62,170 Q67,160 70,135 Q72,120 70,110 Z',
        fill: '#3498DB',
        stroke: '#2980B9',
        strokeWidth: 1,
        pivotX: 68,
        pivotY: 110,
        zIndex: 5,
      },
      // Right Arm
      {
        id: 'arm-right',
        name: 'Right Arm',
        path: 'M132,110 Q148,125 152,155 Q155,170 148,175 L138,170 Q133,160 130,135 Q128,120 130,110 Z',
        fill: '#3498DB',
        stroke: '#2980B9',
        strokeWidth: 1,
        pivotX: 132,
        pivotY: 110,
        zIndex: 5,
      },
      // Left Hand
      {
        id: 'hand-left',
        name: 'Left Hand',
        path: 'M48,170 Q40,175 42,185 Q47,192 57,188 Q64,183 62,175 Q60,170 52,170 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 52,
        pivotY: 178,
        zIndex: 6,
        parentId: 'arm-left',
      },
      // Right Hand
      {
        id: 'hand-right',
        name: 'Right Hand',
        path: 'M152,170 Q160,175 158,185 Q153,192 143,188 Q136,183 138,175 Q140,170 148,170 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 148,
        pivotY: 178,
        zIndex: 6,
        parentId: 'arm-right',
      },
      // Neck
      {
        id: 'neck',
        name: 'Neck',
        path: 'M92,90 L92,105 L108,105 L108,90 Z',
        fill: '#FFDAB9',
        pivotX: 100,
        pivotY: 97,
        zIndex: 7,
      },
      // Head
      {
        id: 'head',
        name: 'Head',
        path: 'M62,48 Q62,18 100,12 Q138,18 138,48 Q142,78 128,92 Q100,102 72,92 Q58,78 62,48 Z',
        fill: '#FFDAB9',
        stroke: '#E8C4A0',
        strokeWidth: 1,
        pivotX: 100,
        pivotY: 55,
        zIndex: 8,
      },
      // Hair
      {
        id: 'hair',
        name: 'Hair',
        path: 'M58,42 Q55,15 100,8 Q145,15 142,42 Q145,50 138,52 Q135,30 100,25 Q65,30 62,52 Q55,50 58,42 Z',
        fill: '#2C3E50',
        pivotX: 100,
        pivotY: 30,
        zIndex: 10,
      },
      // Left Eye
      {
        id: 'eye-left',
        name: 'Left Eye',
        path: 'M77,52 Q77,43 86,43 Q95,43 95,52 Q95,61 86,61 Q77,61 77,52 Z',
        fill: '#FFFFFF',
        stroke: '#333',
        strokeWidth: 1,
        pivotX: 86,
        pivotY: 52,
        zIndex: 11,
      },
      // Left Pupil
      {
        id: 'pupil-left',
        name: 'Left Pupil',
        path: 'M83,52 A4,4 0 1,1 83,53 A4,4 0 1,1 83,52',
        fill: '#2C3E50',
        pivotX: 86,
        pivotY: 52,
        zIndex: 12,
      },
      // Right Eye
      {
        id: 'eye-right',
        name: 'Right Eye',
        path: 'M105,52 Q105,43 114,43 Q123,43 123,52 Q123,61 114,61 Q105,61 105,52 Z',
        fill: '#FFFFFF',
        stroke: '#333',
        strokeWidth: 1,
        pivotX: 114,
        pivotY: 52,
        zIndex: 11,
      },
      // Right Pupil
      {
        id: 'pupil-right',
        name: 'Right Pupil',
        path: 'M111,52 A4,4 0 1,1 111,53 A4,4 0 1,1 111,52',
        fill: '#2C3E50',
        pivotX: 114,
        pivotY: 52,
        zIndex: 12,
      },
      // Eyebrows
      {
        id: 'eyebrow-left',
        name: 'Left Eyebrow',
        path: 'M75,40 Q86,35 97,40',
        fill: 'none',
        stroke: '#1A252F',
        strokeWidth: 3,
        pivotX: 86,
        pivotY: 37,
        zIndex: 14,
      },
      {
        id: 'eyebrow-right',
        name: 'Right Eyebrow',
        path: 'M103,40 Q114,35 125,40',
        fill: 'none',
        stroke: '#1A252F',
        strokeWidth: 3,
        pivotX: 114,
        pivotY: 37,
        zIndex: 14,
      },
      // Nose
      {
        id: 'nose',
        name: 'Nose',
        path: 'M97,55 L100,68 L103,55',
        fill: 'none',
        stroke: '#D4A574',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 62,
        zIndex: 14,
      },
      // Mouth
      {
        id: 'mouth',
        name: 'Mouth',
        path: 'M88,75 Q100,85 112,75',
        fill: 'none',
        stroke: '#E74C3C',
        strokeWidth: 3,
        pivotX: 100,
        pivotY: 80,
        zIndex: 14,
      },
    ],
    animations: {
      idle: {
        duration: 2,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'head': { y: 0, rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
          { time: 0.5, parts: { 'body': { y: -2 }, 'head': { y: -2, rotation: -1 }, 'arm-left': { rotation: -2 }, 'arm-right': { rotation: 2 } } },
          { time: 1, parts: { 'body': { y: 0 }, 'head': { y: 0, rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
        ],
      },
      walk: {
        duration: 0.7,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 }, 'body': { y: 0, rotation: 0 } } },
          { time: 0.25, parts: { 'leg-left': { rotation: -30 }, 'leg-right': { rotation: 30 }, 'arm-left': { rotation: 25 }, 'arm-right': { rotation: -25 }, 'body': { y: -4, rotation: 2 } } },
          { time: 0.5, parts: { 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 }, 'body': { y: 0, rotation: 0 } } },
          { time: 0.75, parts: { 'leg-left': { rotation: 30 }, 'leg-right': { rotation: -30 }, 'arm-left': { rotation: -25 }, 'arm-right': { rotation: 25 }, 'body': { y: -4, rotation: -2 } } },
          { time: 1, parts: { 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 }, 'body': { y: 0, rotation: 0 } } },
        ],
      },
      wave: {
        duration: 1,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'arm-right': { rotation: 0 }, 'hand-right': { rotation: 0 } } },
          { time: 0.2, parts: { 'arm-right': { rotation: -130 }, 'hand-right': { rotation: 10 } } },
          { time: 0.35, parts: { 'arm-right': { rotation: -110 }, 'hand-right': { rotation: -10 } } },
          { time: 0.5, parts: { 'arm-right': { rotation: -130 }, 'hand-right': { rotation: 10 } } },
          { time: 0.65, parts: { 'arm-right': { rotation: -110 }, 'hand-right': { rotation: -10 } } },
          { time: 0.8, parts: { 'arm-right': { rotation: -130 }, 'hand-right': { rotation: 10 } } },
          { time: 1, parts: { 'arm-right': { rotation: 0 }, 'hand-right': { rotation: 0 } } },
        ],
      },
      talk: {
        duration: 0.25,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'mouth': { scaleY: 1 }, 'head': { rotation: 0 }, 'eyebrow-left': { y: 0 }, 'eyebrow-right': { y: 0 } } },
          { time: 0.5, parts: { 'mouth': { scaleY: 1.4 }, 'head': { rotation: 1.5 }, 'eyebrow-left': { y: -2 }, 'eyebrow-right': { y: -2 } } },
          { time: 1, parts: { 'mouth': { scaleY: 1 }, 'head': { rotation: 0 }, 'eyebrow-left': { y: 0 }, 'eyebrow-right': { y: 0 } } },
        ],
      },
      jump: {
        duration: 0.7,
        loop: false,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
          { time: 0.15, parts: { 'body': { y: 8 }, 'leg-left': { rotation: 20 }, 'leg-right': { rotation: -20 } } },
          { time: 0.45, parts: { 'body': { y: -60 }, 'leg-left': { rotation: -15 }, 'leg-right': { rotation: 15 }, 'arm-left': { rotation: -50 }, 'arm-right': { rotation: -50 } } },
          { time: 0.75, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
          { time: 1, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 }, 'arm-left': { rotation: 0 }, 'arm-right': { rotation: 0 } } },
        ],
      },
      sit: {
        duration: 0.5,
        loop: false,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'leg-left': { rotation: 0 }, 'leg-right': { rotation: 0 } } },
          { time: 1, parts: { 'body': { y: 25 }, 'leg-left': { rotation: 85 }, 'leg-right': { rotation: 85 } } },
        ],
      },
    },
  },
  {
    id: 'char-cat',
    name: 'Whiskers',
    category: 'animal',
    description: 'A playful orange cat with green eyes',
    viewBox: '0 0 200 250',
    width: 200,
    height: 250,
    colors: {
      primary: '#FF9F43',
      secondary: '#E17055',
      skin: '#FFEAA7',
    },
    parts: [
      // Shadow
      {
        id: 'shadow',
        name: 'Shadow',
        path: 'M50,240 Q100,250 150,240 Q100,245 50,240',
        fill: 'rgba(0,0,0,0.15)',
        pivotX: 100,
        pivotY: 240,
        zIndex: 0,
      },
      // Tail
      {
        id: 'tail',
        name: 'Tail',
        path: 'M155,180 Q180,160 185,130 Q190,100 175,85 Q170,95 175,120 Q175,150 155,175 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 2,
        pivotX: 155,
        pivotY: 180,
        zIndex: 1,
      },
      // Back Leg Left
      {
        id: 'leg-back-left',
        name: 'Back Left Leg',
        path: 'M60,175 Q55,200 55,220 Q55,235 65,238 L80,238 Q85,235 82,220 Q80,200 78,175 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 1,
        pivotX: 70,
        pivotY: 175,
        zIndex: 2,
      },
      // Back Leg Right
      {
        id: 'leg-back-right',
        name: 'Back Right Leg',
        path: 'M120,175 Q118,200 118,220 Q118,235 128,238 L143,238 Q148,235 145,220 Q143,200 140,175 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 1,
        pivotX: 130,
        pivotY: 175,
        zIndex: 2,
      },
      // Body
      {
        id: 'body',
        name: 'Body',
        path: 'M50,100 Q40,130 45,160 Q50,190 70,195 L130,195 Q150,190 155,160 Q160,130 150,100 Q130,90 100,90 Q70,90 50,100 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 145,
        zIndex: 3,
      },
      // Belly
      {
        id: 'belly',
        name: 'Belly',
        path: 'M70,120 Q65,145 70,170 Q85,185 100,185 Q115,185 130,170 Q135,145 130,120 Q115,110 100,110 Q85,110 70,120 Z',
        fill: '#FFEAA7',
        pivotX: 100,
        pivotY: 147,
        zIndex: 4,
      },
      // Front Leg Left
      {
        id: 'leg-front-left',
        name: 'Front Left Leg',
        path: 'M55,145 Q50,175 50,205 Q50,225 60,228 L75,228 Q82,225 80,205 Q78,175 75,145 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 1,
        pivotX: 65,
        pivotY: 145,
        zIndex: 5,
      },
      // Front Leg Right
      {
        id: 'leg-front-right',
        name: 'Front Right Leg',
        path: 'M125,145 Q122,175 120,205 Q118,225 128,228 L143,228 Q150,225 150,205 Q150,175 145,145 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 1,
        pivotX: 135,
        pivotY: 145,
        zIndex: 5,
      },
      // Paw Left
      {
        id: 'paw-left',
        name: 'Left Paw',
        path: 'M48,222 Q45,230 50,235 L78,235 Q83,230 80,222 Z',
        fill: '#FFEAA7',
        pivotX: 65,
        pivotY: 228,
        zIndex: 6,
        parentId: 'leg-front-left',
      },
      // Paw Right
      {
        id: 'paw-right',
        name: 'Right Paw',
        path: 'M118,222 Q115,230 120,235 L148,235 Q153,230 150,222 Z',
        fill: '#FFEAA7',
        pivotX: 135,
        pivotY: 228,
        zIndex: 6,
        parentId: 'leg-front-right',
      },
      // Head
      {
        id: 'head',
        name: 'Head',
        path: 'M55,45 Q55,15 100,10 Q145,15 145,45 Q150,75 135,90 Q100,100 65,90 Q50,75 55,45 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 55,
        zIndex: 7,
      },
      // Left Ear
      {
        id: 'ear-left',
        name: 'Left Ear',
        path: 'M55,40 L45,5 L75,25 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 2,
        pivotX: 58,
        pivotY: 23,
        zIndex: 8,
      },
      // Left Ear Inner
      {
        id: 'ear-left-inner',
        name: 'Left Ear Inner',
        path: 'M58,35 L52,12 L70,27 Z',
        fill: '#FFB8B8',
        pivotX: 60,
        pivotY: 25,
        zIndex: 9,
      },
      // Right Ear
      {
        id: 'ear-right',
        name: 'Right Ear',
        path: 'M145,40 L155,5 L125,25 Z',
        fill: '#FF9F43',
        stroke: '#E17055',
        strokeWidth: 2,
        pivotX: 142,
        pivotY: 23,
        zIndex: 8,
      },
      // Right Ear Inner
      {
        id: 'ear-right-inner',
        name: 'Right Ear Inner',
        path: 'M142,35 L148,12 L130,27 Z',
        fill: '#FFB8B8',
        pivotX: 140,
        pivotY: 25,
        zIndex: 9,
      },
      // Face
      {
        id: 'face',
        name: 'Face',
        path: 'M65,50 Q65,35 100,30 Q135,35 135,50 Q138,70 125,80 Q100,88 75,80 Q62,70 65,50 Z',
        fill: '#FFEAA7',
        pivotX: 100,
        pivotY: 55,
        zIndex: 10,
      },
      // Left Eye
      {
        id: 'eye-left',
        name: 'Left Eye',
        path: 'M72,50 Q72,42 82,42 Q92,42 92,50 Q92,58 82,58 Q72,58 72,50 Z',
        fill: '#2ECC71',
        stroke: '#27AE60',
        strokeWidth: 1,
        pivotX: 82,
        pivotY: 50,
        zIndex: 11,
      },
      // Left Pupil
      {
        id: 'pupil-left',
        name: 'Left Pupil',
        path: 'M80,50 Q80,46 82,46 Q84,46 84,50 Q84,54 82,54 Q80,54 80,50 Z',
        fill: '#222',
        pivotX: 82,
        pivotY: 50,
        zIndex: 12,
      },
      // Right Eye
      {
        id: 'eye-right',
        name: 'Right Eye',
        path: 'M108,50 Q108,42 118,42 Q128,42 128,50 Q128,58 118,58 Q108,58 108,50 Z',
        fill: '#2ECC71',
        stroke: '#27AE60',
        strokeWidth: 1,
        pivotX: 118,
        pivotY: 50,
        zIndex: 11,
      },
      // Right Pupil
      {
        id: 'pupil-right',
        name: 'Right Pupil',
        path: 'M116,50 Q116,46 118,46 Q120,46 120,50 Q120,54 118,54 Q116,54 116,50 Z',
        fill: '#222',
        pivotX: 118,
        pivotY: 50,
        zIndex: 12,
      },
      // Nose
      {
        id: 'nose',
        name: 'Nose',
        path: 'M95,62 L100,68 L105,62 Z',
        fill: '#E17055',
        pivotX: 100,
        pivotY: 65,
        zIndex: 13,
      },
      // Mouth
      {
        id: 'mouth',
        name: 'Mouth',
        path: 'M100,68 L100,75 M95,75 Q100,80 105,75',
        fill: 'none',
        stroke: '#333',
        strokeWidth: 2,
        pivotX: 100,
        pivotY: 73,
        zIndex: 13,
      },
      // Whiskers Left
      {
        id: 'whiskers-left',
        name: 'Left Whiskers',
        path: 'M70,65 L45,60 M70,70 L45,70 M70,75 L45,80',
        fill: 'none',
        stroke: '#333',
        strokeWidth: 1,
        pivotX: 57,
        pivotY: 70,
        zIndex: 14,
      },
      // Whiskers Right
      {
        id: 'whiskers-right',
        name: 'Right Whiskers',
        path: 'M130,65 L155,60 M130,70 L155,70 M130,75 L155,80',
        fill: 'none',
        stroke: '#333',
        strokeWidth: 1,
        pivotX: 142,
        pivotY: 70,
        zIndex: 14,
      },
    ],
    animations: {
      idle: {
        duration: 2.5,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'head': { y: 0, rotation: 0 }, 'tail': { rotation: 0 }, 'ear-left': { rotation: 0 }, 'ear-right': { rotation: 0 } } },
          { time: 0.3, parts: { 'tail': { rotation: 15 }, 'ear-left': { rotation: -5 } } },
          { time: 0.5, parts: { 'body': { y: -2 }, 'head': { y: -2, rotation: 2 }, 'tail': { rotation: 0 } } },
          { time: 0.7, parts: { 'tail': { rotation: -15 }, 'ear-right': { rotation: 5 } } },
          { time: 1, parts: { 'body': { y: 0 }, 'head': { y: 0, rotation: 0 }, 'tail': { rotation: 0 }, 'ear-left': { rotation: 0 }, 'ear-right': { rotation: 0 } } },
        ],
      },
      walk: {
        duration: 0.6,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'leg-front-left': { rotation: 0 }, 'leg-front-right': { rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'body': { y: 0 }, 'tail': { rotation: 0 } } },
          { time: 0.25, parts: { 'leg-front-left': { rotation: -20 }, 'leg-front-right': { rotation: 20 }, 'leg-back-left': { rotation: 15 }, 'leg-back-right': { rotation: -15 }, 'body': { y: -3 }, 'tail': { rotation: 20 } } },
          { time: 0.5, parts: { 'leg-front-left': { rotation: 0 }, 'leg-front-right': { rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'body': { y: 0 }, 'tail': { rotation: 0 } } },
          { time: 0.75, parts: { 'leg-front-left': { rotation: 20 }, 'leg-front-right': { rotation: -20 }, 'leg-back-left': { rotation: -15 }, 'leg-back-right': { rotation: 15 }, 'body': { y: -3 }, 'tail': { rotation: -20 } } },
          { time: 1, parts: { 'leg-front-left': { rotation: 0 }, 'leg-front-right': { rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'body': { y: 0 }, 'tail': { rotation: 0 } } },
        ],
      },
      wave: {
        duration: 0.8,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'leg-front-right': { rotation: 0 }, 'paw-right': { rotation: 0 } } },
          { time: 0.2, parts: { 'leg-front-right': { rotation: -60 }, 'paw-right': { rotation: 15 } } },
          { time: 0.4, parts: { 'leg-front-right': { rotation: -45 }, 'paw-right': { rotation: -15 } } },
          { time: 0.6, parts: { 'leg-front-right': { rotation: -60 }, 'paw-right': { rotation: 15 } } },
          { time: 0.8, parts: { 'leg-front-right': { rotation: -45 }, 'paw-right': { rotation: -15 } } },
          { time: 1, parts: { 'leg-front-right': { rotation: 0 }, 'paw-right': { rotation: 0 } } },
        ],
      },
      talk: {
        duration: 0.2,
        loop: true,
        keyframes: [
          { time: 0, parts: { 'mouth': { scaleY: 1 } } },
          { time: 0.5, parts: { 'mouth': { scaleY: 1.3 } } },
          { time: 1, parts: { 'mouth': { scaleY: 1 } } },
        ],
      },
      jump: {
        duration: 0.6,
        loop: false,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0 }, 'leg-front-left': { rotation: 0 }, 'leg-front-right': { rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'tail': { rotation: 0 } } },
          { time: 0.2, parts: { 'body': { y: 10 }, 'leg-back-left': { rotation: 30 }, 'leg-back-right': { rotation: 30 } } },
          { time: 0.5, parts: { 'body': { y: -40 }, 'leg-front-left': { rotation: -30 }, 'leg-front-right': { rotation: -30 }, 'leg-back-left': { rotation: -20 }, 'leg-back-right': { rotation: -20 }, 'tail': { rotation: -30 } } },
          { time: 0.8, parts: { 'body': { y: 0 }, 'leg-front-left': { rotation: 0 }, 'leg-front-right': { rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'tail': { rotation: 0 } } },
          { time: 1, parts: { 'body': { y: 0 }, 'leg-front-left': { rotation: 0 }, 'leg-front-right': { rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'tail': { rotation: 0 } } },
        ],
      },
      sit: {
        duration: 0.4,
        loop: false,
        keyframes: [
          { time: 0, parts: { 'body': { y: 0, rotation: 0 }, 'leg-back-left': { rotation: 0 }, 'leg-back-right': { rotation: 0 }, 'tail': { rotation: 0 } } },
          { time: 1, parts: { 'body': { y: 20, rotation: -10 }, 'leg-back-left': { rotation: 60 }, 'leg-back-right': { rotation: 60 }, 'tail': { rotation: 45 } } },
        ],
      },
    },
  },
];

// Get character by ID or name
export function getCharacterById(id: string): AnimatedCharacter | undefined {
  // First try direct ID match
  let char = ANIMATED_CHARACTERS.find(c => c.id === id);
  if (char) return char;
  
  // Try name match (case insensitive)
  char = ANIMATED_CHARACTERS.find(c => c.name.toLowerCase() === id.toLowerCase());
  if (char) return char;
  
  // Try partial match
  const idLower = id.toLowerCase();
  if (idLower.includes('luna') || idLower.includes('girl')) {
    return ANIMATED_CHARACTERS.find(c => c.id === 'char-girl');
  }
  if (idLower.includes('max') || idLower.includes('boy')) {
    return ANIMATED_CHARACTERS.find(c => c.id === 'char-boy');
  }
  if (idLower.includes('whiskers') || idLower.includes('cat')) {
    return ANIMATED_CHARACTERS.find(c => c.id === 'char-cat');
  }
  
  return undefined;
}

// Get all characters
export function getAllCharacters(): AnimatedCharacter[] {
  return ANIMATED_CHARACTERS;
}

// Get character by name
export function getCharacterByName(name: string): AnimatedCharacter | undefined {
  return ANIMATED_CHARACTERS.find(c => c.name.toLowerCase() === name.toLowerCase());
}
