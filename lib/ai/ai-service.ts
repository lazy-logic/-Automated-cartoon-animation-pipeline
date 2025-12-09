/**
 * AI Service - Integrates Gemini and OpenAI for story generation
 * Uses Gemini as primary, OpenAI as fallback
 */
import { GoogleGenAI } from '@google/genai';
import { AIStoryRequest, AIGeneratedScene, AIStoryResponse } from './ai-types';

// Available backgrounds in the app - expanded list
const AVAILABLE_BACKGROUNDS = [
  'meadow', 'forest', 'beach', 'night', 'bedroom', 'park',
  'castle', 'space', 'underwater', 'mountain', 'city', 'farm',
  'playground', 'library', 'kitchen', 'garden'
];

// Available actions - expanded list
const AVAILABLE_ACTIONS = [
  'idle', 'walk', 'run', 'wave', 'dance', 'jump', 'talk', 'surprised',
  'sit', 'sleep', 'eat', 'read', 'play', 'think', 'laugh', 'cry',
  'hug', 'point', 'clap', 'spin', 'fly', 'swim', 'climb'
];

// Available characters - expanded list
const AVAILABLE_CHARACTERS = [
  'luna', 'max', 'emma', 'whiskers', 'buddy', 'cotton',
  'milo', 'coco', 'pip', 'ruby', 'oliver', 'daisy',
  'felix', 'bella', 'charlie', 'rosie'
];

// Character personas/templates for richer storytelling
export const CHARACTER_PERSONAS: Record<string, { description: string; traits: string[]; voiceStyle: string }> = {
  luna: {
    description: 'A curious and adventurous young girl with a love for exploration',
    traits: ['curious', 'brave', 'kind', 'imaginative'],
    voiceStyle: 'cheerful and enthusiastic'
  },
  max: {
    description: 'A playful and energetic boy who loves sports and games',
    traits: ['energetic', 'friendly', 'competitive', 'loyal'],
    voiceStyle: 'excited and upbeat'
  },
  emma: {
    description: 'A thoughtful and creative girl who loves art and nature',
    traits: ['creative', 'gentle', 'observant', 'caring'],
    voiceStyle: 'soft and warm'
  },
  whiskers: {
    description: 'A clever and mischievous cat with a heart of gold',
    traits: ['clever', 'playful', 'independent', 'affectionate'],
    voiceStyle: 'sly but friendly'
  },
  buddy: {
    description: 'A loyal and friendly dog who loves everyone',
    traits: ['loyal', 'happy', 'protective', 'silly'],
    voiceStyle: 'eager and joyful'
  },
  cotton: {
    description: 'A fluffy and gentle bunny who loves carrots and cuddles',
    traits: ['gentle', 'shy', 'sweet', 'cuddly'],
    voiceStyle: 'quiet and adorable'
  },
  milo: {
    description: 'A wise and patient owl who loves to teach',
    traits: ['wise', 'patient', 'helpful', 'knowledgeable'],
    voiceStyle: 'calm and thoughtful'
  },
  coco: {
    description: 'A cheerful and colorful parrot who loves to sing',
    traits: ['musical', 'colorful', 'talkative', 'entertaining'],
    voiceStyle: 'melodic and expressive'
  },
  pip: {
    description: 'A tiny but brave mouse with big dreams',
    traits: ['brave', 'determined', 'resourceful', 'optimistic'],
    voiceStyle: 'small but confident'
  }
};

// Story genre templates
export const GENRE_TEMPLATES = {
  adventure: {
    themes: ['exploration', 'discovery', 'friendship', 'courage'],
    settings: ['forest', 'mountain', 'beach', 'castle'],
    conflicts: ['lost item', 'helping a friend', 'solving a puzzle', 'finding treasure']
  },
  friendship: {
    themes: ['teamwork', 'sharing', 'understanding', 'forgiveness'],
    settings: ['park', 'playground', 'meadow', 'bedroom'],
    conflicts: ['misunderstanding', 'sharing toys', 'making new friends', 'helping others']
  },
  bedtime: {
    themes: ['dreams', 'comfort', 'safety', 'imagination'],
    settings: ['bedroom', 'night', 'garden', 'meadow'],
    conflicts: ['afraid of dark', 'cant sleep', 'missing toy', 'bad dream']
  },
  learning: {
    themes: ['curiosity', 'discovery', 'problem-solving', 'growth'],
    settings: ['library', 'kitchen', 'garden', 'farm'],
    conflicts: ['learning new skill', 'making mistakes', 'trying again', 'achievement']
  },
  fantasy: {
    themes: ['magic', 'wonder', 'transformation', 'wishes'],
    settings: ['castle', 'forest', 'space', 'underwater'],
    conflicts: ['magical quest', 'breaking spell', 'helping magical creature', 'finding magic item']
  }
};

// Build system prompt dynamically with character personas
function buildSystemPrompt(selectedCharacters?: string[]): string {
  // Build character descriptions for selected characters
  let characterDescriptions = '';
  if (selectedCharacters && selectedCharacters.length > 0) {
    const descriptions = selectedCharacters
      .filter(c => CHARACTER_PERSONAS[c.toLowerCase()])
      .map(c => {
        const persona = CHARACTER_PERSONAS[c.toLowerCase()];
        return `- ${c}: ${persona.description}. Traits: ${persona.traits.join(', ')}. Voice: ${persona.voiceStyle}`;
      });
    if (descriptions.length > 0) {
      characterDescriptions = `\n\nCharacter personalities:\n${descriptions.join('\n')}`;
    }
  }

  return `You are a children's story writer for an animated cartoon studio. Generate engaging, age-appropriate stories similar to Dora the Explorer or Peppa Pig.

CRITICAL JSON RULES - FOLLOW EXACTLY:
1. Respond with ONLY valid JSON - no markdown, no code blocks, no backticks
2. Use double quotes for all strings
3. Do NOT use special characters like curly quotes or em-dashes - use regular quotes and hyphens only
4. Do NOT include trailing commas
5. Keep all text on single lines - no line breaks within strings
6. Escape any quotes within strings using backslash

Available backgrounds: ${AVAILABLE_BACKGROUNDS.join(', ')}
Available character actions: ${AVAILABLE_ACTIONS.join(', ')}
Available character names: ${AVAILABLE_CHARACTERS.join(', ')}${characterDescriptions}

Story Guidelines:
- Keep language simple and age-appropriate (ages 3-7)
- Include positive messages about friendship, kindness, and learning
- Each scene should have clear action and emotion
- Dialogue should be short (5-12 words max), expressive, and match character personalities
- Include moments of wonder, humor, or gentle excitement
- End with a satisfying, happy conclusion

Generate a story with this EXACT JSON structure:
{"title":"Story Title Here","scenes":[{"title":"Scene Title","background":"meadow","narration":"What happens in this scene. Keep it to 2-3 simple sentences.","characters":[{"name":"luna","action":"wave","position":"center","expression":"happy"}],"dialogue":[{"speaker":"luna","text":"Hello friends!"}],"mood":"happy","duration":5000}]}

Follow this structure exactly. Include 1-2 dialogue lines per scene. Use ONLY the available character names, actions, and backgrounds listed above.`;
}

/**
 * Generate story using Google Gemini API
 */
async function generateWithGemini(request: AIStoryRequest): Promise<AIStoryResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const userPrompt = buildUserPrompt(request);
  const systemPrompt = buildSystemPrompt(request.characters);
  const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const client = new GoogleGenAI({ apiKey });

  const result = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: combinedPrompt,
    config: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  const text = (result as any).text as string | undefined;

  if (!text) {
    throw new Error('No response from Gemini');
  }

  const story = parseStoryResponse(text);
  return { ...story, provider: 'gemini' };
}

/**
 * Generate story using OpenAI API
 */
async function generateWithOpenAI(request: AIStoryRequest): Promise<AIStoryResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const userPrompt = buildUserPrompt(request);
  const systemPrompt = buildSystemPrompt(request.characters);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2048,
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('No response from OpenAI');
  }

  const story = parseStoryResponse(text);
  return { ...story, provider: 'openai' };
}

/**
 * Build user prompt from request
 */
function buildUserPrompt(request: AIStoryRequest): string {
  let prompt = `Create a ${request.sceneCount || 3}-scene children's story`;
  
  if (request.genre) {
    prompt += ` in the ${request.genre} genre`;
  }
  
  if (request.targetAudience) {
    prompt += ` for ${request.targetAudience} audience`;
  }
  
  if (request.characters && request.characters.length > 0) {
    prompt += ` featuring these characters: ${request.characters.join(', ')}`;
  }
  
  if (request.prompt) {
    prompt += `. Story idea: ${request.prompt}`;
  }
  
  return prompt;
}

/**
 * Attempt to repair common JSON issues from AI responses
 */
function repairJSON(text: string): string {
  let repaired = text;
  
  // Remove trailing commas before closing brackets
  repaired = repaired.replace(/,(\s*[\]}])/g, '$1');
  
  // Fix unterminated strings by finding incomplete string patterns
  // Look for strings that start but don't end before a comma, bracket, or newline
  repaired = repaired.replace(/"([^"\\]*(\\.[^"\\]*)*)(?=\s*[,}\]\n])/g, (match) => {
    if (!match.endsWith('"')) {
      return match + '"';
    }
    return match;
  });
  
  // Remove any characters after the last closing brace
  const lastBrace = repaired.lastIndexOf('}');
  if (lastBrace !== -1) {
    repaired = repaired.slice(0, lastBrace + 1);
  }
  
  // Ensure we have balanced braces - count them
  let braceCount = 0;
  for (const char of repaired) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
  }
  
  // Add missing closing braces
  while (braceCount > 0) {
    repaired += '}';
    braceCount--;
  }
  
  // Add missing closing brackets for arrays
  let bracketCount = 0;
  for (const char of repaired) {
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }
  
  // Find position before final } and add missing ]
  if (bracketCount > 0) {
    const lastBracePos = repaired.lastIndexOf('}');
    if (lastBracePos > 0) {
      const closingBrackets = ']'.repeat(bracketCount);
      repaired = repaired.slice(0, lastBracePos) + closingBrackets + repaired.slice(lastBracePos);
    }
  }
  
  return repaired;
}

/**
 * Parse AI response into story structure
 */
function parseStoryResponse(text: string): Omit<AIStoryResponse, 'provider'> {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();
    
    // Try to extract the first JSON object block if extra prose is present
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.slice(firstBrace, lastBrace + 1);
    }

    // First attempt: try parsing as-is
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (firstError) {
      // Second attempt: try to repair the JSON
      console.log('First JSON parse failed, attempting repair...');
      const repairedText = repairJSON(cleanText);
      try {
        parsed = JSON.parse(repairedText);
        console.log('JSON repair successful');
      } catch (secondError) {
        // Third attempt: try to extract just the scenes array
        console.log('JSON repair failed, attempting to extract scenes...');
        const scenesMatch = cleanText.match(/"scenes"\s*:\s*\[([\s\S]*)\]/);
        if (scenesMatch) {
          try {
            const scenesText = '[' + scenesMatch[1] + ']';
            const repairedScenes = repairJSON(scenesText);
            const scenes = JSON.parse(repairedScenes);
            parsed = { title: 'AI Generated Story', scenes };
            console.log('Scenes extraction successful');
          } catch {
            throw firstError; // Re-throw original error
          }
        } else {
          throw firstError;
        }
      }
    }
    
    // Validate and sanitize the response
    const rawScenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
    const scenes: AIGeneratedScene[] = rawScenes.map((scene: any) => {
      const characters = (scene.characters || []).map((char: any) => ({
        name: AVAILABLE_CHARACTERS.includes(char.name?.toLowerCase()) ? char.name.toLowerCase() : 'luna',
        action: AVAILABLE_ACTIONS.includes(char.action) ? char.action : 'idle',
        position: ['left', 'center', 'right'].includes(char.position) ? char.position : 'center',
        expression: ['happy', 'sad', 'surprised', 'neutral', 'angry'].includes(char.expression) ? char.expression : 'happy',
      }));

      const dialogue = Array.isArray(scene.dialogue)
        ? scene.dialogue
            .map((line: any) => ({
              speaker: typeof line.speaker === 'string' ? line.speaker : '',
              text: typeof line.text === 'string' ? line.text.trim() : '',
            }))
            .filter((line: any) => line.speaker && line.text)
        : undefined;

      return {
        title: scene.title || 'Untitled Scene',
        background: AVAILABLE_BACKGROUNDS.includes(scene.background) ? scene.background : 'meadow',
        narration: scene.narration || 'Something magical happens...',
        characters,
        dialogue,
        mood: scene.mood || 'happy',
        duration: scene.duration || 5000,
      };
    });

    return {
      title: parsed.title || 'AI Generated Story',
      scenes,
      success: true,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      title: 'Error',
      scenes: [],
      success: false,
      error: 'Failed to parse AI response',
    };
  }
}

/**
 * Main function to generate story with AI
 * Tries Gemini first, falls back to OpenAI
 */
export async function generateAIStory(request: AIStoryRequest): Promise<AIStoryResponse> {
  // Try Gemini first
  try {
    console.log('Attempting story generation with Gemini...');
    return await generateWithGemini(request);
  } catch (geminiError) {
    console.warn('Gemini failed, trying OpenAI:', geminiError);
    
    // Try OpenAI as fallback
    try {
      return await generateWithOpenAI(request);
    } catch (openaiError) {
      console.error('OpenAI also failed:', openaiError);
      
      // Return fallback story
      return generateFallbackStory(request);
    }
  }
}

/**
 * Generate a fallback story when AI is unavailable
 */
function generateFallbackStory(request: AIStoryRequest): AIStoryResponse {
  const characters = request.characters || ['luna'];
  const sceneCount = request.sceneCount || 3;
  
  const scenes: AIGeneratedScene[] = [];
  const backgrounds = ['meadow', 'forest', 'park'];
  const actions = ['walk', 'wave', 'dance'];
  const primaryCharacter = AVAILABLE_CHARACTERS.includes(characters[0]?.toLowerCase() || '')
    ? characters[0].toLowerCase()
    : 'luna';
  
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      title: `Scene ${i + 1}`,
      background: backgrounds[i % backgrounds.length],
      narration: i === 0 
        ? `Once upon a time, ${characters[0]} went on an adventure.`
        : i === sceneCount - 1
        ? `And they all lived happily ever after!`
        : `${characters[0]} discovered something wonderful along the way.`,
      characters: characters.slice(0, 2).map((name, idx) => ({
        name: AVAILABLE_CHARACTERS.includes(name.toLowerCase()) ? name.toLowerCase() : 'luna',
        action: actions[i % actions.length],
        position: idx === 0 ? 'left' as const : 'right' as const,
        expression: 'happy' as const,
      })),
      dialogue: [
        {
          speaker: primaryCharacter,
          text:
            i === 0
              ? "Let's go on an adventure!"
              : i === sceneCount - 1
              ? 'That was so much fun!'
              : 'Wow, this is amazing!',
        },
      ],
      mood: 'happy',
      duration: 5000,
    });
  }

  return {
    title: request.prompt ? `Story: ${request.prompt.slice(0, 30)}...` : 'A Magical Adventure',
    scenes,
    success: true,
    provider: 'fallback',
  };
}
