'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/lib/store';
import { 
  SCENE_TEMPLATES, 
  CHARACTER_SPRITES, 
  createSceneFromTemplate,
  createCharacterFromSprite,
  type SceneTemplate,
  type CharacterSprite,
} from '@/lib/sprites';
import {
  Layout,
  Users,
  Sparkles,
  TreePine,
  Home,
  Wand2,
  GraduationCap,
  X,
  Plus,
  Check,
} from 'lucide-react';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'templates' | 'characters';
type TemplateCategory = SceneTemplate['category'] | 'all';
type SpriteCategory = CharacterSprite['category'] | 'all';

const TEMPLATE_CATEGORIES: { id: TemplateCategory; name: string; icon: React.ReactNode }[] = [
  { id: 'all', name: 'All', icon: <Layout className="w-4 h-4" /> },
  { id: 'adventure', name: 'Adventure', icon: <TreePine className="w-4 h-4" /> },
  { id: 'fantasy', name: 'Fantasy', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'everyday', name: 'Everyday', icon: <Home className="w-4 h-4" /> },
  { id: 'educational', name: 'Educational', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'nature', name: 'Nature', icon: <TreePine className="w-4 h-4" /> },
];

const SPRITE_CATEGORIES: { id: SpriteCategory; name: string }[] = [
  { id: 'all', name: 'All Characters' },
  { id: 'child', name: 'Children' },
  { id: 'animal', name: 'Animals' },
  { id: 'robot', name: 'Robots' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'adult', name: 'Adults' },
];

export default function TemplateGallery({ isOpen, onClose }: TemplateGalleryProps) {
  const { addSceneFromData, editor, addCharacterToScene } = useStudioStore();
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>('all');
  const [spriteCategory, setSpriteCategory] = useState<SpriteCategory>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<SceneTemplate | null>(null);
  const [selectedSprite, setSelectedSprite] = useState<CharacterSprite | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = templateCategory === 'all' 
    ? SCENE_TEMPLATES 
    : SCENE_TEMPLATES.filter(t => t.category === templateCategory);

  const filteredSprites = spriteCategory === 'all'
    ? CHARACTER_SPRITES
    : CHARACTER_SPRITES.filter(s => s.category === spriteCategory);

  const handleAddTemplate = (template: SceneTemplate) => {
    const scene = createSceneFromTemplate(template);
    addSceneFromData(scene);
    onClose();
  };

  const handleAddCharacter = (sprite: CharacterSprite) => {
    if (!editor.selectedSceneId) {
      alert('Please select a scene first');
      return;
    }
    const character = createCharacterFromSprite(sprite, {
      x: 50,
      y: 65,
      scale: 1,
    });
    addCharacterToScene(editor.selectedSceneId, character);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[75vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Template Gallery</h2>
              <p className="text-xs text-gray-400">Choose pre-made scenes or add characters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Layout className="w-4 h-4 inline-block mr-2" />
            Scene Templates
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'characters'
                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/10'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Character Sprites
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'templates' ? (
            <>
              {/* Template Categories Sidebar */}
              <div className="w-44 border-r border-gray-700 p-3 space-y-1">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTemplateCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      templateCategory === cat.id
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {/* Preview */}
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-purple-500/50" />
                        </div>
                        
                        {/* Character count badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-xs text-white">
                          {template.characters.length} chars
                        </div>

                        {/* Category badge */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500 rounded-full text-xs text-white capitalize">
                          {template.category}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2.5 bg-gray-800">
                        <h3 className="font-medium text-white text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-gray-500">
                            {(template.duration / 1000).toFixed(1)}s
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTemplate(template);
                            }}
                            className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add Scene
                          </button>
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedTemplate?.id === template.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No templates in this category</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Sprite Categories Sidebar */}
              <div className="w-44 border-r border-gray-700 p-3 space-y-1">
                {SPRITE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSpriteCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      spriteCategory === cat.id
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sprites Grid */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {filteredSprites.map((sprite) => (
                    <div
                      key={sprite.id}
                      className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all ${
                        selectedSprite?.id === sprite.id
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedSprite(sprite)}
                    >
                      {/* Character Preview */}
                      <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                        {/* SVG File Preview */}
                        <img
                          src={sprite.svgFile}
                          alt={sprite.name}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                        />

                        {/* Category badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800/70 rounded-full text-xs text-white capitalize">
                          {sprite.category}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2.5 bg-gray-800">
                        <h3 className="font-medium text-white text-sm">{sprite.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {sprite.description}
                        </p>
                        
                        {/* Poses & Expressions */}
                        <div className="flex gap-2 mt-1.5 text-xs text-gray-500">
                          <span>{sprite.poses.length} poses</span>
                          <span>•</span>
                          <span>{sprite.expressions.length} expr</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCharacter(sprite);
                          }}
                          className="w-full mt-2 flex items-center justify-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add to Scene
                        </button>
                      </div>

                      {/* Selected indicator */}
                      {selectedSprite?.id === sprite.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredSprites.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No characters in this category</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Detail Panel */}
          {(selectedTemplate || selectedSprite) && (
            <div className="w-64 border-l border-gray-700 p-3 bg-gray-800/50">
              {selectedTemplate && activeTab === 'templates' && (
                <div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{selectedTemplate.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{selectedTemplate.description}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium text-white">{(selectedTemplate.duration / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Characters</span>
                      <span className="font-medium text-white">{selectedTemplate.characters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium capitalize text-white">{selectedTemplate.category}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Suggested Narration:</p>
                    <p className="text-xs text-gray-300 italic">" {selectedTemplate.suggestedNarration}"</p>
                  </div>

                  <button
                    onClick={() => handleAddTemplate(selectedTemplate)}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add This Scene
                  </button>
                </div>
              )}

              {selectedSprite && activeTab === 'characters' && (
                <div>
                  <h3 className="font-bold text-white text-sm mb-1.5">{selectedSprite.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{selectedSprite.description}</p>
                  
                  {/* Color Palette */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Color Palette</p>
                    <div className="flex gap-1.5">
                      {Object.entries(selectedSprite.colors).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-6 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Poses */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Available Poses</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSprite.poses.map((pose) => (
                        <span
                          key={pose.id}
                          className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          {pose.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expressions */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Expressions</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSprite.expressions.map((expr) => (
                        <span
                          key={expr.id}
                          className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                        >
                          {expr.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1.5">Animations</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSprite.animations.map((anim) => (
                        <span
                          key={anim.id}
                          className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs"
                        >
                          {anim.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCharacter(selectedSprite)}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Current Scene
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
