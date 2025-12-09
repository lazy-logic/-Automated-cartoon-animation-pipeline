'use client';

import React from 'react';
import { useStudioStore } from '@/lib/utils/store';
import { CHARACTER_TEMPLATES, BACKGROUND_TEMPLATES, SVG_BACKGROUNDS } from '@/lib/utils/templates';
import type { Expression, Scene } from '@/lib/utils/types';
import {
  Plus,
  Trash2,
  Copy,
  Users,
  Image,
  Type,
  MessageSquare,
  Clock,
  Sparkles,
  ChevronDown,
  Move,
  FlipHorizontal,
  Smile,
} from 'lucide-react';

const EXPRESSIONS: Expression[] = ['neutral', 'happy', 'sad', 'surprised', 'angry', 'talking'];

interface SceneEditorProps {
  scene: Scene;
  onClose?: () => void;
}

export default function SceneEditor({ scene, onClose }: SceneEditorProps) {
  const {
    updateScene,
    addCharacter,
    updateCharacter,
    removeCharacter,
    duplicateScene,
    deleteScene,
    selectCharacter,
    editor,
  } = useStudioStore();

  const selectedCharacter = scene.characters.find(
    (c) => c.id === editor.selectedCharacterId
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Scene Editor
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => duplicateScene(scene.id)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Duplicate scene"
            >
              <Copy className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this scene?')) {
                  deleteScene(scene.id);
                }
              }}
              className="p-2 bg-white/20 hover:bg-red-400/50 rounded-lg transition-colors"
              title="Delete scene"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Scene Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Type className="w-4 h-4" />
            Scene Title
          </label>
          <input
            type="text"
            value={scene.title}
            onChange={(e) => updateScene(scene.id, { title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter scene title..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            Description
          </label>
          <textarea
            value={scene.description}
            onChange={(e) => updateScene(scene.id, { description: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            rows={2}
            placeholder="What happens in this scene..."
          />
        </div>

        {/* Narration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            Narration Text
          </label>
          <textarea
            value={scene.narration}
            onChange={(e) => updateScene(scene.id, { narration: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            rows={3}
            placeholder="Text to be spoken during this scene..."
          />
        </div>

        {/* Background Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Image className="w-4 h-4" />
            Background
          </label>
          
          {/* Generated Backgrounds */}
          <p className="text-xs text-gray-500 mb-2">Generated Backgrounds</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {BACKGROUND_TEMPLATES.map((bg) => (
              <button
                key={bg.id}
                onClick={() => updateScene(scene.id, { backgroundId: bg.id })}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  scene.backgroundId === bg.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg mb-2"
                  style={{
                    background: bg.layers[0]?.gradient || bg.layers[0]?.color || '#ccc',
                  }}
                />
                <span className="text-sm font-medium">{bg.displayName}</span>
                <span className="text-xs text-gray-500 block">{bg.category}</span>
              </button>
            ))}
          </div>

          {/* SVG Backgrounds */}
          <p className="text-xs text-gray-500 mb-2">SVG Cartoon Scenes</p>
          <div className="grid grid-cols-3 gap-2">
            {SVG_BACKGROUNDS.map((svg) => (
              <button
                key={svg.id}
                onClick={() => updateScene(scene.id, { backgroundId: svg.id })}
                className={`p-2 rounded-xl border-2 transition-all ${
                  scene.backgroundId === svg.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-12 rounded-lg mb-1 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img 
                    src={svg.file} 
                    alt={svg.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-medium block truncate">{svg.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            Duration: {(scene.duration / 1000).toFixed(1)}s
          </label>
          <input
            type="range"
            min={1000}
            max={15000}
            step={500}
            value={scene.duration}
            onChange={(e) => updateScene(scene.id, { duration: Number(e.target.value) })}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Characters Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              Characters ({scene.characters.length})
            </label>
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {CHARACTER_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => addCharacter(scene.id, template.id)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: template.primaryColor }}
                    />
                    {template.displayName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character List */}
          <div className="space-y-2">
            {scene.characters.map((character) => {
              const template = CHARACTER_TEMPLATES.find(
                (t) => t.id === character.templateId
              );
              const isSelected = character.id === editor.selectedCharacterId;

              return (
                <div
                  key={character.id}
                  onClick={() => selectCharacter(character.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: template?.primaryColor }}
                      />
                      <input
                        type="text"
                        value={character.name}
                        onChange={(e) =>
                          updateCharacter(scene.id, character.id, {
                            name: e.target.value,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-24"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCharacter(scene.id, character.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {isSelected && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                      {/* Position */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Move className="w-3 h-3" /> X: {character.x}%
                          </label>
                          <input
                            type="range"
                            min={5}
                            max={95}
                            value={character.x}
                            onChange={(e) =>
                              updateCharacter(scene.id, character.id, {
                                x: Number(e.target.value),
                              })
                            }
                            className="w-full accent-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Y: {character.y}%</label>
                          <input
                            type="range"
                            min={40}
                            max={90}
                            value={character.y}
                            onChange={(e) =>
                              updateCharacter(scene.id, character.id, {
                                y: Number(e.target.value),
                              })
                            }
                            className="w-full accent-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Scale */}
                      <div>
                        <label className="text-xs text-gray-500">
                          Scale: {character.scale.toFixed(1)}x
                        </label>
                        <input
                          type="range"
                          min={0.5}
                          max={2}
                          step={0.1}
                          value={character.scale}
                          onChange={(e) =>
                            updateCharacter(scene.id, character.id, {
                              scale: Number(e.target.value),
                            })
                          }
                          className="w-full accent-indigo-500"
                        />
                      </div>

                      {/* Flip */}
                      <button
                        onClick={() =>
                          updateCharacter(scene.id, character.id, {
                            flipX: !character.flipX,
                          })
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          character.flipX
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        Flip Horizontal
                      </button>

                      {/* Expression */}
                      <div>
                        <label className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                          <Smile className="w-3 h-3" /> Expression
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {EXPRESSIONS.map((expr) => (
                            <button
                              key={expr}
                              onClick={() =>
                                updateCharacter(scene.id, character.id, {
                                  expression: expr,
                                })
                              }
                              className={`px-2 py-1 rounded-lg text-xs capitalize transition-colors ${
                                character.expression === expr
                                  ? 'bg-indigo-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {expr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {scene.characters.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No characters yet</p>
                <p className="text-xs">Click "Add" to add characters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
