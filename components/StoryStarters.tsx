'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Compass,
  Heart,
  Laugh,
  GraduationCap,
  TreePine,
  Castle,
  Rocket,
  RefreshCw,
  ChevronRight,
  X,
} from 'lucide-react';

export interface StoryStarter {
  id: string;
  category: 'adventure' | 'friendship' | 'fantasy' | 'funny' | 'learning' | 'nature' | 'space' | 'fairytale';
  title: string;
  prompt: string;
  icon: React.ReactNode;
  suggestedCharacters: string[];
  suggestedBackground: string;
}

const STORY_STARTERS: StoryStarter[] = [
  // Adventure
  {
    id: 'treasure-hunt',
    category: 'adventure',
    title: 'The Hidden Treasure',
    prompt: 'One sunny morning, {character1} discovered an old treasure map hidden inside a library book. The map showed a path through the mysterious forest...',
    icon: <Compass className="w-5 h-5" />,
    suggestedCharacters: ['kiara', 'jayden'],
    suggestedBackground: 'forest',
  },
  {
    id: 'lost-pet',
    category: 'adventure',
    title: 'The Lost Pet',
    prompt: '{character1} heard a strange sound coming from behind the bushes. When they looked closer, they found a tiny lost creature who needed help finding its way home...',
    icon: <Compass className="w-5 h-5" />,
    suggestedCharacters: ['kiara', 'luna'],
    suggestedBackground: 'park',
  },
  
  // Friendship
  {
    id: 'new-friend',
    category: 'friendship',
    title: 'Making a New Friend',
    prompt: 'It was {character1}\'s first day at the new playground. Everyone seemed to already have friends. Then {character2} walked up with a big smile and said...',
    icon: <Heart className="w-5 h-5" />,
    suggestedCharacters: ['jayden', 'kiara'],
    suggestedBackground: 'playground',
  },
  {
    id: 'helping-hand',
    category: 'friendship',
    title: 'A Helping Hand',
    prompt: '{character1} noticed that {character2} was having trouble reaching something on the top shelf. Without hesitating, they decided to help...',
    icon: <Heart className="w-5 h-5" />,
    suggestedCharacters: ['kiara', 'jayden'],
    suggestedBackground: 'bedroom',
  },
  
  // Fantasy
  {
    id: 'magic-door',
    category: 'fantasy',
    title: 'The Magic Door',
    prompt: 'Behind the old oak tree, {character1} found a tiny glowing door that had never been there before. When they touched it, the door swung open to reveal...',
    icon: <Sparkles className="w-5 h-5" />,
    suggestedCharacters: ['kiara'],
    suggestedBackground: 'enchanted',
  },
  {
    id: 'talking-animal',
    category: 'fantasy',
    title: 'The Talking Animal',
    prompt: '{character1} couldn\'t believe their ears when {character2} started speaking! "Please don\'t be scared," the animal said. "I need your help with something magical..."',
    icon: <Sparkles className="w-5 h-5" />,
    suggestedCharacters: ['jayden', 'luna'],
    suggestedBackground: 'meadow',
  },
  
  // Funny
  {
    id: 'silly-day',
    category: 'funny',
    title: 'The Silliest Day Ever',
    prompt: 'Everything was going backwards today! {character1} woke up to find their shoes on their hands and breakfast on the ceiling. "This is going to be a very strange day," they giggled...',
    icon: <Laugh className="w-5 h-5" />,
    suggestedCharacters: ['jayden'],
    suggestedBackground: 'bedroom',
  },
  {
    id: 'wrong-costume',
    category: 'funny',
    title: 'The Wrong Costume',
    prompt: '{character1} was so excited for the costume party! But when they arrived, they realized everyone else was dressed as animals, and they were dressed as a superhero...',
    icon: <Laugh className="w-5 h-5" />,
    suggestedCharacters: ['kiara', 'jayden'],
    suggestedBackground: 'park',
  },
  
  // Learning
  {
    id: 'science-experiment',
    category: 'learning',
    title: 'The Science Experiment',
    prompt: '{character1} mixed the blue liquid with the yellow powder. Suddenly, bubbles started rising up! "Wow!" they exclaimed. "I just discovered something amazing..."',
    icon: <GraduationCap className="w-5 h-5" />,
    suggestedCharacters: ['kiara'],
    suggestedBackground: 'beach',
  },
  {
    id: 'counting-stars',
    category: 'learning',
    title: 'Counting the Stars',
    prompt: 'That night, {character1} and {character2} lay on the grass looking up at the sky. "Can you count all the stars?" asked {character1}. "Let\'s try together!"...',
    icon: <GraduationCap className="w-5 h-5" />,
    suggestedCharacters: ['jayden', 'kiara'],
    suggestedBackground: 'night',
  },
  
  // Nature
  {
    id: 'garden-adventure',
    category: 'nature',
    title: 'The Garden Adventure',
    prompt: 'In the garden, {character1} discovered a whole tiny world! There were ladybugs having a picnic and caterpillars playing games...',
    icon: <TreePine className="w-5 h-5" />,
    suggestedCharacters: ['kiara'],
    suggestedBackground: 'meadow',
  },
  {
    id: 'rainy-day',
    category: 'nature',
    title: 'The Rainbow After Rain',
    prompt: 'After the rain stopped, {character1} looked out the window and gasped. The most beautiful rainbow stretched across the sky! "I wonder where it ends..."',
    icon: <TreePine className="w-5 h-5" />,
    suggestedCharacters: ['jayden'],
    suggestedBackground: 'park',
  },
  
  // Space
  {
    id: 'space-journey',
    category: 'space',
    title: 'Journey to the Stars',
    prompt: '3... 2... 1... BLAST OFF! {character1}\'s cardboard rocket ship started to shake and suddenly, they were really flying through space!...',
    icon: <Rocket className="w-5 h-5" />,
    suggestedCharacters: ['jayden'],
    suggestedBackground: 'space',
  },
  {
    id: 'moon-friend',
    category: 'space',
    title: 'Friend on the Moon',
    prompt: 'When {character1} landed on the moon, they didn\'t expect to find anyone there. But behind a big crater, something was waving at them...',
    icon: <Rocket className="w-5 h-5" />,
    suggestedCharacters: ['kiara'],
    suggestedBackground: 'space',
  },
  
  // Fairytale
  {
    id: 'royal-adventure',
    category: 'fairytale',
    title: 'The Little Royal',
    prompt: 'Once upon a time, in a kingdom far away, young {character1} discovered they had a very special power. When they touched flowers, they would start to sing...',
    icon: <Castle className="w-5 h-5" />,
    suggestedCharacters: ['kiara'],
    suggestedBackground: 'castle',
  },
  {
    id: 'dragon-friend',
    category: 'fairytale',
    title: 'The Friendly Dragon',
    prompt: 'Everyone was afraid of the dragon in the mountains. But {character1} wasn\'t scared. They climbed up to meet the dragon and discovered it was just lonely...',
    icon: <Castle className="w-5 h-5" />,
    suggestedCharacters: ['jayden'],
    suggestedBackground: 'mountains',
  },
];

const CATEGORY_INFO: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  adventure: { label: 'Adventure', color: 'from-orange-500 to-amber-500', icon: <Compass className="w-4 h-4" /> },
  friendship: { label: 'Friendship', color: 'from-pink-500 to-rose-500', icon: <Heart className="w-4 h-4" /> },
  fantasy: { label: 'Fantasy', color: 'from-purple-500 to-violet-500', icon: <Sparkles className="w-4 h-4" /> },
  funny: { label: 'Funny', color: 'from-yellow-500 to-orange-500', icon: <Laugh className="w-4 h-4" /> },
  learning: { label: 'Learning', color: 'from-blue-500 to-cyan-500', icon: <GraduationCap className="w-4 h-4" /> },
  nature: { label: 'Nature', color: 'from-green-500 to-emerald-500', icon: <TreePine className="w-4 h-4" /> },
  space: { label: 'Space', color: 'from-indigo-500 to-purple-500', icon: <Rocket className="w-4 h-4" /> },
  fairytale: { label: 'Fairytale', color: 'from-pink-400 to-purple-400', icon: <Castle className="w-4 h-4" /> },
};

interface StoryStartersProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStarter: (starter: StoryStarter) => void;
}

export default function StoryStarters({ isOpen, onClose, onSelectStarter }: StoryStartersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [randomStarter, setRandomStarter] = useState<StoryStarter | null>(null);
  
  const filteredStarters = selectedCategory 
    ? STORY_STARTERS.filter(s => s.category === selectedCategory)
    : STORY_STARTERS;
  
  const getRandomStarter = () => {
    const randomIndex = Math.floor(Math.random() * STORY_STARTERS.length);
    setRandomStarter(STORY_STARTERS[randomIndex]);
  };
  
  const handleSelect = (starter: StoryStarter) => {
    onSelectStarter(starter);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Story Starters</h2>
                  <p className="text-sm text-gray-400">Choose a prompt to inspire your story</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Random Starter Button */}
            <div className="p-4 border-b border-white/10">
              <button
                onClick={getRandomStarter}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl border border-purple-500/30 flex items-center justify-center gap-3 transition-all group"
              >
                <RefreshCw className="w-5 h-5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-purple-300 font-medium">Surprise Me! Get a Random Story Idea</span>
              </button>
              
              {randomStarter && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${CATEGORY_INFO[randomStarter.category].color} text-white`}>
                          {CATEGORY_INFO[randomStarter.category].label}
                        </span>
                        <h3 className="font-semibold text-white">{randomStarter.title}</h3>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{randomStarter.prompt}</p>
                    </div>
                    <button
                      onClick={() => handleSelect(randomStarter)}
                      className="ml-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center gap-2 transition-colors"
                    >
                      Use This
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Category Filter */}
            <div className="p-4 border-b border-white/10">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-white text-gray-900'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  All
                </button>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                      selectedCategory === key
                        ? `bg-gradient-to-r ${info.color} text-white`
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {info.icon}
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Story Starters Grid */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStarters.map(starter => (
                  <motion.button
                    key={starter.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(starter)}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${CATEGORY_INFO[starter.category].color}`}>
                        {starter.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{starter.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{starter.prompt}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Suggested: {starter.suggestedCharacters.join(', ')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { STORY_STARTERS };
