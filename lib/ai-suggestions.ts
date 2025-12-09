// AI-powered suggestions for scenes, emotions, and backgrounds

import type { EditableScene, EditableCharacter } from '@/components/InteractiveSceneEditor';

// Emotion detection from narration text
export interface EmotionAnalysis {
  primary: string;
  secondary?: string;
  intensity: number; // 0-1
  suggestedExpression: string;
  suggestedAnimation: string;
}

const EMOTION_KEYWORDS: Record<string, { expression: string; animation: string; keywords: string[] }> = {
  happy: {
    expression: 'happy',
    animation: 'bounce',
    keywords: ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'great', 'love', 'fun', 'laugh', 'smile', 'celebrate', 'yay', 'hooray'],
  },
  sad: {
    expression: 'sad',
    animation: 'idle',
    keywords: ['sad', 'cry', 'tears', 'upset', 'disappointed', 'sorry', 'miss', 'lonely', 'heartbroken', 'depressed'],
  },
  angry: {
    expression: 'angry',
    animation: 'shake',
    keywords: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'hate', 'rage', 'yell', 'shout'],
  },
  surprised: {
    expression: 'surprised',
    animation: 'jump',
    keywords: ['surprised', 'shock', 'wow', 'amazing', 'incredible', 'unexpected', 'gasp', 'oh my', 'what'],
  },
  scared: {
    expression: 'worried',
    animation: 'shake',
    keywords: ['scared', 'afraid', 'fear', 'terrified', 'nervous', 'worried', 'anxious', 'panic', 'help'],
  },
  thinking: {
    expression: 'thinking',
    animation: 'idle',
    keywords: ['think', 'wonder', 'curious', 'hmm', 'maybe', 'perhaps', 'consider', 'ponder', 'question'],
  },
  excited: {
    expression: 'happy',
    animation: 'dance',
    keywords: ['excited', 'thrilled', 'can\'t wait', 'awesome', 'fantastic', 'woohoo', 'yes'],
  },
  sleepy: {
    expression: 'sleepy',
    animation: 'idle',
    keywords: ['tired', 'sleepy', 'yawn', 'exhausted', 'rest', 'nap', 'bed', 'dream'],
  },
};

export function analyzeEmotion(text: string): EmotionAnalysis {
  const lowerText = text.toLowerCase();
  let bestMatch = { emotion: 'neutral', score: 0 };

  for (const [emotion, data] of Object.entries(EMOTION_KEYWORDS)) {
    let score = 0;
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { emotion, score };
    }
  }

  const emotionData = EMOTION_KEYWORDS[bestMatch.emotion] || {
    expression: 'neutral',
    animation: 'idle',
  };

  return {
    primary: bestMatch.emotion || 'neutral',
    intensity: Math.min(bestMatch.score / 3, 1),
    suggestedExpression: emotionData.expression,
    suggestedAnimation: emotionData.animation,
  };
}

// Background suggestions based on narration
export interface BackgroundSuggestion {
  id: string;
  name: string;
  confidence: number;
  reason: string;
}

const BACKGROUND_KEYWORDS: Record<string, { keywords: string[]; name: string }> = {
  meadow: {
    keywords: ['outside', 'sunny', 'grass', 'flowers', 'picnic', 'field', 'nature', 'day', 'bright'],
    name: 'Sunny Meadow',
  },
  forest: {
    keywords: ['forest', 'trees', 'woods', 'adventure', 'explore', 'magical', 'fairy', 'enchanted'],
    name: 'Magical Forest',
  },
  beach: {
    keywords: ['beach', 'ocean', 'sea', 'sand', 'waves', 'summer', 'vacation', 'swim', 'surf'],
    name: 'Sandy Beach',
  },
  night: {
    keywords: ['night', 'dark', 'stars', 'moon', 'sleep', 'dream', 'evening', 'midnight'],
    name: 'Starry Night',
  },
  park: {
    keywords: ['park', 'playground', 'swing', 'slide', 'city', 'walk', 'bench', 'fountain'],
    name: 'City Park',
  },
  bedroom: {
    keywords: ['bedroom', 'bed', 'sleep', 'wake', 'morning', 'room', 'home', 'cozy', 'pillow'],
    name: 'Cozy Bedroom',
  },
  classroom: {
    keywords: ['school', 'class', 'learn', 'teacher', 'student', 'desk', 'book', 'study'],
    name: 'Classroom',
  },
  kitchen: {
    keywords: ['kitchen', 'cook', 'food', 'eat', 'breakfast', 'lunch', 'dinner', 'bake'],
    name: 'Kitchen',
  },
  castle: {
    keywords: ['castle', 'king', 'queen', 'prince', 'princess', 'royal', 'throne', 'kingdom'],
    name: 'Royal Castle',
  },
  space: {
    keywords: ['space', 'rocket', 'planet', 'star', 'astronaut', 'galaxy', 'moon', 'alien'],
    name: 'Outer Space',
  },
};

export function suggestBackgrounds(narration: string): BackgroundSuggestion[] {
  const lowerText = narration.toLowerCase();
  const suggestions: BackgroundSuggestion[] = [];

  for (const [id, data] of Object.entries(BACKGROUND_KEYWORDS)) {
    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword)) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    if (matchCount > 0) {
      suggestions.push({
        id,
        name: data.name,
        confidence: Math.min(matchCount / 3, 1),
        reason: `Contains: ${matchedKeywords.slice(0, 3).join(', ')}`,
      });
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

// Scene flow suggestions
export interface SceneSuggestion {
  type: 'dialogue' | 'action' | 'emotion' | 'transition' | 'establishing';
  title: string;
  description: string;
  narrationTemplate: string;
  confidence: number;
}

export function suggestNextScene(
  currentScene: EditableScene,
  allScenes: EditableScene[]
): SceneSuggestion[] {
  const suggestions: SceneSuggestion[] = [];
  const currentNarration = currentScene.narration.toLowerCase();

  // Analyze current scene to suggest what comes next
  const hasQuestion = currentNarration.includes('?');
  const hasConflict = /but|however|suddenly|unfortunately|problem/i.test(currentNarration);
  const hasResolution = /finally|happily|solved|fixed|together/i.test(currentNarration);
  const isIntroduction = allScenes.indexOf(currentScene) === 0;

  if (hasQuestion) {
    suggestions.push({
      type: 'dialogue',
      title: 'Response Scene',
      description: 'Continue the conversation with an answer',
      narrationTemplate: '[Character] thought about it and said...',
      confidence: 0.9,
    });
  }

  if (hasConflict) {
    suggestions.push({
      type: 'action',
      title: 'Problem Solving',
      description: 'Show characters working to solve the problem',
      narrationTemplate: 'They decided to work together to...',
      confidence: 0.85,
    });
    suggestions.push({
      type: 'emotion',
      title: 'Emotional Reaction',
      description: 'Show how characters feel about the situation',
      narrationTemplate: '[Character] felt worried, but then...',
      confidence: 0.7,
    });
  }

  if (hasResolution) {
    suggestions.push({
      type: 'emotion',
      title: 'Celebration',
      description: 'Celebrate the happy ending',
      narrationTemplate: 'Everyone was so happy! They celebrated by...',
      confidence: 0.8,
    });
    suggestions.push({
      type: 'transition',
      title: 'Epilogue',
      description: 'Wrap up the story with a closing scene',
      narrationTemplate: 'And from that day on, they always remembered...',
      confidence: 0.75,
    });
  }

  if (isIntroduction) {
    suggestions.push({
      type: 'establishing',
      title: 'Setting the Scene',
      description: 'Establish the world and introduce characters',
      narrationTemplate: 'One beautiful day in [location]...',
      confidence: 0.9,
    });
  }

  // Default suggestions
  if (suggestions.length < 3) {
    suggestions.push({
      type: 'dialogue',
      title: 'Conversation',
      description: 'Characters talk to each other',
      narrationTemplate: '[Character 1] turned to [Character 2] and said...',
      confidence: 0.5,
    });
    suggestions.push({
      type: 'action',
      title: 'Adventure',
      description: 'Something exciting happens',
      narrationTemplate: 'Suddenly, something amazing happened...',
      confidence: 0.4,
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}

// Auto-apply emotions to characters based on narration
export function autoApplyEmotions(
  scene: EditableScene
): EditableCharacter[] {
  const emotion = analyzeEmotion(scene.narration);

  return scene.characters.map((char) => ({
    ...char,
    expression: emotion.suggestedExpression as EditableCharacter['expression'],
    animation: emotion.suggestedAnimation,
  }));
}

// Generate scene title from narration
export function generateSceneTitle(narration: string): string {
  // Extract first meaningful phrase
  const sentences = narration.split(/[.!?]/);
  const firstSentence = sentences[0]?.trim() || 'New Scene';

  // Shorten if too long
  if (firstSentence.length > 30) {
    const words = firstSentence.split(' ').slice(0, 4);
    return words.join(' ') + '...';
  }

  return firstSentence;
}

// Suggest character positions based on scene type
export interface PositionSuggestion {
  characterIndex: number;
  x: number;
  y: number;
  scale: number;
  flipped: boolean;
}

export function suggestCharacterPositions(
  sceneType: 'dialogue' | 'action' | 'group' | 'solo',
  characterCount: number
): PositionSuggestion[] {
  const positions: PositionSuggestion[] = [];

  switch (sceneType) {
    case 'dialogue':
      // Two characters facing each other
      if (characterCount >= 2) {
        positions.push({ characterIndex: 0, x: 25, y: 70, scale: 1, flipped: false });
        positions.push({ characterIndex: 1, x: 75, y: 70, scale: 1, flipped: true });
      }
      break;

    case 'action':
      // Characters spread out, some in motion
      for (let i = 0; i < characterCount; i++) {
        positions.push({
          characterIndex: i,
          x: 20 + (i * 60) / Math.max(characterCount - 1, 1),
          y: 65 + (i % 2) * 10,
          scale: 0.9 + Math.random() * 0.2,
          flipped: i % 2 === 1,
        });
      }
      break;

    case 'group':
      // Characters grouped together
      const centerX = 50;
      const spread = Math.min(15, 60 / characterCount);
      for (let i = 0; i < characterCount; i++) {
        const offset = (i - (characterCount - 1) / 2) * spread;
        positions.push({
          characterIndex: i,
          x: centerX + offset,
          y: 70,
          scale: 1,
          flipped: offset > 0,
        });
      }
      break;

    case 'solo':
      // Single character in focus
      positions.push({ characterIndex: 0, x: 50, y: 70, scale: 1.2, flipped: false });
      break;
  }

  return positions;
}
