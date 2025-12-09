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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Template Gallery</h2>
              <p className="text-sm text-gray-500">Choose pre-made scenes or add characters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layout className="w-4 h-4 inline-block mr-2" />
            Scene Templates
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'characters'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
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
              <div className="w-48 border-r border-gray-100 p-4 space-y-1">
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTemplateCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      templateCategory === cat.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'border-purple-500 shadow-lg shadow-purple-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {/* Preview */}
                      <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-purple-300" />
                        </div>
                        
                        {/* Character count badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                          {template.characters.length} characters
                        </div>

                        {/* Category badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-500 rounded-full text-xs text-white capitalize">
                          {template.category}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800">{template.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
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
              <div className="w-48 border-r border-gray-100 p-4 space-y-1">
                {SPRITE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSpriteCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      spriteCategory === cat.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Sprites Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredSprites.map((sprite) => (
                    <div
                      key={sprite.id}
                      className={`group relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        selectedSprite?.id === sprite.id
                          ? 'border-purple-500 shadow-lg shadow-purple-100'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedSprite(sprite)}
                    >
                      {/* Character Preview */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
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
                      <div className="p-3">
                        <h3 className="font-medium text-gray-800 text-sm">{sprite.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {sprite.description}
                        </p>
                        
                        {/* Poses & Expressions */}
                        <div className="flex gap-2 mt-2 text-xs text-gray-400">
                          <span>{sprite.poses.length} poses</span>
                          <span>•</span>
                          <span>{sprite.expressions.length} expressions</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCharacter(sprite);
                          }}
                          className="w-full mt-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
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
            <div className="w-72 border-l border-gray-100 p-4 bg-gray-50">
              {selectedTemplate && activeTab === 'templates' && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedTemplate.description}</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-medium">{(selectedTemplate.duration / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Characters</span>
                      <span className="font-medium">{selectedTemplate.characters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium capitalize">{selectedTemplate.category}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Suggested Narration:</p>
                    <p className="text-sm text-gray-700 italic">"{selectedTemplate.suggestedNarration}"</p>
                  </div>

                  <button
                    onClick={() => handleAddTemplate(selectedTemplate)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add This Scene
                  </button>
                </div>
              )}

              {selectedSprite && activeTab === 'characters' && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">{selectedSprite.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedSprite.description}</p>
                  
                  {/* Color Palette */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      {Object.entries(selectedSprite.colors).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-8 h-8 rounded-lg border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Poses */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Available Poses</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSprite.poses.map((pose) => (
                        <span
                          key={pose.id}
                          className="px-2 py-1 bg-gray-200 rounded text-xs"
                        >
                          {pose.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expressions */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Expressions</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSprite.expressions.map((expr) => (
                        <span
                          key={expr.id}
                          className="px-2 py-1 bg-gray-200 rounded text-xs"
                        >
                          {expr.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Animations</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSprite.animations.map((anim) => (
                        <span
                          key={anim.id}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                        >
                          {anim.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCharacter(selectedSprite)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
