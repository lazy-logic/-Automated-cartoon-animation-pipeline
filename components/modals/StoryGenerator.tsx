"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ChevronRight, ChevronLeft, Play } from "lucide-react";
import { STORY_PROMPTS } from "@/lib/ai/ai-story-generator";
import type { AIStoryResponse } from "@/lib/ai/ai-types";

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

// Story types - clean minimal design
const STORY_TYPES = [
  { id: 'adventure', name: 'Adventure', description: 'Exciting journeys' },
  { id: 'friendship', name: 'Friendship', description: 'Tales of friends' },
  { id: 'learning', name: 'Learning', description: 'Educational fun' },
  { id: 'bedtime', name: 'Bedtime', description: 'Calm & dreamy' },
  { id: 'magical', name: 'Magical', description: 'Fantasy stories' },
  { id: 'nature', name: 'Nature', description: 'Animals & nature' },
];

// Characters - with avatars only
const CHARACTERS = [
  { id: 'Kiara', name: 'Kiara', avatar: '👧🏽', desc: 'Musical' },
  { id: 'Jayden', name: 'Jayden', avatar: '👦🏻', desc: 'Sporty' },
  { id: 'Luna', name: 'Luna', avatar: '👧🏼', desc: 'Brave' },
  { id: 'Max', name: 'Max', avatar: '👦🏾', desc: 'Kind' },
  { id: 'Whiskers', name: 'Whiskers', avatar: '🐱', desc: 'Playful' },
  { id: 'Buddy', name: 'Buddy', avatar: '🐕', desc: 'Loyal' },
];

// Backgrounds - minimal
const BACKGROUNDS = [
  { id: 'meadow', name: 'Meadow' },
  { id: 'forest', name: 'Forest' },
  { id: 'beach', name: 'Beach' },
  { id: 'night', name: 'Night' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'park', name: 'Park' },
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

  const stepLabels = ['Genre', 'Cast', 'Details', 'Preview'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#18181b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-800"
      >
        {/* Header */}
        <div className="relative px-4 py-3 border-b border-zinc-800">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-base font-semibold text-white">Create Story</h2>
          
          {/* Progress Steps */}
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4].map((s, i) => {
              const isCompleted = step > s;
              const isCurrent = step === s;
              return (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white' 
                          : isCurrent 
                            ? 'bg-violet-500 text-white' 
                            : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : s}
                    </div>
                    <span className={`text-[10px] ${isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                      {stepLabels[i]}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-px mt-[-12px] ${isCompleted ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[280px] max-h-[400px] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Story Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-zinc-400 text-xs mb-3">Select a genre</p>
                <div className="grid grid-cols-3 gap-2">
                  {STORY_TYPES.map((type) => {
                    const isSelected = storyType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setStoryType(type.id)}
                        className={`relative p-3 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                        }`}
                      >
                        <div className="text-xs font-medium text-white">{type.name}</div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{type.description}</div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Characters */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-zinc-400 text-xs">Select characters</p>
                  <button
                    type="button"
                    onClick={handleSuggestCast}
                    disabled={isSuggestingCast}
                    className="px-2 py-1 rounded text-[10px] bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {isSuggestingCast ? 'Loading...' : 'AI Suggest'}
                  </button>
                </div>

                {aiCastSummary && (
                  <div className="p-2 mb-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                    <p className="text-[11px] text-violet-300">{aiCastSummary}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  {CHARACTERS.map((char) => {
                    const isSelected = selectedCharacters.includes(char.id);
                    return (
                      <button
                        key={char.id}
                        onClick={() => toggleCharacter(char.id)}
                        className={`relative p-2 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {characterArt[char.id] ? (
                            <img src={characterArt[char.id]} alt={char.name} className="w-8 h-8 mx-auto rounded-full object-cover" />
                          ) : (
                            char.avatar
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-white">{char.name}</div>
                        <div className="text-[9px] text-zinc-500">{char.desc}</div>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {selectedCharacters.length === 0 && (
                  <p className="text-amber-400 text-[10px] mt-3 text-center">Select at least one character</p>
                )}
                
                {selectedCharacters.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 text-[10px] text-zinc-500">
                    <span>Selected:</span>
                    {selectedCharacters.map(id => {
                      const char = CHARACTERS.find(c => c.id === id);
                      return char ? <span key={id}>{char.avatar}</span> : null;
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Story Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-zinc-400 text-xs mb-3">Configure your story</p>
                
                {/* Scene Count */}
                <div className="mb-4">
                  <p className="text-[10px] text-zinc-500 mb-2">Number of scenes</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((count) => {
                      const isSelected = sceneCount === count;
                      return (
                        <button
                          key={count}
                          onClick={() => setSceneCount(count)}
                          className={`relative p-2 rounded-lg border text-center transition-all ${
                            isSelected
                              ? 'border-violet-500 bg-violet-500/10'
                              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                          }`}
                        >
                          <div className={`text-base font-semibold ${isSelected ? 'text-violet-400' : 'text-white'}`}>{count}</div>
                          <div className="text-[9px] text-zinc-500">~{count * 5}s</div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Story Prompt */}
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-zinc-500">Story idea</p>
                    {aiStatusDetail && (
                      <div className="flex gap-1">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${aiStatusDetail.gemini ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                          Gemini
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${aiStatusDetail.openai ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600'}`}>
                          OpenAI
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {STORY_PROMPTS.slice(0, 3).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedPromptIndex(idx); setCustomPrompt(prompt); }}
                        className={`px-2 py-1 text-[9px] rounded transition-all ${
                          selectedPromptIndex === idx
                            ? 'bg-violet-500 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {prompt.slice(0, 25)}...
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={customPrompt}
                    onChange={(e) => { setCustomPrompt(e.target.value); setSelectedPromptIndex(-1); }}
                    placeholder="Describe your story..."
                    className="w-full p-2 bg-zinc-800/50 border border-zinc-700 rounded text-xs text-white placeholder-zinc-600 resize-none focus:border-violet-500 focus:outline-none"
                    rows={2}
                  />
                </div>

                {/* Summary */}
                <div className="mt-3 p-2 bg-zinc-800/50 rounded-lg flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">{sceneCount} scenes • ~{sceneCount * 5}s</span>
                  <button
                    onClick={handleTestAI}
                    disabled={isTestingAI}
                    className="text-[9px] text-zinc-500 hover:text-zinc-300"
                  >
                    {isTestingAI ? 'Checking...' : 'Check AI'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Preview */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
                    <p className="text-sm text-white font-medium">Creating story...</p>
                    <p className="text-[10px] text-zinc-500 mt-1">{generationProgress || "Connecting..."}</p>
                  </div>
                ) : aiError && !generatedStory ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-3">
                      <X className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-sm text-white font-medium mb-1">Failed</p>
                    <p className="text-[10px] text-red-400 text-center mb-4">{aiError}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setAiError(null); setStep(3); }} className="px-3 py-1.5 text-[10px] bg-zinc-800 text-white rounded hover:bg-zinc-700">
                        Edit
                      </button>
                      <button onClick={handleGenerate} className="px-3 py-1.5 text-[10px] bg-violet-500 text-white rounded hover:bg-violet-600">
                        Retry
                      </button>
                    </div>
                  </div>
                ) : generatedStory ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-white">{generatedStory.title}</p>
                        <p className="text-[10px] text-zinc-500">{generatedStory.scenes.length} scenes • {generatedStory.theme}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={handleGenerate} className="px-2 py-1 text-[9px] bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700">
                          Regenerate
                        </button>
                        <button onClick={() => { setGeneratedStory(null); setStep(1); }} className="px-2 py-1 text-[9px] bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700">
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                      {generatedStory.scenes.map((scene, index) => (
                        <div key={index} className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-violet-500 text-white rounded text-[10px] flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <span className="text-[11px] font-medium text-white">{scene.title}</span>
                          </div>
                          <p className="text-[9px] text-zinc-500 mt-1 ml-7 line-clamp-1">{scene.narration}</p>
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
        <div className="border-t border-zinc-800 px-4 py-3 flex justify-between">
          <button
            onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {step < 3 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 2 && selectedCharacters.length === 0}
              className="px-4 py-1.5 bg-violet-500 text-white text-xs rounded hover:bg-violet-600 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          
          {step === 3 && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-1.5 bg-violet-500 text-white text-xs rounded hover:bg-violet-600 transition-colors flex items-center gap-1 disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          )}
          
          {step === 4 && isGenerating && (
            <button disabled className="px-4 py-1.5 bg-violet-500/50 text-white text-xs rounded flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating...
            </button>
          )}
          
          {step === 4 && generatedStory && !isGenerating && (
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Start
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
