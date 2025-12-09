'use client';

import React, { useState } from 'react';
import AnimatedCharacterComponent from '@/components/shared/AnimatedCharacter';
import AnimationStage from '@/components/shared/AnimationStage';
import { ANIMATED_CHARACTERS } from '@/lib/utils/characters';
import { 
  Play, 
  Pause, 
  User, 
  Sparkles, 
  ArrowLeft,
  Plus,
  Trash2,
  FlipHorizontal,
  Move
} from 'lucide-react';
import Link from 'next/link';

type AnimationType = 'idle' | 'walk' | 'wave' | 'talk' | 'jump' | 'sit';

interface StageCharacter {
  id: string;
  characterId: string;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
  animation: AnimationType;
}

export default function DemoPage() {
  const [selectedCharacter, setSelectedCharacter] = useState(ANIMATED_CHARACTERS[0]);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('idle');
  const [isPlaying, setIsPlaying] = useState(true);
  const [backgroundId, setBackgroundId] = useState('forest');
  
  // Stage characters
  const [stageCharacters, setStageCharacters] = useState<StageCharacter[]>([
    {
      id: '1',
      characterId: 'char-girl',
      x: 30,
      y: 75,
      scale: 0.8,
      flipX: false,
      animation: 'idle',
    },
    {
      id: '2',
      characterId: 'char-boy',
      x: 70,
      y: 75,
      scale: 0.8,
      flipX: true,
      animation: 'wave',
    },
  ]);
  
  const [selectedStageCharId, setSelectedStageCharId] = useState<string | null>(null);

  const animations: AnimationType[] = ['idle', 'walk', 'wave', 'talk', 'jump', 'sit'];
  const backgrounds = ['forest', 'park', 'meadow', 'beach', 'night', 'classroom', 'bedroom', 'city'];

  const addCharacterToStage = (characterId: string) => {
    const newChar: StageCharacter = {
      id: Date.now().toString(),
      characterId,
      x: 50,
      y: 75,
      scale: 0.7,
      flipX: false,
      animation: 'idle',
    };
    setStageCharacters([...stageCharacters, newChar]);
    setSelectedStageCharId(newChar.id);
  };

  const removeCharacterFromStage = (id: string) => {
    setStageCharacters(stageCharacters.filter(c => c.id !== id));
    if (selectedStageCharId === id) {
      setSelectedStageCharId(null);
    }
  };

  const updateStageCharacter = (id: string, updates: Partial<StageCharacter>) => {
    setStageCharacters(stageCharacters.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const selectedStageChar = stageCharacters.find(c => c.id === selectedStageCharId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Studio</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Animation Demo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isPlaying 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Playing' : 'Paused'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Animation Stage */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Animation Stage</h2>
              </div>
              <div className="aspect-video">
                <AnimationStage
                  backgroundId={backgroundId}
                  characters={stageCharacters}
                  isPlaying={isPlaying}
                  showControls={true}
                  onCharacterClick={setSelectedStageCharId}
                  selectedCharacterId={selectedStageCharId}
                />
              </div>
            </div>

            {/* Background Selection */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Background</h3>
              <div className="flex flex-wrap gap-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg}
                    onClick={() => setBackgroundId(bg)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      backgroundId === bg
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Character Library */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-500" />
                Character Library
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {ANIMATED_CHARACTERS.map((char) => (
                  <div
                    key={char.id}
                    className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all group"
                    onClick={() => setSelectedCharacter(char)}
                  >
                    <div className="flex justify-center mb-2">
                      <AnimatedCharacterComponent
                        character={char}
                        animation="idle"
                        scale={0.4}
                        showName={false}
                      />
                    </div>
                    <p className="text-center text-sm font-medium text-gray-700">{char.name}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addCharacterToStage(char.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-purple-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Character Controls */}
            {selectedStageChar && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    {ANIMATED_CHARACTERS.find(c => c.id === selectedStageChar.characterId)?.name}
                  </h3>
                  <button
                    onClick={() => removeCharacterFromStage(selectedStageChar.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Animation Selection */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Animation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {animations.map((anim) => (
                      <button
                        key={anim}
                        onClick={() => updateStageCharacter(selectedStageChar.id, { animation: anim })}
                        className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                          selectedStageChar.animation === anim
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {anim}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position Controls */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500">X Position</label>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={selectedStageChar.x}
                        onChange={(e) => updateStageCharacter(selectedStageChar.id, { x: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Y Position</label>
                      <input
                        type="range"
                        min="50"
                        max="90"
                        value={selectedStageChar.y}
                        onChange={(e) => updateStageCharacter(selectedStageChar.id, { y: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Scale Control */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Scale</label>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.1"
                    value={selectedStageChar.scale}
                    onChange={(e) => updateStageCharacter(selectedStageChar.id, { scale: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {(selectedStageChar.scale * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Flip Control */}
                <button
                  onClick={() => updateStageCharacter(selectedStageChar.id, { flipX: !selectedStageChar.flipX })}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    selectedStageChar.flipX
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  Flip Horizontal
                </button>
              </div>
            )}

            {/* Single Character Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Character Preview</h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 flex justify-center">
                <AnimatedCharacterComponent
                  character={selectedCharacter}
                  animation={currentAnimation}
                  scale={0.8}
                />
              </div>
              
              {/* Animation Buttons */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {animations.map((anim) => (
                  <button
                    key={anim}
                    onClick={() => setCurrentAnimation(anim)}
                    className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                      currentAnimation === anim
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {anim}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
