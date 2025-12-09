/**
 * AI Story Generator for Cartoon Studio
 * Integrates with AI APIs to generate creative stories
 */

export interface AIStoryRequest {
  prompt: string;
  characters: string[];
  setting: string;
  mood: 'happy' | 'adventurous' | 'funny' | 'educational' | 'mysterious';
  sceneCount: number;
  targetAge: 'toddler' | 'child' | 'family';
}

export interface AIGeneratedScene {
  title: string;
  narration: string;
  background: string;
  characters: {
    name: string;
    action: string;
    expression: string;
    position: 'left' | 'center' | 'right';
  }[];
  duration: number;
  cameraAngle?: string;
  transition?: string;
}

export interface AIGeneratedStory {
  title: string;
  summary: string;
  scenes: AIGeneratedScene[];
  moral?: string;
}

// Story templates for fallback/offline mode
const STORY_TEMPLATES = {
  adventure: [
    {
      title: "A New Day Begins",
      template: "One bright and sunny morning, {character1} woke up with a big, excited smile. The birds were singing, the sun was shining, and today felt like the perfect day for an amazing adventure!",
      actions: ["idle", "wave"],
    },
    {
      title: "Meeting a Friend",
      template: "\"Hey {character1}!\" called {character2} from across the meadow, waving excitedly. \"Want to explore the magical forest together? I heard there's something amazing waiting for us!\"",
      actions: ["talk", "wave"],
    },
    {
      title: "Into the Forest",
      template: "Hand in hand, {character1} and {character2} bravely walked into the enchanted forest. The ancient trees sparkled with magical light, colorful butterflies danced around them, and mysterious sounds filled the air.",
      actions: ["walk", "walk"],
    },
    {
      title: "A Magical Discovery",
      template: "\"Look!\" whispered {character1} in amazement. In a beautiful clearing, they discovered a glowing flower that shimmered with every color of the rainbow. It was the legendary Rainbow Blossom!",
      actions: ["surprised", "surprised"],
    },
    {
      title: "Happy Ending",
      template: "{character1} and {character2} carefully picked the magical flower to share with everyone. They realized that the best adventures are the ones shared with friends!",
      actions: ["jump", "jump"],
    },
  ],
  friendship: [
    {
      title: "Feeling Lonely",
      template: "{character1} sat alone on a park bench, watching other children laugh and play together. \"I wish I had someone to play with,\" {character1} thought quietly, feeling a little sad.",
      actions: ["sad", "sit"],
    },
    {
      title: "A Friendly Hello",
      template: "Just then, {character2} noticed {character1} sitting alone and walked over with a warm, friendly smile. \"Hi there! I'm {character2}. Would you like to play together?\"",
      actions: ["idle", "wave"],
    },
    {
      title: "Playing Together",
      template: "Their faces lit up with joy! They played hide and seek, built amazing sandcastles, and told each other the funniest jokes. {character1} couldn't stop laughing!",
      actions: ["jump", "jump"],
    },
    {
      title: "Sharing is Caring",
      template: "When it was snack time, {character1} shared delicious cookies, and {character2} shared a favorite toy. \"This is the best day ever!\" they both exclaimed.",
      actions: ["talk", "talk"],
    },
    {
      title: "Best Friends Forever",
      template: "As the golden sun began to set, {character1} and {character2} hugged and promised to meet again tomorrow. {character1} learned that a true friend can turn any ordinary day into something magical!",
      actions: ["wave", "wave"],
    },
  ],
  learning: [
    {
      title: "Curious Mind",
      template: "{character1} sat by the window, eyes wide with wonder, asking questions about everything. \"Why is the sky blue? How do birds fly? What makes rainbows appear?\" There was so much to discover!",
      actions: ["idle", "talk"],
    },
    {
      title: "Time to Explore",
      template: "{character1} and {character2} decided to explore the beautiful meadow together. \"Let's count all the different flowers we can find!\" suggested {character2} excitedly.",
      actions: ["walk", "walk"],
    },
    {
      title: "Counting Fun",
      template: "\"One red flower, two yellow flowers, three purple flowers!\" counted {character1} carefully. \"That's six flowers in total!\" cheered {character2}, clapping with joy.",
      actions: ["idle", "idle"],
    },
    {
      title: "Colors Everywhere",
      template: "Suddenly, a beautiful rainbow appeared in the sky! \"Red, orange, yellow, green, blue, and purple!\" {character1} named all the colors perfectly, feeling proud.",
      actions: ["surprised", "happy"],
    },
    {
      title: "Knowledge is Fun",
      template: "{character1} smiled proudly, realizing that learning new things was the most exciting adventure of all, especially when shared with a friend! \"Tomorrow, let's learn about shapes!\"",
      actions: ["wave", "wave"],
    },
  ],
  bedtime: [
    {
      title: "Getting Sleepy",
      template: "The stars began to twinkle outside {character1}'s window, and the moon rose high in the sky. It was time for bed, but {character1} wasn't quite sleepy yet.",
      actions: ["idle", "idle"],
    },
    {
      title: "Counting Stars",
      template: "{character1} snuggled under the cozy blanket and looked up at the beautiful night sky. \"One star, two stars, three stars...\" The gentle counting made {character1} feel peaceful and calm.",
      actions: ["idle", "idle"],
    },
    {
      title: "A Gentle Lullaby",
      template: "The evening wind whispered a soft, gentle lullaby through the trees, and the crickets sang their nighttime song. Even the big, round moon seemed to smile down at {character1}.",
      actions: ["idle", "idle"],
    },
    {
      title: "Dream Journey",
      template: "{character1}'s eyes grew heavy and began to close. In dreams, {character1} could fly among the fluffy clouds and dance with friendly twinkling stars.",
      actions: ["idle", "idle"],
    },
    {
      title: "Sweet Dreams",
      template: "With a happy heart full of wonderful dreams and a peaceful smile, {character1} drifted off to the most restful sleep. Tomorrow would bring brand new adventures. Goodnight!",
      actions: ["sit", "idle"],
    },
  ],
  magical: [
    {
      title: "A Mysterious Discovery",
      template: "{character1} was playing in the beautiful garden when something sparkly and shimmering caught their eye. Hidden under a bright flower was a magnificent magic wand, glowing with rainbow colors!",
      actions: ["idle", "surprised"],
    },
    {
      title: "The First Spell",
      template: "With excitement and wonder, {character1} carefully picked up the wand and waved it gently. Suddenly, the air filled with colorful sparkles that danced and twirled! \"Wow! This is real magic!\"",
      actions: ["wave", "happy"],
    },
    {
      title: "A Magical Friend",
      template: "The sparkles swirled and shimmered, and from the magical light, {character2} appeared! \"Hello! I'm a magical friend. The wand chose you because you have the kindest heart!\"",
      actions: ["idle", "wave"],
    },
    {
      title: "Spreading Joy",
      template: "Together, {character1} and {character2} used the magic wand to make flowers bloom, birds sing, and rainbows appear. Everyone in the village smiled and laughed, filled with joy!",
      actions: ["wave", "jump"],
    },
    {
      title: "The Real Magic",
      template: "\"The real magic,\" said {character2} with a knowing smile, \"isn't in the wand at all. It's the kindness in your heart that makes the world beautiful.\" {character1} smiled, understanding that being kind was the most powerful magic of all!",
      actions: ["wave", "wave"],
    },
  ],
  nature: [
    {
      title: "Into the Wild",
      template: "{character1} put on their favorite boots, grabbed a small backpack, and headed outside with excitement. \"What a beautiful day to explore nature!\" The sun was shining and birds were singing.",
      actions: ["walk", "walk"],
    },
    {
      title: "Forest Friends",
      template: "Deep in the magical forest, {character1} met {character2}. \"Look at all these amazing animals!\" A fluffy bunny hopped by, a colorful butterfly landed on a flower, and squirrels chattered in the trees.",
      actions: ["idle", "idle"],
    },
    {
      title: "By the Stream",
      template: "They discovered a sparkling, crystal-clear stream flowing through the forest. \"Look at the fish swimming!\" said {character1} with wonder. The water was so clear they could see colorful pebbles at the bottom.",
      actions: ["surprised", "idle"],
    },
    {
      title: "Helping Nature",
      template: "{character1} and {character2} noticed some litter and decided to help. They carefully picked it up. \"We need to take care of our beautiful planet!\" they agreed. Then they planted a small tree together.",
      actions: ["idle", "idle"],
    },
    {
      title: "Nature's Gift",
      template: "As the golden sun began to set, {character1} felt grateful and happy. \"Nature is so wonderful and precious! I promise to always protect it and help keep it beautiful.\" And they lived happily ever after!",
      actions: ["wave", "wave"],
    },
  ],
};

const OBJECTS = ['golden key', 'magic wand', 'treasure map', 'glowing crystal', 'ancient book', 'friendly butterfly'];
const LOCATIONS = ['old tree', 'colorful flower', 'sparkling stream', 'mossy rock', 'rainbow', 'fluffy cloud'];
const TOPICS = ['rainbows', 'butterflies', 'the stars', 'flowers', 'the ocean', 'music'];

// Generate story using AI API (with fallback to templates)
export async function generateAIStory(
  request: AIStoryRequest,
  apiKey?: string
): Promise<AIGeneratedStory> {
  // If API key is provided, try to use AI
  if (apiKey) {
    try {
      return await generateWithOpenAI(request, apiKey);
    } catch (error) {
      console.warn('AI generation failed, falling back to templates:', error);
    }
  }

  // Fallback to template-based generation
  return generateFromTemplate(request);
}

// Generate story using OpenAI API
async function generateWithOpenAI(
  request: AIStoryRequest,
  apiKey: string
): Promise<AIGeneratedStory> {
  const systemPrompt = `You are a creative children's story writer. Generate engaging, age-appropriate stories for ${request.targetAge} audiences. 
  
  The story should:
  - Be ${request.mood} in tone
  - Feature the characters: ${request.characters.join(', ')}
  - Take place in: ${request.setting}
  - Have exactly ${request.sceneCount} scenes
  - Include a positive message or moral
  
  For each scene, provide:
  - A short title
  - Narration text (2-3 sentences, simple language)
  - Character actions (idle, walk, run, jump, wave, talk, dance, surprised, sad)
  - Character expressions (happy, sad, surprised, angry, neutral)
  - Background setting (meadow, forest, beach, night, bedroom, park)
  
  Respond in JSON format.`;

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
        { role: 'user', content: request.prompt || `Create a ${request.mood} story about ${request.characters.join(' and ')} in the ${request.setting}.` },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in AI response');
  }

  // Parse the JSON response
  try {
    const parsed = JSON.parse(content);
    return normalizeAIResponse(parsed, request);
  } catch {
    // If JSON parsing fails, try to extract story from text
    return parseTextResponse(content, request);
  }
}

// Normalize AI response to our format
function normalizeAIResponse(parsed: any, request: AIStoryRequest): AIGeneratedStory {
  const scenes: AIGeneratedScene[] = (parsed.scenes || []).map((scene: any, index: number) => ({
    title: scene.title || `Scene ${index + 1}`,
    narration: scene.narration || scene.text || '',
    background: mapBackground(scene.background || request.setting),
    characters: (scene.characters || request.characters).map((char: any, i: number) => ({
      name: typeof char === 'string' ? char : char.name || request.characters[i] || 'Character',
      action: char.action || 'idle',
      expression: char.expression || 'happy',
      position: i === 0 ? 'left' : i === 1 ? 'right' : 'center',
    })),
    duration: 6000,
    cameraAngle: scene.cameraAngle || 'medium',
    transition: scene.transition || 'fade',
  }));

  return {
    title: parsed.title || 'My Story',
    summary: parsed.summary || '',
    scenes,
    moral: parsed.moral || parsed.lesson,
  };
}

// Parse text response when JSON fails
function parseTextResponse(text: string, request: AIStoryRequest): AIGeneratedStory {
  // Simple text parsing - split by paragraphs
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  const scenes: AIGeneratedScene[] = paragraphs.slice(0, request.sceneCount).map((para, index) => ({
    title: `Scene ${index + 1}`,
    narration: para.trim(),
    background: mapBackground(request.setting),
    characters: request.characters.map((name, i) => ({
      name,
      action: 'idle',
      expression: 'happy',
      position: i === 0 ? 'left' as const : 'right' as const,
    })),
    duration: 6000,
  }));

  return {
    title: 'My Story',
    summary: paragraphs[0] || '',
    scenes,
  };
}

// Map setting names to background IDs
function mapBackground(setting: string): string {
  const lower = setting.toLowerCase();
  if (lower.includes('forest') || lower.includes('wood')) return 'forest';
  if (lower.includes('beach') || lower.includes('ocean') || lower.includes('sea')) return 'beach';
  if (lower.includes('night') || lower.includes('star') || lower.includes('moon')) return 'night';
  if (lower.includes('bedroom') || lower.includes('room') || lower.includes('house')) return 'bedroom';
  if (lower.includes('park') || lower.includes('playground')) return 'park';
  return 'meadow';
}

// Generate story from templates (offline fallback)
function generateFromTemplate(request: AIStoryRequest): AIGeneratedStory {
  const templateType = request.mood === 'adventurous' ? 'adventure' :
                       request.mood === 'educational' ? 'learning' : 'friendship';
  
  const templates = STORY_TEMPLATES[templateType];
  const character1 = request.characters[0] || 'Luna';
  const character2 = request.characters[1] || 'Max';
  const setting = request.setting || 'meadow';
  
  const scenes: AIGeneratedScene[] = templates.slice(0, request.sceneCount).map((template, index) => {
    const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    
    const narration = template.template
      .replace(/{character1}/g, character1)
      .replace(/{character2}/g, character2)
      .replace(/{setting}/g, setting)
      .replace(/{object}/g, object)
      .replace(/{location}/g, location)
      .replace(/{topic}/g, topic);

    return {
      title: template.title,
      narration,
      background: mapBackground(setting),
      characters: request.characters.slice(0, 2).map((name, i) => ({
        name,
        action: template.actions[i] || 'idle',
        expression: template.actions[i] === 'sad' ? 'sad' : 
                   template.actions[i] === 'surprised' ? 'surprised' : 'happy',
        position: i === 0 ? 'left' as const : 'right' as const,
      })),
      duration: 6000,
      cameraAngle: index === 0 ? 'wide' : index === templates.length - 1 ? 'medium' : 'closeup',
      transition: 'fade',
    };
  });

  const morals = {
    adventure: 'Being brave leads to wonderful discoveries!',
    friendship: 'True friends make every day brighter!',
    learning: 'Curiosity opens the door to knowledge!',
  };

  return {
    title: `${character1}'s ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`,
    summary: `A ${request.mood} story about ${character1} and friends.`,
    scenes,
    moral: morals[templateType],
  };
}

// Story prompt suggestions
export const STORY_PROMPTS = [
  "A magical adventure in an enchanted forest",
  "Making new friends at the playground",
  "Learning about butterflies and flowers",
  "A treasure hunt in the backyard",
  "Helping a lost puppy find its way home",
  "A rainy day adventure indoors",
  "Discovering the wonders of the ocean",
  "A birthday party surprise",
  "Learning to share with others",
  "A journey to the stars",
];

// Character suggestions based on story type
export const CHARACTER_SUGGESTIONS = {
  adventure: ['Luna', 'Max', 'Whiskers'],
  friendship: ['Emma', 'Luna', 'Buddy'],
  learning: ['Max', 'Luna', 'Cotton'],
  funny: ['Whiskers', 'Buddy', 'Max'],
  mysterious: ['Luna', 'Max', 'Whiskers'],
};

// Story continuation templates for extending stories
const CONTINUATION_TEMPLATES = {
  adventure: [
    {
      title: "A New Challenge",
      template: "But wait! {character1} noticed something unusual in the distance. \"What's that over there?\" A mysterious path led deeper into the unknown, promising more exciting discoveries!",
      actions: ["surprised", "idle"],
    },
    {
      title: "Unexpected Twist",
      template: "Just when they thought the adventure was over, {character2} found a hidden clue! \"Look at this!\" they exclaimed. The journey was only beginning...",
      actions: ["talk", "surprised"],
    },
    {
      title: "The Final Discovery",
      template: "Together, {character1} and {character2} uncovered the greatest treasure of all - the joy of exploration! They promised to have many more adventures together.",
      actions: ["jump", "jump"],
    },
  ],
  friendship: [
    {
      title: "Growing Closer",
      template: "{character1} and {character2} discovered they had so much in common! They both loved the same games and shared the same dreams. Their friendship grew stronger every moment.",
      actions: ["talk", "talk"],
    },
    {
      title: "A Kind Gesture",
      template: "When {character1} felt a little sad, {character2} knew exactly what to do. A warm hug and kind words made everything better. That's what true friends do!",
      actions: ["idle", "wave"],
    },
    {
      title: "Friends Forever",
      template: "As the stars began to twinkle, {character1} and {character2} made a promise under the night sky. \"Best friends forever!\" they cheered, hearts full of happiness.",
      actions: ["wave", "wave"],
    },
  ],
  learning: [
    {
      title: "More Questions",
      template: "{character1} was amazed by everything they learned! But every answer led to more questions. \"I wonder what else I can discover?\" The curiosity never stopped!",
      actions: ["talk", "idle"],
    },
    {
      title: "Sharing Knowledge",
      template: "Excited to share, {character1} told {character2} everything they learned. \"That's so cool!\" said {character2}. Teaching others is the best way to learn!",
      actions: ["talk", "surprised"],
    },
    {
      title: "The Joy of Learning",
      template: "{character1} realized that learning was the greatest adventure of all. Every day brought new wonders to explore. Knowledge truly is magical!",
      actions: ["jump", "wave"],
    },
  ],
};

// Generate continuation scenes for an existing story
export interface StoryContinuationRequest {
  existingScenes: AIGeneratedScene[];
  characters: string[];
  mood: string;
  additionalSceneCount: number;
}

export async function continueStory(
  request: StoryContinuationRequest,
  apiKey?: string
): Promise<AIGeneratedScene[]> {
  const { existingScenes, characters, mood, additionalSceneCount } = request;
  
  // Try AI-based continuation if API key provided
  if (apiKey) {
    try {
      const lastScene = existingScenes[existingScenes.length - 1];
      const storyContext = existingScenes.map(s => s.narration).join(' ');
      
      // Use the generate-story API with continuation context
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: mood,
          characters: characters.map(c => ({ name: c })),
          sceneCount: additionalSceneCount,
          customPrompt: `Continue this story naturally. Previous context: ${storyContext.slice(-500)}. Generate ${additionalSceneCount} more scenes that continue the narrative.`,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.scenes || [];
      }
    } catch (error) {
      console.warn('AI continuation failed, falling back to templates:', error);
    }
  }
  
  // Fallback to template-based continuation
  return generateContinuationFromTemplate(request);
}

function generateContinuationFromTemplate(
  request: StoryContinuationRequest
): AIGeneratedScene[] {
  const { characters, mood, additionalSceneCount, existingScenes } = request;
  
  const templateType = mood === 'adventure' || mood === 'adventurous' ? 'adventure' :
                       mood === 'learning' || mood === 'educational' ? 'learning' : 'friendship';
  
  const templates = CONTINUATION_TEMPLATES[templateType] || CONTINUATION_TEMPLATES.adventure;
  const character1 = characters[0] || 'Luna';
  const character2 = characters[1] || 'Max';
  
  // Get the last background used
  const lastBackground = existingScenes[existingScenes.length - 1]?.background || 'meadow';
  
  return templates.slice(0, additionalSceneCount).map((template, index) => {
    const narration = template.template
      .replace(/{character1}/g, character1)
      .replace(/{character2}/g, character2);

    return {
      title: template.title,
      narration,
      background: lastBackground,
      characters: characters.slice(0, 2).map((name, i) => ({
        name,
        action: template.actions[i] || 'idle',
        expression: template.actions[i] === 'surprised' ? 'surprised' : 
                   template.actions[i] === 'jump' ? 'happy' : 'neutral',
        position: i === 0 ? 'left' as const : 'right' as const,
      })),
      duration: 6000,
      cameraAngle: 'medium',
      transition: 'fade',
    };
  });
}
