"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Sparkles,
  X,
  Play,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  TreePine,
  Home,
  Waves,
  Moon,
  Sun,
  Mountain,
  Building,
  Tent,
  Bot,
  MessageSquare,
} from "lucide-react";
import { STORY_PROMPTS } from "@/lib/ai-story-generator";
import type { AIStoryResponse } from "@/lib/ai-types";

// Types
interface StoryScene {
  title: string;
  description: string;
  narration: string;
  background: string;
  characters: { name: string; position: 'left' | 'center' | 'right'; expression: string; action: string }[];
  duration: number;
  dialogue?: { speaker: string; text: string }[];
}

interface GeneratedStory {
  title: string;
  theme: string;
  scenes: StoryScene[];
  castLabels?: Record<string, string>;
  castDescriptions?: Record<string, string>;
  provider?: string;
  coverImage?: string;
}

interface StoryGeneratorProps {
  onStoryGenerated: (story: GeneratedStory) => void;
  onClose: () => void;
}

// Story types with icons and colors
const STORY_TYPES = [
  { 
    id: 'adventure', 
    name: 'Adventure', 
    icon: Mountain, 
    color: 'from-orange-400 to-red-500',
    description: 'Exciting journeys and discoveries'
  },
  { 
    id: 'friendship', 
    name: 'Friendship', 
    icon: Sparkles, 
    color: 'from-pink-400 to-purple-500',
    description: 'Heartwarming tales of friends'
  },
  { 
    id: 'learning', 
    name: 'Learning', 
    icon: Sun, 
    color: 'from-yellow-400 to-orange-500',
    description: 'Fun educational stories'
  },
  { 
    id: 'bedtime', 
    name: 'Bedtime', 
    icon: Moon, 
    color: 'from-indigo-400 to-purple-600',
    description: 'Calm and dreamy tales'
  },
  { 
    id: 'magical', 
    name: 'Magical', 
    icon: Wand2, 
    color: 'from-violet-400 to-fuchsia-500',
    description: 'Enchanting fantasy stories'
  },
  { 
    id: 'nature', 
    name: 'Nature', 
    icon: TreePine, 
    color: 'from-green-400 to-emerald-500',
    description: 'Stories about animals & nature'
  },
];

// Characters with visual representation
const CHARACTERS = [
  {
    id: 'Kiara',
    name: 'Kiara',
    emoji: '👧',
    color: 'bg-yellow-100 border-yellow-300',
    description: 'Energetic & musical'
  },
  {
    id: 'Jayden',
    name: 'Jayden',
    emoji: '👦',
    color: 'bg-cyan-100 border-cyan-300',
    description: 'Playful & sporty'
  },
  { 
    id: 'Luna', 
    name: 'Luna', 
    emoji: '👧',
    color: 'bg-pink-100 border-pink-300',
    description: 'Curious & brave'
  },
  { 
    id: 'Max', 
    name: 'Max', 
    emoji: '👦',
    color: 'bg-blue-100 border-blue-300',
    description: 'Friendly & adventurous'
  },
  { 
    id: 'Whiskers', 
    name: 'Whiskers', 
    emoji: '🐱',
    color: 'bg-orange-100 border-orange-300',
    description: 'Playful cat'
  },
];

// Backgrounds
const BACKGROUNDS = [
  { id: 'meadow', name: 'Meadow', icon: Sun, color: 'bg-green-100' },
  { id: 'forest', name: 'Forest', icon: TreePine, color: 'bg-emerald-100' },
  { id: 'beach', name: 'Beach', icon: Waves, color: 'bg-cyan-100' },
  { id: 'night', name: 'Night Sky', icon: Moon, color: 'bg-indigo-100' },
  { id: 'bedroom', name: 'Bedroom', icon: Home, color: 'bg-purple-100' },
  { id: 'park', name: 'Park', icon: TreePine, color: 'bg-lime-100' },
];

// Story generation function
function generateStory(
  storyType: string,
  selectedCharacters: string[],
  sceneCount: number,
  customPrompt: string
): GeneratedStory {
  const chars = selectedCharacters.length > 0 ? selectedCharacters : ['Kiara', 'Jayden'];
  const mainChar = chars[0];
  const secondChar = chars[1] || chars[0];
  
  // Story templates based on type
  const storyTemplates: Record<string, { title: string; scenes: Omit<StoryScene, 'duration'>[] }> = {
    adventure: {
      title: `${mainChar}'s Big Adventure`,
      scenes: [
        {
          title: 'A New Day Begins',
          description: 'The adventure starts',
          narration: `One bright and sunny morning, ${mainChar} woke up with a big, excited smile. The birds were singing, the sun was shining, and today felt like the perfect day for an amazing adventure!`,
          background: 'meadow',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'wave' }],
        },
        {
          title: 'Meeting a Friend',
          description: 'Friends join together',
          narration: `"Hey ${mainChar}!" called ${secondChar} from across the meadow, waving excitedly. "Want to explore the magical forest together? I heard there's something amazing waiting for us!"`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'talk' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
        {
          title: 'Into the Forest',
          description: 'The journey begins',
          narration: `Hand in hand, ${mainChar} and ${secondChar} bravely walked into the enchanted forest. The ancient trees sparkled with magical light, colorful butterflies danced around them, and mysterious sounds filled the air.`,
          background: 'forest',
          characters: [
            { name: mainChar, position: 'left', expression: 'surprised', action: 'walk' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'walk' },
          ],
        },
        {
          title: 'A Magical Discovery',
          description: 'Something wonderful appears',
          narration: `"Look!" whispered ${mainChar} in amazement. In a beautiful clearing, they discovered a glowing flower that shimmered with every color of the rainbow. It was the legendary Rainbow Blossom, said to bring joy to all who find it!`,
          background: 'forest',
          characters: [
            { name: mainChar, position: 'left', expression: 'surprised', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'surprised', action: 'idle' },
          ],
        },
        {
          title: 'Happy Ending',
          description: 'The adventure concludes',
          narration: `${mainChar} and ${secondChar} carefully picked the magical flower to share with everyone in their village. As they walked home, they realized that the best adventures are the ones shared with friends, and that courage and friendship make everything more wonderful!`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'jump' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'jump' },
          ],
        },
      ],
    },
    friendship: {
      title: `${mainChar} Makes a New Friend`,
      scenes: [
        {
          title: 'Feeling Lonely',
          description: 'A quiet day',
          narration: `${mainChar} sat alone on a park bench, watching other children laugh and play together. A small sigh escaped. "I wish I had someone to play with," ${mainChar} thought quietly, feeling a little sad.`,
          background: 'park',
          characters: [{ name: mainChar, position: 'center', expression: 'sad', action: 'sit' }],
        },
        {
          title: 'A Friendly Hello',
          description: 'Someone new arrives',
          narration: `Just then, ${secondChar} noticed ${mainChar} sitting alone and walked over with a warm, friendly smile. "Hi there! I'm ${secondChar}. You look like you could use a friend. Would you like to play together?"`,
          background: 'park',
          characters: [
            { name: mainChar, position: 'left', expression: 'surprised', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
        {
          title: 'Playing Together',
          description: 'Fun and games',
          narration: `Their faces lit up with joy! They played hide and seek among the trees, built amazing sandcastles, and told each other the funniest jokes. ${mainChar} couldn't stop laughing, and for the first time that day, felt truly happy!`,
          background: 'park',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'jump' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'jump' },
          ],
        },
        {
          title: 'Sharing is Caring',
          description: 'A kind gesture',
          narration: `When it was snack time, ${mainChar} shared delicious cookies from home, and ${secondChar} shared a favorite toy. "This is the best day ever!" they both exclaimed, learning that sharing makes friendship even sweeter!`,
          background: 'park',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'talk' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'talk' },
          ],
        },
        {
          title: 'Best Friends Forever',
          description: 'A beautiful friendship',
          narration: `As the golden sun began to set, painting the sky in beautiful colors, ${mainChar} and ${secondChar} hugged and promised to meet again tomorrow. ${mainChar} learned that a true friend can turn any ordinary day into something magical!`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'wave' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
      ],
    },
    learning: {
      title: `${mainChar} Learns Something New`,
      scenes: [
        {
          title: 'Curious Mind',
          description: 'Questions arise',
          narration: `${mainChar} sat by the window, eyes wide with wonder, asking questions about everything. "Why is the sky blue? How do birds fly? What makes rainbows appear?" There was so much to discover and learn!`,
          background: 'bedroom',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'talk' }],
        },
        {
          title: 'Time to Explore',
          description: 'Discovery begins',
          narration: `${mainChar} and ${secondChar} decided to explore the beautiful meadow together. "Let's count all the different flowers we can find!" suggested ${secondChar} excitedly. "And learn their colors too!"`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'walk' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'walk' },
          ],
        },
        {
          title: 'Counting Fun',
          description: 'Learning numbers',
          narration: `"One red flower, two yellow flowers, three purple flowers!" counted ${mainChar} carefully, pointing at each one. "That's six flowers in total!" cheered ${secondChar}, clapping with joy. Learning was so much fun!`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'idle' },
          ],
        },
        {
          title: 'Colors Everywhere',
          description: 'Learning colors',
          narration: `Suddenly, a beautiful rainbow appeared in the sky after a gentle rain! "Red, orange, yellow, green, blue, and purple!" ${mainChar} named all the colors perfectly, feeling proud. "We learned so much today!"`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'surprised', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'idle' },
          ],
        },
        {
          title: 'Knowledge is Fun',
          description: 'Lesson learned',
          narration: `${mainChar} smiled proudly, realizing that learning new things was the most exciting adventure of all, especially when shared with a friend! "Tomorrow, let's learn about shapes!" they both agreed, already excited for the next discovery.`,
          background: 'bedroom',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'wave' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
      ],
    },
    bedtime: {
      title: `${mainChar}'s Dreamy Night`,
      scenes: [
        {
          title: 'Getting Sleepy',
          description: 'Night time arrives',
          narration: `The stars began to twinkle outside ${mainChar}'s window, and the moon rose high in the sky. It was time for bed, but ${mainChar} wasn't quite sleepy yet, feeling wide awake and curious about the night.`,
          background: 'bedroom',
          characters: [{ name: mainChar, position: 'center', expression: 'neutral', action: 'idle' }],
        },
        {
          title: 'Counting Stars',
          description: 'A peaceful moment',
          narration: `${mainChar} snuggled under the cozy blanket and looked up at the beautiful night sky through the window. "One star, two stars, three stars..." The gentle counting made ${mainChar} feel peaceful and calm, like floating on a cloud.`,
          background: 'night',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'idle' }],
        },
        {
          title: 'A Gentle Lullaby',
          description: 'Sweet sounds',
          narration: `The evening wind whispered a soft, gentle lullaby through the trees, and the crickets sang their nighttime song. Even the big, round moon seemed to smile down at ${mainChar} with a warm, comforting glow.`,
          background: 'night',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'idle' }],
        },
        {
          title: 'Dream Journey',
          description: 'Imagination takes flight',
          narration: `${mainChar}'s eyes grew heavy and began to close. In dreams, ${mainChar} could fly among the fluffy clouds, dance with friendly twinkling stars, and visit magical places where anything was possible.`,
          background: 'night',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'idle' }],
        },
        {
          title: 'Sweet Dreams',
          description: 'Peaceful sleep',
          narration: `With a happy heart full of wonderful dreams and a peaceful smile, ${mainChar} drifted off to the most restful sleep. Tomorrow would bring brand new adventures and discoveries. Goodnight, sweet dreams!`,
          background: 'bedroom',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'sit' }],
        },
      ],
    },
    magical: {
      title: `${mainChar} and the Magic Wand`,
      scenes: [
        {
          title: 'A Mysterious Discovery',
          description: 'Something magical appears',
          narration: `${mainChar} was playing in the beautiful garden when something sparkly and shimmering caught their eye. Hidden under a bright flower was a magnificent magic wand, glowing with rainbow colors and covered in twinkling stars!`,
          background: 'meadow',
          characters: [{ name: mainChar, position: 'center', expression: 'surprised', action: 'idle' }],
        },
        {
          title: 'The First Spell',
          description: 'Magic happens',
          narration: `With excitement and wonder, ${mainChar} carefully picked up the wand and waved it gently, saying the magic words. Suddenly, the air filled with colorful sparkles that danced and twirled like tiny stars! "Wow! This is real magic!" gasped ${mainChar} in amazement.`,
          background: 'meadow',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'wave' }],
        },
        {
          title: 'A Magical Friend',
          description: 'Someone appears',
          narration: `The sparkles swirled and shimmered, and from the magical light, ${secondChar} appeared with a warm smile! "Hello! I'm a magical friend," said ${secondChar}. "The wand chose you because you have the kindest heart in the whole world!"`,
          background: 'forest',
          characters: [
            { name: mainChar, position: 'left', expression: 'surprised', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
        {
          title: 'Spreading Joy',
          description: 'Using magic for good',
          narration: `Together, ${mainChar} and ${secondChar} used the magic wand to make flowers bloom in every color, birds sing the sweetest songs, and rainbows appear in the clear sky. Everyone in the village smiled and laughed, filled with joy and happiness!`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'wave' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'jump' },
          ],
        },
        {
          title: 'The Real Magic',
          description: 'A valuable lesson',
          narration: `"The real magic," said ${secondChar} with a knowing smile, "isn't in the wand at all. It's the kindness in your heart that makes the world beautiful." ${mainChar} smiled, understanding that being kind and helping others was the most powerful magic of all!`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'wave' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
      ],
    },
    nature: {
      title: `${mainChar}'s Nature Walk`,
      scenes: [
        {
          title: 'Into the Wild',
          description: 'An outdoor adventure',
          narration: `${mainChar} put on their favorite boots, grabbed a small backpack, and headed outside with excitement. "What a beautiful day to explore nature!" The sun was shining brightly, birds were singing cheerful songs, and the whole world seemed to be waiting for adventure!`,
          background: 'meadow',
          characters: [{ name: mainChar, position: 'center', expression: 'happy', action: 'walk' }],
        },
        {
          title: 'Forest Friends',
          description: 'Meeting animals',
          narration: `Deep in the magical forest, ${mainChar} met ${secondChar}, who was also exploring. "Look at all these amazing animals!" A fluffy bunny hopped by, a colorful butterfly landed gently on a flower, and squirrels chattered in the trees above.`,
          background: 'forest',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'idle' },
          ],
        },
        {
          title: 'By the Stream',
          description: 'Water discovery',
          narration: `They discovered a sparkling, crystal-clear stream flowing through the forest. "Look at the fish swimming!" said ${mainChar} with wonder. The water was so clear they could see colorful pebbles at the bottom, and tiny tadpoles darting playfully.`,
          background: 'beach',
          characters: [
            { name: mainChar, position: 'left', expression: 'surprised', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'idle' },
          ],
        },
        {
          title: 'Helping Nature',
          description: 'Being eco-friendly',
          narration: `${mainChar} and ${secondChar} noticed some litter and decided to help. They carefully picked it up and put it in a bag. "We need to take care of our beautiful planet!" they agreed. Then they planted a small tree together, promising to watch it grow.`,
          background: 'forest',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'idle' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'idle' },
          ],
        },
        {
          title: "Nature's Gift",
          description: 'A beautiful ending',
          narration: `As the golden sun began to set, painting the sky in beautiful oranges and pinks, ${mainChar} felt grateful and happy. "Nature is so wonderful and precious! I promise to always protect it and help keep it beautiful." And they lived happily ever after, caring for the world around them!`,
          background: 'meadow',
          characters: [
            { name: mainChar, position: 'left', expression: 'happy', action: 'wave' },
            { name: secondChar, position: 'right', expression: 'happy', action: 'wave' },
          ],
        },
      ],
    },
  };

  const template = storyTemplates[storyType] || storyTemplates.adventure;
  const scenes = template.scenes.slice(0, sceneCount).map((scene, index) => ({
    ...scene,
    // Longer duration for first and last scenes, medium for others
    duration: index === 0 || index === sceneCount - 1 ? 7000 : 6000,
  }));

  return {
    title: template.title,
    theme: storyType,
    scenes,
  };
}

export default function StoryGenerator({ onStoryGenerated, onClose }: StoryGeneratorProps) {
  const [step, setStep] = useState(1);
  const [storyType, setStoryType] = useState("adventure");
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>(["Luna", "Max"]);
  const [sceneCount, setSceneCount] = useState(4);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(-1);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiProviderHint, setAiProviderHint] = useState<string>("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAIProvider, setLastAIProvider] = useState<string | null>(null);
  const [aiStatusDetail, setAiStatusDetail] = useState<{ gemini: boolean; openai: boolean } | null>(null);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [characterArt, setCharacterArt] = useState<Record<string, string>>({});
  const [artLoadingId, setArtLoadingId] = useState<string | null>(null);
  const [artError, setArtError] = useState<string | null>(null);
  const [isSuggestingCast, setIsSuggestingCast] = useState(false);
  const [aiCastError, setAiCastError] = useState<string | null>(null);
  const [aiCastSummary, setAiCastSummary] = useState<string | null>(null);
  const [aiCastMap, setAiCastMap] = useState<Record<string, { name: string; description: string }>>({});
  const [generationProgress, setGenerationProgress] = useState<string>("");

  // Check backend AI status (env-configured providers)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/ai-status");
        if (!res.ok) throw new Error("Status request failed");
        const data = await res.json();

        setAiStatusDetail({ gemini: !!data.gemini, openai: !!data.openai });

        if (data.any) {
          setAiAvailable(true);
          if (data.gemini && data.openai) {
            setAiProviderHint("Gemini + OpenAI");
          } else if (data.gemini) {
            setAiProviderHint("Gemini");
          } else if (data.openai) {
            setAiProviderHint("OpenAI");
          }
        } else {
          setAiAvailable(false);
          setAiProviderHint("Not configured (using smart templates)");
        }
      } catch {
        setAiAvailable(false);
        setAiProviderHint("Status unknown (falling back to templates if needed)");
        setAiStatusDetail(null);
      }
    };

    checkStatus();
  }, []);

  const toggleCharacter = (id: string) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((c) => c !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const handleSuggestCast = async () => {
    setIsSuggestingCast(true);
    setAiCastError(null);
    setAiCastSummary(null);

    try {
      const res = await fetch("/api/ai-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyType,
          prompt:
            customPrompt ||
            (selectedPromptIndex >= 0 ? STORY_PROMPTS[selectedPromptIndex] : ""),
          maxCharacters: 3,
        }),
      });

      if (!res.ok) {
        let message = "Failed to suggest characters";
        try {
          const errJson = await res.json();
          if (errJson?.error) message = errJson.error;
        } catch {
        }
        throw new Error(message);
      }

      const data = await res.json();
      const suggestions = Array.isArray(data.characters) ? data.characters : [];

      if (!suggestions.length) {
        throw new Error("AI did not return any characters.");
      }

      const validIds = suggestions
        .map((c: any) => c.id)
        .filter((id: string) => CHARACTERS.some((char) => char.id === id));

      if (validIds.length) {
        setSelectedCharacters(validIds);
      }

      const map: Record<string, { name: string; description: string }> = {};
      suggestions.forEach((c: any) => {
        const id = typeof c.id === 'string' ? c.id : '';
        if (!id) return;
        const name = (typeof c.name === 'string' && c.name.trim()) ? c.name.trim() : id;
        const desc = (typeof c.description === 'string' && c.description.trim())
          ? c.description.trim()
          : 'Character for this story';
        map[id] = { name, description: desc };
      });
      setAiCastMap(map);

      const summary = suggestions
        .map((c: any) => {
          const name = c.name || c.id;
          const desc = c.description || "Character for this story";
          return `${name}: ${desc}`;
        })
        .join(" • ");

      setAiCastSummary(summary);
    } catch (error) {
      console.error("AI character suggestion failed:", error);
      const message = error instanceof Error ? error.message : "Failed to suggest characters.";
      setAiCastError(message);
    } finally {
      setIsSuggestingCast(false);
    }
  };

  const handleGenerateCharacterArt = async (id: string, description?: string) => {
    setArtLoadingId(id);
    setArtError(null);

    try {
      const res = await fetch("/api/generate-character-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: id,
          description,
        }),
      });

      if (!res.ok) {
        let message = "Image generation failed";
        try {
          const errJson = await res.json();
          if (errJson?.error) message = errJson.error;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      const data = await res.json();
      const base64 = data.imageBase64 as string | undefined;
      const url = data.imageUrl as string | undefined;

      if (!base64 && !url) {
        throw new Error("No image returned");
      }

      const dataUrl = base64 ? `data:image/png;base64,${base64}` : url!;
      setCharacterArt((prev) => ({ ...prev, [id]: dataUrl }));
    } catch (error) {
      console.error("Character art generation failed:", error);
      const message = error instanceof Error ? error.message : "Could not generate character image right now.";
      setArtError(message);
    } finally {
      setArtLoadingId(null);
    }
  };

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai-status");
      if (!res.ok) throw new Error("Status request failed");
      const data = await res.json();

      setAiStatusDetail({ gemini: !!data.gemini, openai: !!data.openai });

      if (data.any) {
        setAiAvailable(true);
        if (data.gemini && data.openai) {
          setAiProviderHint("Gemini + OpenAI");
        } else if (data.gemini) {
          setAiProviderHint("Gemini");
        } else if (data.openai) {
          setAiProviderHint("OpenAI");
        }
      } else {
        setAiAvailable(false);
        setAiProviderHint("Not configured (using smart templates)");
      }
    } catch (error) {
      console.error("AI status check failed:", error);
      setAiAvailable(false);
      setAiProviderHint("Status unknown (falling back to templates if needed)");
      setAiStatusDetail(null);
      setAiError("Failed to reach AI status endpoint.");
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setAiError(null);
    setGenerationProgress("Preparing your story...");

    const castLabels = Object.keys(aiCastMap).length
      ? Object.fromEntries(
          Object.entries(aiCastMap).map(([id, value]) => [id, value.name])
        )
      : undefined;

    const castDescriptions = Object.keys(aiCastMap).length
      ? Object.fromEntries(
          Object.entries(aiCastMap).map(([id, value]) => [id, value.description])
        )
      : undefined;

    const coverImage = (() => {
      const idsInOrder = selectedCharacters.length
        ? selectedCharacters
        : Object.keys(characterArt);
      for (const id of idsInOrder) {
        const img = characterArt[id];
        if (img) return img;
      }
      return undefined;
    })();

    try {
      setGenerationProgress("Connecting to AI...");
      
      // Always use AI generation
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            customPrompt ||
            STORY_PROMPTS[selectedPromptIndex] ||
            `A ${storyType} story featuring ${selectedCharacters.join(' and ')}`,
            genre: storyType,
            characters: selectedCharacters.map((c) => c.toLowerCase()),
            sceneCount,
            targetAudience: "child",
          }),
        });

        setGenerationProgress("Generating story with AI...");

        if (!response.ok) {
          let message = "AI request failed";
          try {
            const errJson = await response.json();
            if (errJson?.error) message = errJson.error;
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(message);
        }

        const aiStory: AIStoryResponse = await response.json();

        setGenerationProgress("Processing your story...");

        if (aiStory.success && aiStory.scenes?.length > 0) {
          const story: GeneratedStory = {
            title: aiStory.title,
            theme: storyType,
            scenes: aiStory.scenes.map((scene) => ({
              title: scene.title,
              description: scene.title,
              narration: scene.narration,
              background: scene.background,
              characters: scene.characters.map((char) => ({
                name:
                  char.name.charAt(0).toUpperCase() + char.name.slice(1),
                position: char.position,
                expression: char.expression,
                action: char.action,
              })),
              dialogue: scene.dialogue?.map((line) => ({
                speaker:
                  line.speaker.charAt(0).toUpperCase() + line.speaker.slice(1),
                text: line.text,
              })),
              duration: scene.duration,
            })),
            castLabels,
            castDescriptions,
            provider: aiStory.provider || 'ai',
            coverImage,
          };

          setGeneratedStory(story);
          setLastAIProvider(aiStory.provider || null);
          setAiError(null);
          setGenerationProgress("");
          console.log(`✨ Story generated with ${aiStory.provider}`);
        } else {
          throw new Error(aiStory.error || "AI generation failed - please try again");
        }
    } catch (error) {
      console.error("Story generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate story";
      setAiError(errorMessage);
      setGenerationProgress("");
      // Don't fall back to templates - let user retry or adjust their prompt
    }

    setIsGenerating(false);
    setStep(4);
  };

  const handleConfirm = () => {
    if (generatedStory) {
      onStoryGenerated(generatedStory);
    }
  };

  const totalSteps = 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#12121a] rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden border border-white/10"
      >
        {/* Header - Simplified */}
        <div className="relative px-5 py-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div>
            <h2 className="text-xl font-semibold text-white">Create Story</h2>
            <p className="text-zinc-400 text-sm mt-1">Design animated stories in minutes</p>
          </div>

          {/* Progress Steps - Simplified */}
          <div className="mt-5 flex items-center gap-2">
            {[1, 2, 3, 4].map((s, i) => (
              <React.Fragment key={s}>
                <div 
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm transition-all ${
                    step > s 
                      ? 'bg-indigo-500 text-white' 
                      : step === s 
                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/30' 
                        : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-0.5 rounded-full ${step > s ? 'bg-indigo-500' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 min-h-[300px] max-h-[45vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Story Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">Choose Story Type</h3>
                  <p className="text-zinc-500 text-sm mt-1">What kind of adventure awaits?</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {STORY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setStoryType(type.id)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        storyType === type.id
                          ? 'border-indigo-500 bg-indigo-500/15'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="font-medium text-white text-sm">{type.name}</div>
                      <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{type.description}</div>
                      {storyType === type.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Characters */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Select Characters</h3>
                    <p className="text-zinc-500 text-sm mt-1">Choose who will star in your story</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSuggestCast}
                    disabled={isSuggestingCast}
                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-60 flex items-center gap-2 transition-colors"
                  >
                    {isSuggestingCast ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Suggesting...</span>
                      </>
                    ) : (
                      <span>AI Suggest</span>
                    )}
                  </button>
                </div>

                {aiCastSummary && (
                  <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-lg">
                    <p className="text-sm text-indigo-300">{aiCastSummary}</p>
                  </div>
                )}
                {aiCastError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300">{aiCastError}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CHARACTERS.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => toggleCharacter(char.id)}
                      className={`relative p-4 rounded-xl border text-center transition-all ${
                        selectedCharacters.includes(char.id)
                          ? 'border-indigo-500 bg-indigo-500/15'
                          : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto rounded-xl ${char.color} flex items-center justify-center text-2xl mb-2`}>
                        {characterArt[char.id] ? (
                          <img
                            src={characterArt[char.id]}
                            alt={`${char.name}`}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          char.emoji
                        )}
                      </div>
                      <div className="font-medium text-white text-sm">{char.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{char.description}</div>
                      
                      {selectedCharacters.includes(char.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {artError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300">{artError}</p>
                  </div>
                )}
                
                {selectedCharacters.length === 0 && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-lg text-center">
                    <p className="text-amber-300 text-sm">Select at least one character</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Scene Count & AI Options */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">Story Options</h3>
                  <p className="text-zinc-500 text-sm mt-1">Configure your story settings</p>
                </div>
                
                {/* Scene Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Number of Scenes</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        onClick={() => setSceneCount(count)}
                        className={`relative p-3 rounded-lg border text-center transition-all ${
                          sceneCount === count
                            ? 'border-indigo-500 bg-indigo-500/15'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <div className="text-xl font-bold text-white">{count}</div>
                        <div className="text-xs text-zinc-500">scenes</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Idea Section - AI Powered */}
                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-medium text-white">Story Idea</h4>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">AI Powered</span>
                  </div>
                  
                  {/* Quick Story Ideas */}
                  <div className="mb-3">
                    <label className="text-sm text-zinc-400 mb-2 block">Quick ideas:</label>
                    <div className="flex flex-wrap gap-2">
                      {STORY_PROMPTS.slice(0, 4).map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedPromptIndex(idx);
                            setCustomPrompt(prompt);
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            selectedPromptIndex === idx
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/10 text-zinc-400 hover:bg-white/15'
                          }`}
                        >
                          {prompt.slice(0, 30)}...
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Or describe your story:</label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => {
                        setCustomPrompt(e.target.value);
                        setSelectedPromptIndex(-1);
                      }}
                      placeholder="E.g., A story about a brave cat who learns to share with friends..."
                      className="w-full p-3 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      rows={3}
                    />
                  </div>

                  {/* AI Status Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {aiStatusDetail && (
                        <>
                          <span className={`px-2 py-0.5 rounded ${aiStatusDetail.gemini ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                            Gemini {aiStatusDetail.gemini ? '✓' : '✗'}
                          </span>
                          <span className={`px-2 py-0.5 rounded ${aiStatusDetail.openai ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                            OpenAI {aiStatusDetail.openai ? '✓' : '✗'}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleTestAI}
                      disabled={isTestingAI}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-zinc-400 disabled:opacity-60"
                    >
                      {isTestingAI ? 'Checking...' : 'Check AI Status'}
                    </button>
                  </div>
                  
                  {!aiAvailable && aiStatusDetail && (
                    <p className="mt-2 text-xs text-amber-400">⚠️ No AI providers available. Please configure API keys.</p>
                  )}
                </div>

                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 text-sm">Estimated duration:</span>
                    <span className="font-semibold text-white">{sceneCount * 5}s</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Preview / Generating */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="w-16 h-16 border-3 border-indigo-500/30 rounded-full" />
                      <div className="absolute inset-0 w-16 h-16 border-3 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <p className="mt-6 text-lg font-semibold text-white">Creating your story...</p>
                    <p className="text-zinc-500 text-sm mt-1">{generationProgress || "Connecting to AI..."}</p>
                  </div>
                ) : aiError && !generatedStory ? (
                  // Error state - show error and retry option
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                      <X className="w-8 h-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Story Generation Failed</h3>
                    <p className="text-red-400 text-sm text-center max-w-md mb-6">{aiError}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setAiError(null); setStep(3); }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors text-sm"
                      >
                        Edit Prompt
                      </button>
                      <button
                        onClick={handleGenerate}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : generatedStory ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Story Ready
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleGenerate}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs flex items-center gap-1"
                        >
                          <Wand2 className="w-3 h-3" />
                          Regenerate
                        </button>
                        <button
                          onClick={() => { setGeneratedStory(null); setAiError(null); setStep(1); }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-zinc-400"
                        >
                          Start Over
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-xl p-4 border border-indigo-500/30">
                      <h4 className="text-lg font-semibold text-white">{generatedStory.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs capitalize">
                          {generatedStory.theme}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {lastAIProvider === 'gemini' && "Gemini AI"}
                          {lastAIProvider === 'openai' && "OpenAI"}
                          {!lastAIProvider && "AI Generated"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {generatedStory.scenes.length} scenes
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {generatedStory.scenes.map((scene, index) => (
                        <div 
                          key={index} 
                          className="p-3 bg-white/5 border border-white/10 rounded-lg hover:border-indigo-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 bg-indigo-500 text-white rounded flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="font-medium text-white text-sm">{scene.title}</span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 ml-8">{scene.narration}</p>
                          {scene.dialogue && scene.dialogue.length > 0 && (
                            <div className="ml-8 mt-1 flex items-center gap-1 text-xs text-indigo-400">
                              <MessageSquare className="w-3 h-3" />
                              {scene.dialogue.length} dialogue{scene.dialogue.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 flex justify-between bg-[#0d0d14]">
          <button
            onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && selectedCharacters.length === 0}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          
          {step === 3 && !isGenerating && (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              Generate Story
            </button>
          )}
          
          {step === 4 && isGenerating && (
            <button
              disabled
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg opacity-70 cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </button>
          )}
          
          {step === 4 && generatedStory && !isGenerating && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Start Animation
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
