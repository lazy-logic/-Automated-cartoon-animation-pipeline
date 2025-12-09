// Sprite System - Defines character body parts and their properties
// This system allows for modular character construction and animation

export interface Vector2 {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2;
  rotation: number;
  scale: Vector2;
  pivot: Vector2; // Pivot point for rotation
}

export interface SpritePart {
  id: string;
  name: string;
  zIndex: number;
  defaultTransform: Transform;
  parentId: string | null; // For skeletal hierarchy
  children: string[];
  // SVG path or shape data
  shape: SpriteShape;
}

export type SpriteShape = 
  | { type: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill: string; stroke?: string; strokeWidth?: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number; rx?: number; fill: string; stroke?: string }
  | { type: 'path'; d: string; fill: string; stroke?: string; strokeWidth?: number }
  | { type: 'polygon'; points: string; fill: string; stroke?: string }
  | { type: 'group'; children: SpriteShape[] };

export interface CharacterRig {
  id: string;
  name: string;
  category: 'child' | 'adult' | 'animal' | 'fantasy';
  description: string;
  width: number;
  height: number;
  parts: Record<string, SpritePart>;
  rootPartId: string;
  colors: {
    primary: string;
    secondary: string;
    skin: string;
    hair: string;
    eyes: string;
  };
}

// Default transform
const defaultTransform = (): Transform => ({
  position: { x: 0, y: 0 },
  rotation: 0,
  scale: { x: 1, y: 1 },
  pivot: { x: 0.5, y: 0.5 },
});

// Create a human character rig
export function createHumanRig(
  id: string,
  name: string,
  category: 'child' | 'adult',
  colors: CharacterRig['colors'],
  description: string,
  variant: 'neutral' | 'feminine' | 'masculine' = 'neutral'
): CharacterRig {
  const isChild = category === 'child';
  const isFeminine = variant === 'feminine';
  const isMasculine = variant === 'masculine';

  const lowerId = id.toLowerCase();
  const isKiara = lowerId === 'kiara';
  const isJayden = lowerId === 'jayden';

  // Dora-style proportions: bigger heads, slightly shorter bodies/legs for kids
  const headSize = isChild ? 58 : 35;
  const bodyHeight = isChild ? 44 : 70;
  const legLength = isChild ? 36 : 55;
  const armLength = isChild ? 32 : 45;

  return {
    id,
    name,
    category,
    description,
    width: 120,
    height: isChild ? 180 : 220,
    colors,
    rootPartId: 'body',
    parts: {
      // Body (root)
      body: {
        id: 'body',
        name: 'Body',
        zIndex: 5,
        parentId: null,
        children: ['head', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 60, y: isChild ? 90 : 100 },
          pivot: { x: 0.5, y: 0.3 },
        },
        shape: {
          type: 'group',
          children: [
            // Torso
            {
              type: 'ellipse',
              cx: 0,
              cy: 0,
              rx: isChild ? (isFeminine ? 22 : isMasculine ? 26 : 24) : 25,
              ry: bodyHeight / 2,
              fill: colors.primary,
            },
            { type: 'ellipse', cx: 0, cy: -10, rx: 20, ry: 15, fill: colors.secondary },
          ],
        },
      },
      // Head
      head: {
        id: 'head',
        name: 'Head',
        zIndex: 10,
        parentId: 'body',
        children: ['leftEye', 'rightEye', 'mouth', 'hair', 'leftBrow', 'rightBrow'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: -bodyHeight / 2 - headSize / 2 + 5 },
          pivot: { x: 0.5, y: 0.8 },
        },
        shape: {
          type: 'group',
          children: [
            // Face
            { type: 'ellipse', cx: 0, cy: 0, rx: headSize / 2, ry: headSize / 2 * 1.05, fill: colors.skin },
            // Ears
            { type: 'ellipse', cx: -headSize / 2 + 2, cy: 0, rx: 5, ry: 8, fill: colors.skin },
            { type: 'ellipse', cx: headSize / 2 - 2, cy: 0, rx: 5, ry: 8, fill: colors.skin },
          ],
        },
      },
      // Hair
      hair: {
        id: 'hair',
        name: 'Hair',
        zIndex: 11,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: -headSize / 3 },
        },
        shape: {
          type: 'path',
          d:
            // Luna: higher rounded top with slightly shorter sides
            isChild && isFeminine && lowerId === 'luna'
              ? `M ${-headSize / 2 - 2} 0 Q ${-headSize / 2 - 4} ${-headSize / 2} 0 ${-headSize / 2 - 4} Q ${
                  headSize / 2 + 4
                } ${-headSize / 2} ${headSize / 2 + 2} 0 Q ${headSize / 3} 12 0 16 Q ${-headSize / 3} 12 ${
                  -headSize / 2 - 2
                } 0`
              // Emma: softer bob with slight fringe over forehead
              : isChild && isFeminine && lowerId === 'emma'
              ? `M ${-headSize / 2 - 3} 4 Q ${-headSize / 2 - 5} ${-headSize / 3} ${-headSize / 4} ${
                  -headSize / 2 - 4
                } Q 0 ${-headSize / 3} ${headSize / 4} ${-headSize / 2 - 6} Q ${
                  headSize / 2 + 3
                } ${-headSize / 3} ${headSize / 2 + 2} 6 Q ${headSize / 3} 16 0 20 Q ${-headSize / 3} 16 ${
                  -headSize / 2 - 3
                } 4`
              // Max: simple side-swept hair
              : isChild && isMasculine && lowerId === 'max'
              ? `M ${-headSize / 2 - 4} 4 Q ${-headSize / 4} ${-headSize / 2} ${
                  headSize / 4
                } ${-headSize / 2 - 2} Q ${
                  headSize / 2 + 4
                } ${-headSize / 3} ${headSize / 2 + 2} 8 Q ${headSize / 3} 14 0 18 Q ${-headSize / 3} 14 ${
                  -headSize / 2 - 4
                } 4`
              // Generic feminine child hair
              : isChild && isFeminine
              ? `M ${-headSize / 2 - 4} 6 Q ${-headSize / 2 - 6} ${-headSize / 3} 0 ${-headSize / 2 - 6} Q ${
                  headSize / 2 + 6
                } ${-headSize / 3} ${headSize / 2 + 4} 6 Q ${headSize / 3} 14 0 18 Q ${-headSize / 3} 14 ${
                  -headSize / 2 - 4
                } 6`
              // Generic masculine child hair
              : isChild && isMasculine
              ? `M ${-headSize / 2 - 3} 4 Q ${-headSize / 3} ${-headSize / 2} 0 ${-headSize / 2 - 4} Q ${
                  headSize / 3
                } ${-headSize / 2} ${headSize / 2 + 3} 4 Q ${headSize / 2} 10 0 14 Q ${headSize / 2} 5 ${
                  headSize / 3
                } 8 Q 0 ${-headSize / 3} ${-headSize / 3} 8 Q ${-headSize / 2} 5 ${-headSize / 2 - 3} 10`
              // Default neutral hair (adults)
              : `M ${-headSize / 2 - 3} 10 Q ${-headSize / 2 - 5} ${-headSize / 3} 0 ${-headSize / 2 - 5} Q ${
                  headSize / 2 + 5
                } ${-headSize / 3} ${headSize / 2 + 3} 10 Q ${headSize / 2} 5 ${headSize / 3} 8 Q 0 ${
                  -headSize / 3
                } ${-headSize / 3} 8 Q ${-headSize / 2} 5 ${-headSize / 2 - 3} 10`,
          fill: colors.hair,
        },
      },
      // Left Eye
      leftEye: {
        // ... rest of the code remains the same ...
        id: 'leftEye',
        name: 'Left Eye',
        zIndex: 12,
        parentId: 'head',
        children: ['leftPupil'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -10, y: -5 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 0,
          rx: 8,
          ry: 10,
          fill: 'white',
          stroke: '#333',
          strokeWidth: 1,
        },
      },
      // Left Pupil
      leftPupil: {
        id: 'leftPupil',
        name: 'Left Pupil',
        zIndex: 13,
        parentId: 'leftEye',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: 0 },
        },
        shape: {
          type: 'group',
          children: [
            { type: 'ellipse', cx: 0, cy: 0, rx: 4, ry: 5, fill: colors.eyes },
            { type: 'ellipse', cx: 1, cy: -2, rx: 1.5, ry: 1.5, fill: 'white' },
          ],
        },
      },
      // Right Eye
      rightEye: {
        id: 'rightEye',
        name: 'Right Eye',
        zIndex: 12,
        parentId: 'head',
        children: ['rightPupil'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 10, y: -5 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 0,
          rx: 8,
          ry: 10,
          fill: 'white',
          stroke: '#333',
          strokeWidth: 1,
        },
      },
      // Right Pupil
      rightPupil: {
        id: 'rightPupil',
        name: 'Right Pupil',
        zIndex: 13,
        parentId: 'rightEye',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: 0 },
        },
        shape: {
          type: 'group',
          children: [
            { type: 'ellipse', cx: 0, cy: 0, rx: 4, ry: 5, fill: colors.eyes },
            { type: 'ellipse', cx: 1, cy: -2, rx: 1.5, ry: 1.5, fill: 'white' },
          ],
        },
      },
      leftBrow: {
        id: 'leftBrow',
        name: 'Left Brow',
        zIndex: 13,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -10, y: -18 },
        },
        shape: {
          type: 'path',
          d: 'M -6 0 Q 0 -3 6 0',
          fill: 'none',
          stroke: '#3B2A2A',
          strokeWidth: 2,
        },
      },
      rightBrow: {
        id: 'rightBrow',
        name: 'Right Brow',
        zIndex: 13,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 10, y: -18 },
        },
        shape: {
          type: 'path',
          d: 'M -6 0 Q 0 -3 6 0',
          fill: 'none',
          stroke: '#3B2A2A',
          strokeWidth: 2,
        },
      },
      // Mouth
      mouth: {
        id: 'mouth',
        name: 'Mouth',
        zIndex: 12,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: 12 },
        },
        shape: {
          type: 'path',
          d: 'M -8 0 Q 0 8 8 0',
          fill: 'none',
          stroke: '#333',
          strokeWidth: 2,
        },
      },
      // Left Arm
      leftArm: {
        id: 'leftArm',
        name: 'Left Arm',
        zIndex: 4,
        parentId: 'body',
        children: ['leftHand'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -28, y: -bodyHeight / 2 + 15 },
          pivot: { x: 0.8, y: 0.1 },
          rotation: 15,
        },
        shape: {
          type: 'group',
          children: [
            // Upper arm
            { type: 'ellipse', cx: 0, cy: armLength / 4, rx: 8, ry: armLength / 2.5, fill: colors.primary },
          ],
        },
      },
      // Left Hand
      leftHand: {
        id: 'leftHand',
        name: 'Left Hand',
        zIndex: 4,
        parentId: 'leftArm',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: armLength / 2 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'group',
          children: [
            {
              type: 'ellipse',
              cx: 0,
              cy: 8,
              rx: 7,
              ry: 9,
              fill: colors.skin,
            },
          ],
        },
      },
      // Right Arm
      rightArm: {
        id: 'rightArm',
        name: 'Right Arm',
        zIndex: 4,
        parentId: 'body',
        children: ['rightHand'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 28, y: -bodyHeight / 2 + 15 },
          pivot: { x: 0.2, y: 0.1 },
          rotation: -15,
        },
        shape: {
          type: 'group',
          children: [
            { type: 'ellipse', cx: 0, cy: armLength / 4, rx: 8, ry: armLength / 2.5, fill: colors.primary },
          ],
        },
      },
      // Right Hand
      rightHand: {
        id: 'rightHand',
        name: 'Right Hand',
        zIndex: 4,
        parentId: 'rightArm',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: armLength / 2 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'group',
          children: [
            {
              type: 'ellipse',
              cx: 0,
              cy: 8,
              rx: 7,
              ry: 9,
              fill: colors.skin,
            },
          ],
        },
      },
      // Left Leg
      leftLeg: {
        id: 'leftLeg',
        name: 'Left Leg',
        zIndex: 3,
        parentId: 'body',
        children: ['leftFoot'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -12, y: bodyHeight / 2 - 5 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: legLength / 2,
          rx: 10,
          ry: legLength / 2,
          fill: colors.secondary,
        },
      },
      // Left Foot
      leftFoot: {
        id: 'leftFoot',
        name: 'Left Foot',
        zIndex: 2,
        parentId: 'leftLeg',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: legLength },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 3,
          cy: 5,
          rx: 12,
          ry: 6,
          fill: '#4a4a4a',
        },
      },
      // Right Leg
      rightLeg: {
        id: 'rightLeg',
        name: 'Right Leg',
        zIndex: 3,
        parentId: 'body',
        children: ['rightFoot'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 12, y: bodyHeight / 2 - 5 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: legLength / 2,
          rx: 10,
          ry: legLength / 2,
          fill: colors.secondary,
        },
      },
      // Right Foot
      rightFoot: {
        id: 'rightFoot',
        name: 'Right Foot',
        zIndex: 2,
        parentId: 'rightLeg',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 0, y: legLength },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: -3,
          cy: 5,
          rx: 12,
          ry: 6,
          fill: '#4a4a4a',
        },
      },
    },
  };
}

// Create an animal character rig (cat/dog style)
export function createAnimalRig(
  id: string,
  name: string,
  animalType: 'cat' | 'dog' | 'bunny',
  colors: CharacterRig['colors'],
  description: string
): CharacterRig {
  const earShape = animalType === 'bunny' 
    ? { type: 'ellipse' as const, cx: 0, cy: -20, rx: 6, ry: 25, fill: colors.primary }
    : animalType === 'cat'
    ? { type: 'polygon' as const, points: '0,-20 -10,5 10,5', fill: colors.primary }
    : { type: 'ellipse' as const, cx: 0, cy: -5, rx: 12, ry: 15, fill: colors.primary };

  return {
    id,
    name,
    category: 'animal',
    description,
    width: 140,
    height: 120,
    colors,
    rootPartId: 'body',
    parts: {
      body: {
        id: 'body',
        name: 'Body',
        zIndex: 5,
        parentId: null,
        children: ['head', 'tail', 'frontLeftLeg', 'frontRightLeg', 'backLeftLeg', 'backRightLeg'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 70, y: 70 },
          pivot: { x: 0.5, y: 0.5 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 0,
          rx: 40,
          ry: 25,
          fill: colors.primary,
        },
      },
      head: {
        id: 'head',
        name: 'Head',
        zIndex: 10,
        parentId: 'body',
        children: ['leftEar', 'rightEar', 'leftEye', 'rightEye', 'nose', 'mouth'],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 35, y: -10 },
          pivot: { x: 0.3, y: 0.5 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 0,
          rx: 22,
          ry: 20,
          fill: colors.primary,
        },
      },
      leftEar: {
        id: 'leftEar',
        name: 'Left Ear',
        zIndex: 11,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -12, y: -15 },
          rotation: -15,
        },
        shape: earShape,
      },
      rightEar: {
        id: 'rightEar',
        name: 'Right Ear',
        zIndex: 11,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 12, y: -15 },
          rotation: 15,
        },
        shape: earShape,
      },
      leftEye: {
        id: 'leftEye',
        name: 'Left Eye',
        zIndex: 12,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -8, y: -3 },
        },
        shape: {
          type: 'group',
          children: [
            { type: 'ellipse', cx: 0, cy: 0, rx: 6, ry: 7, fill: 'white' },
            { type: 'ellipse', cx: 1, cy: 0, rx: 3, ry: 4, fill: colors.eyes },
            { type: 'ellipse', cx: 2, cy: -1, rx: 1, ry: 1, fill: 'white' },
          ],
        },
      },
      rightEye: {
        id: 'rightEye',
        name: 'Right Eye',
        zIndex: 12,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 8, y: -3 },
        },
        shape: {
          type: 'group',
          children: [
            { type: 'ellipse', cx: 0, cy: 0, rx: 6, ry: 7, fill: 'white' },
            { type: 'ellipse', cx: 1, cy: 0, rx: 3, ry: 4, fill: colors.eyes },
            { type: 'ellipse', cx: 2, cy: -1, rx: 1, ry: 1, fill: 'white' },
          ],
        },
      },
      nose: {
        id: 'nose',
        name: 'Nose',
        zIndex: 13,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 15, y: 3 },
        },
        shape: {
          type: 'polygon',
          points: '0,-4 -5,3 5,3',
          fill: colors.secondary,
        },
      },
      mouth: {
        id: 'mouth',
        name: 'Mouth',
        zIndex: 12,
        parentId: 'head',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 12, y: 10 },
        },
        shape: {
          type: 'path',
          d: 'M -6 0 Q 0 5 6 0',
          fill: 'none',
          stroke: '#333',
          strokeWidth: 1.5,
        },
      },
      tail: {
        id: 'tail',
        name: 'Tail',
        zIndex: 1,
        parentId: 'body',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -40, y: -5 },
          pivot: { x: 1, y: 0.5 },
          rotation: -20,
        },
        shape: {
          type: 'path',
          d: animalType === 'bunny' 
            ? 'M 0 0 Q -10 -5 -12 0 Q -10 5 0 0'
            : 'M 0 0 Q -15 -20 -25 -15 Q -30 -10 -25 -5',
          fill: colors.primary,
          stroke: colors.primary,
          strokeWidth: animalType === 'bunny' ? 0 : 8,
        },
      },
      frontLeftLeg: {
        id: 'frontLeftLeg',
        name: 'Front Left Leg',
        zIndex: 4,
        parentId: 'body',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 20, y: 20 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 15,
          rx: 6,
          ry: 18,
          fill: colors.primary,
        },
      },
      frontRightLeg: {
        id: 'frontRightLeg',
        name: 'Front Right Leg',
        zIndex: 6,
        parentId: 'body',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: 30, y: 20 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 15,
          rx: 6,
          ry: 18,
          fill: colors.primary,
        },
      },
      backLeftLeg: {
        id: 'backLeftLeg',
        name: 'Back Left Leg',
        zIndex: 4,
        parentId: 'body',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -25, y: 18 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 15,
          rx: 8,
          ry: 18,
          fill: colors.primary,
        },
      },
      backRightLeg: {
        id: 'backRightLeg',
        name: 'Back Right Leg',
        zIndex: 6,
        parentId: 'body',
        children: [],
        defaultTransform: {
          ...defaultTransform(),
          position: { x: -15, y: 18 },
          pivot: { x: 0.5, y: 0 },
        },
        shape: {
          type: 'ellipse',
          cx: 0,
          cy: 15,
          rx: 8,
          ry: 18,
          fill: colors.primary,
        },
      },
    },
  };
}

// Pre-defined character rigs
export const CHARACTER_RIGS: CharacterRig[] = [
  // Dora-style main hero kids
  createHumanRig('kiara', 'Kiara', 'child', {
    primary: '#FFB800', // bright yellow shirt
    secondary: '#FF6B00', // orange accents
    skin: '#F2C28B',
    hair: '#3B1C0A',
    eyes: '#2E3192',
  }, 'An energetic girl who loves to sing and dance', 'feminine'),

  createHumanRig('jayden', 'Jayden', 'child', {
    primary: '#00C2FF', // cyan shirt
    secondary: '#0074FF', // deep blue shorts
    skin: '#8D5A2B',
    hair: '#1A1A1A',
    eyes: '#1B75BC',
  }, 'A playful boy who loves soccer and exploring', 'masculine'),

  // Original kids
  createHumanRig('luna', 'Luna', 'child', {
    primary: '#FF6B9D',
    secondary: '#FF8FB3',
    skin: '#FFDAB9',
    hair: '#8B4513',
    eyes: '#4A90D9',
  }, 'A curious and brave girl who loves adventures', 'feminine'),
  
  createHumanRig('max', 'Max', 'child', {
    primary: '#3498DB',
    secondary: '#2980B9',
    skin: '#FFDAB9',
    hair: '#2C3E50',
    eyes: '#27AE60',
  }, 'A friendly and adventurous boy', 'masculine'),
  
  createHumanRig('emma', 'Emma', 'child', {
    primary: '#9B59B6',
    secondary: '#8E44AD',
    skin: '#DEB887',
    hair: '#1A1A1A',
    eyes: '#8B4513',
  }, 'A creative girl who loves to paint', 'feminine'),

  // Animal friends
  createAnimalRig('whiskers', 'Whiskers', 'cat', {
    primary: '#FF9F43',
    secondary: '#E17055',
    skin: '#FFEAA7',
    hair: '#FF9F43',
    eyes: '#27AE60',
  }, 'A playful orange cat'),
  
  createAnimalRig('buddy', 'Buddy', 'dog', {
    primary: '#A0522D',
    secondary: '#8B4513',
    skin: '#DEB887',
    hair: '#A0522D',
    eyes: '#2C3E50',
  }, 'A loyal and friendly dog'),
  
  createAnimalRig('cotton', 'Cotton', 'bunny', {
    primary: '#FFFFFF',
    secondary: '#FFB6C1',
    skin: '#FFF0F5',
    hair: '#FFFFFF',
    eyes: '#FF69B4',
  }, 'A fluffy white bunny'),
];

// Get character rig by ID or name
export function getCharacterRig(identifier: string): CharacterRig | undefined {
  const lowerIdentifier = identifier.toLowerCase();
  return CHARACTER_RIGS.find(
    rig => rig.id.toLowerCase() === lowerIdentifier || 
           rig.name.toLowerCase() === lowerIdentifier
  );
}
