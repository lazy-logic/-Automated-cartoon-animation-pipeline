// Project Templates - Pre-made story templates

import type { EditableScene, EditableCharacter } from '@/components/editors/InteractiveSceneEditor';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'fairy-tale' | 'adventure' | 'educational' | 'comedy' | 'slice-of-life';
  thumbnail?: string;
  scenes: Omit<EditableScene, 'id'>[];
  suggestedCharacters: string[];
  estimatedDuration: number; // seconds
  ageRange: string;
  tags: string[];
}

// Default character setup
const createCharacter = (
  rigId: string,
  name: string,
  x: number,
  y: number,
  flipped: boolean = false
): EditableCharacter => ({
  id: `char-template-${rigId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  rigId,
  name,
  x,
  y,
  scale: 1,
  flipX: flipped,
  animation: 'idle',
  expression: 'neutral',
  isTalking: false,
  zIndex: 0,
});

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  // Fairy Tale Templates
  {
    id: 'princess-adventure',
    name: 'The Brave Princess',
    description: 'A princess goes on an adventure to save her kingdom',
    icon: '👸',
    category: 'fairy-tale',
    suggestedCharacters: ['kiara', 'milo'],
    estimatedDuration: 120,
    ageRange: '4-8',
    tags: ['princess', 'adventure', 'courage', 'magic'],
    scenes: [
      {
        title: 'The Royal Castle',
        narration: 'Once upon a time, in a beautiful kingdom, there lived a brave princess named Kiara.',
        background: 'castle',
        characters: [
          { ...createCharacter('kiara', 'Princess Kiara', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'A Problem Arises',
        narration: 'One day, a mysterious shadow fell over the kingdom. The princess knew she had to do something!',
        background: 'castle',
        characters: [
          { ...createCharacter('kiara', 'Princess Kiara', 30, 70), expression: 'sad' },
        ] as EditableCharacter[],
        duration: 6000,
        cameraZoom: 1.2,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Meeting a Friend',
        narration: 'In the enchanted forest, she met a wise owl named Milo who offered to help.',
        background: 'forest',
        characters: [
          { ...createCharacter('kiara', 'Princess Kiara', 30, 70), expression: 'surprised' },
          { ...createCharacter('milo', 'Milo the Owl', 70, 65, true), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'The Journey',
        narration: 'Together, they traveled through magical lands, facing challenges with courage.',
        background: 'meadow',
        characters: [
          { ...createCharacter('kiara', 'Princess Kiara', 35, 70), animation: 'walk' },
          { ...createCharacter('milo', 'Milo the Owl', 65, 65, true), animation: 'walk' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 0.9,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Happy Ending',
        narration: 'With bravery and friendship, they saved the kingdom! And everyone lived happily ever after.',
        background: 'castle',
        characters: [
          { ...createCharacter('kiara', 'Princess Kiara', 40, 70), expression: 'happy', animation: 'dance' },
          { ...createCharacter('milo', 'Milo the Owl', 60, 65, true), expression: 'happy', animation: 'bounce' },
        ] as EditableCharacter[],
        duration: 6000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },
  {
    id: 'magic-garden',
    name: 'The Magic Garden',
    description: 'Discover the secrets of an enchanted garden',
    icon: '🌸',
    category: 'fairy-tale',
    suggestedCharacters: ['luna', 'kiara'],
    estimatedDuration: 90,
    ageRange: '3-6',
    tags: ['garden', 'magic', 'flowers', 'nature'],
    scenes: [
      {
        title: 'Finding the Garden',
        narration: 'Luna discovered a hidden door behind the old oak tree. What could be inside?',
        background: 'forest',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'surprised' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'A Magical Place',
        narration: 'Inside was the most beautiful garden she had ever seen, with flowers that sparkled like stars!',
        background: 'meadow',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1.1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Making Friends',
        narration: 'The garden fairy welcomed Luna and showed her all the magical plants.',
        background: 'meadow',
        characters: [
          { ...createCharacter('luna', 'Luna', 35, 70), expression: 'happy' },
          { ...createCharacter('kiara', 'Garden Fairy', 65, 65, true), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },

  // Adventure Templates
  {
    id: 'space-explorers',
    name: 'Space Explorers',
    description: 'Blast off on an exciting journey through space',
    icon: '🚀',
    category: 'adventure',
    suggestedCharacters: ['jayden', 'milo'],
    estimatedDuration: 150,
    ageRange: '5-10',
    tags: ['space', 'planets', 'astronaut', 'exploration'],
    scenes: [
      {
        title: 'Launch Day',
        narration: '3... 2... 1... Blast off! Jayden and Milo were finally going to space!',
        background: 'space',
        characters: [
          { ...createCharacter('jayden', 'Astronaut Jayden', 40, 70), expression: 'happy' },
          { ...createCharacter('milo', 'Astronaut Milo', 60, 70, true), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Among the Stars',
        narration: 'They floated past twinkling stars and colorful nebulas. Space was amazing!',
        background: 'space',
        characters: [
          { ...createCharacter('jayden', 'Astronaut Jayden', 30, 60), animation: 'float' },
          { ...createCharacter('milo', 'Astronaut Milo', 70, 65, true), animation: 'float' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 0.8,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'A New Planet',
        narration: 'They discovered a beautiful new planet with purple mountains and green oceans!',
        background: 'space',
        characters: [
          { ...createCharacter('jayden', 'Astronaut Jayden', 50, 70), expression: 'surprised' },
          { ...createCharacter('milo', 'Astronaut Milo', 50, 55, true), expression: 'surprised' },
        ] as EditableCharacter[],
        duration: 6000,
        cameraZoom: 1.2,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },
  {
    id: 'treasure-hunt',
    name: 'The Treasure Hunt',
    description: 'Follow the map to find hidden treasure',
    icon: '🗺️',
    category: 'adventure',
    suggestedCharacters: ['jayden', 'kiara'],
    estimatedDuration: 120,
    ageRange: '5-9',
    tags: ['treasure', 'map', 'pirates', 'beach'],
    scenes: [
      {
        title: 'The Old Map',
        narration: 'Jayden found an old treasure map in his grandmother\'s attic!',
        background: 'bedroom',
        characters: [
          { ...createCharacter('jayden', 'Jayden', 50, 70), expression: 'surprised' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1.1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Setting Off',
        narration: 'He called his best friend Kiara, and together they followed the map to the beach.',
        background: 'beach',
        characters: [
          { ...createCharacter('jayden', 'Jayden', 35, 70), animation: 'walk' },
          { ...createCharacter('kiara', 'Kiara', 65, 70, true), animation: 'walk' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'X Marks the Spot',
        narration: 'They dug and dug until... they found a treasure chest full of golden coins!',
        background: 'beach',
        characters: [
          { ...createCharacter('jayden', 'Jayden', 40, 70), expression: 'happy', animation: 'dance' },
          { ...createCharacter('kiara', 'Kiara', 60, 70, true), expression: 'happy', animation: 'dance' },
        ] as EditableCharacter[],
        duration: 6000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },

  // Educational Templates
  {
    id: 'counting-fun',
    name: 'Counting Fun',
    description: 'Learn to count with fun characters',
    icon: '🔢',
    category: 'educational',
    suggestedCharacters: ['luna', 'milo'],
    estimatedDuration: 90,
    ageRange: '3-5',
    tags: ['counting', 'numbers', 'learning', 'math'],
    scenes: [
      {
        title: 'Let\'s Count!',
        narration: 'Hello friends! Today we\'re going to learn how to count. Are you ready?',
        background: 'park',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 4000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'One Apple',
        narration: 'One! Luna has one red apple. Can you say one?',
        background: 'park',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 4000,
        cameraZoom: 1.2,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Two Friends',
        narration: 'Two! Now there are two friends. One, two!',
        background: 'park',
        characters: [
          { ...createCharacter('luna', 'Luna', 35, 70), expression: 'happy' },
          { ...createCharacter('milo', 'Milo', 65, 70, true), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 4000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Great Job!',
        narration: 'You did it! You learned to count! Great job, everyone!',
        background: 'park',
        characters: [
          { ...createCharacter('luna', 'Luna', 35, 70), expression: 'happy', animation: 'dance' },
          { ...createCharacter('milo', 'Milo', 65, 70, true), expression: 'happy', animation: 'dance' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },
  {
    id: 'colors-rainbow',
    name: 'Colors of the Rainbow',
    description: 'Learn about colors in a fun way',
    icon: '🌈',
    category: 'educational',
    suggestedCharacters: ['kiara', 'luna'],
    estimatedDuration: 100,
    ageRange: '3-5',
    tags: ['colors', 'rainbow', 'learning', 'art'],
    scenes: [
      {
        title: 'Rainbow Day',
        narration: 'Look! A beautiful rainbow appeared after the rain. Let\'s learn the colors!',
        background: 'meadow',
        characters: [
          { ...createCharacter('kiara', 'Kiara', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Red and Orange',
        narration: 'Red like an apple, orange like the sun! These are warm, happy colors.',
        background: 'meadow',
        characters: [
          { ...createCharacter('kiara', 'Kiara', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1.1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'All the Colors',
        narration: 'Red, orange, yellow, green, blue, and purple! You know all the rainbow colors now!',
        background: 'meadow',
        characters: [
          { ...createCharacter('kiara', 'Kiara', 35, 70), expression: 'happy', animation: 'dance' },
          { ...createCharacter('luna', 'Luna', 65, 70, true), expression: 'happy', animation: 'dance' },
        ] as EditableCharacter[],
        duration: 6000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },

  // Comedy Templates
  {
    id: 'silly-day',
    name: 'The Silly Day',
    description: 'Everything goes hilariously wrong',
    icon: '🤪',
    category: 'comedy',
    suggestedCharacters: ['jayden', 'milo'],
    estimatedDuration: 90,
    ageRange: '4-8',
    tags: ['funny', 'silly', 'comedy', 'laughs'],
    scenes: [
      {
        title: 'Waking Up',
        narration: 'Jayden woke up and put his shoes on his hands by mistake. Oops!',
        background: 'bedroom',
        characters: [
          { ...createCharacter('jayden', 'Jayden', 50, 70), expression: 'surprised' },
        ] as EditableCharacter[],
        duration: 4000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Breakfast Disaster',
        narration: 'He tried to pour cereal but it went everywhere! What a mess!',
        background: 'bedroom',
        characters: [
          { ...createCharacter('jayden', 'Jayden', 50, 70), expression: 'surprised', animation: 'shake' },
        ] as EditableCharacter[],
        duration: 4000,
        cameraZoom: 1.2,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Laughing Together',
        narration: 'Milo came over and they both laughed and laughed. Sometimes silly days are the best days!',
        background: 'park',
        characters: [
          { ...createCharacter('jayden', 'Jayden', 35, 70), expression: 'happy', animation: 'bounce' },
          { ...createCharacter('milo', 'Milo', 65, 70, true), expression: 'happy', animation: 'bounce' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },

  // Slice of Life Templates
  {
    id: 'first-day-school',
    name: 'First Day of School',
    description: 'Making new friends at school',
    icon: '🏫',
    category: 'slice-of-life',
    suggestedCharacters: ['luna', 'kiara', 'jayden'],
    estimatedDuration: 120,
    ageRange: '4-7',
    tags: ['school', 'friends', 'first day', 'nervous'],
    scenes: [
      {
        title: 'Feeling Nervous',
        narration: 'Luna was nervous about her first day at the new school. What if no one liked her?',
        background: 'bedroom',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'sad' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1.1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'A Friendly Face',
        narration: 'But then Kiara came up and said "Hi! Want to be friends?" Luna smiled.',
        background: 'park',
        characters: [
          { ...createCharacter('luna', 'Luna', 35, 70), expression: 'surprised' },
          { ...createCharacter('kiara', 'Kiara', 65, 70, true), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'New Friends',
        narration: 'By the end of the day, Luna had made lots of new friends. School was going to be great!',
        background: 'park',
        characters: [
          { ...createCharacter('luna', 'Luna', 25, 70), expression: 'happy' },
          { ...createCharacter('kiara', 'Kiara', 50, 70), expression: 'happy' },
          { ...createCharacter('jayden', 'Jayden', 75, 70, true), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 6000,
        cameraZoom: 0.9,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },
  {
    id: 'bedtime-story',
    name: 'Bedtime Story',
    description: 'A cozy story for bedtime',
    icon: '🌙',
    category: 'slice-of-life',
    suggestedCharacters: ['luna'],
    estimatedDuration: 60,
    ageRange: '2-5',
    tags: ['bedtime', 'sleep', 'night', 'cozy'],
    scenes: [
      {
        title: 'Getting Sleepy',
        narration: 'The sun went down and the stars came out. Luna yawned. It was time for bed.',
        background: 'night',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'neutral' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Cozy Bed',
        narration: 'She snuggled into her warm, cozy bed and closed her eyes.',
        background: 'bedroom',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1.2,
        cameraPanX: 0,
        cameraPanY: 0,
      },
      {
        title: 'Sweet Dreams',
        narration: 'Goodnight, Luna. Goodnight, everyone. Sweet dreams!',
        background: 'night',
        characters: [
          { ...createCharacter('luna', 'Luna', 50, 70), expression: 'happy' },
        ] as EditableCharacter[],
        duration: 5000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
      },
    ],
  },
];

// Get templates by category
export function getTemplatesByCategory(category: ProjectTemplate['category']): ProjectTemplate[] {
  return PROJECT_TEMPLATES.filter(t => t.category === category);
}

// Search templates
export function searchTemplates(query: string): ProjectTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PROJECT_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.includes(lowerQuery))
  );
}

// Get template by ID
export function getTemplateById(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id);
}

// Convert template to editable scenes
export function templateToScenes(template: ProjectTemplate): EditableScene[] {
  return template.scenes.map((scene, index) => ({
    ...scene,
    id: `scene-${Date.now()}-${index}`,
    characters: scene.characters.map((char, charIndex) => ({
      ...char,
      id: `char-${Date.now()}-${index}-${charIndex}`,
    })),
  }));
}
