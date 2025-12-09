'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Grid3X3,
  List,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Maximize2,
  Image,
  X,
} from 'lucide-react';
import type { EditableScene } from './InteractiveSceneEditor';

interface StoryboardViewProps {
  scenes: EditableScene[];
  currentSceneIndex: number;
  onSceneSelect: (index: number) => void;
  onSceneReorder: (scenes: EditableScene[]) => void;
  onSceneDuplicate: (index: number) => void;
  onSceneDelete: (index: number) => void;
  onSceneEdit: (index: number) => void;
  onAddScene: () => void;
  onPlayFromScene: (index: number) => void;
}

type ViewMode = 'grid' | 'list' | 'filmstrip';

export default function StoryboardView({
  scenes,
  currentSceneIndex,
  onSceneSelect,
  onSceneReorder,
  onSceneDuplicate,
  onSceneDelete,
  onSceneEdit,
  onAddScene,
  onPlayFromScene,
}: StoryboardViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedScene, setExpandedScene] = useState<number | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBackgroundColor = (bg: string) => {
    const colors: Record<string, string> = {
      meadow: '#90EE90',
      forest: '#228B22',
      beach: '#F4A460',
      night: '#1a1a2e',
      park: '#7CFC00',
      bedroom: '#E6E6FA',
      castle: '#DDA0DD',
      space: '#0a0a20',
    };
    return colors[bg] || '#666';
  };

  const renderSceneCard = (scene: EditableScene, index: number, isDragging: boolean = false) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group rounded-xl overflow-hidden transition-all ${
        currentSceneIndex === index
          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
          : 'hover:ring-2 hover:ring-white/30'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Thumbnail */}
      <div
        className="aspect-video relative cursor-pointer"
        style={{ backgroundColor: getBackgroundColor(scene.background) }}
        onClick={() => onSceneSelect(index)}
      >
        {/* Scene number badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-full text-xs text-white font-medium">
          {index + 1}
        </div>

        {/* Duration badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-xs text-white flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(scene.duration)}
        </div>

        {/* Character indicators */}
        <div className="absolute bottom-2 left-2 flex -space-x-2">
          {scene.characters.slice(0, 3).map((char, i) => (
            <div
              key={char.id}
              className="w-6 h-6 rounded-full bg-white/90 border-2 border-white flex items-center justify-center text-xs"
              title={char.name}
            >
              {char.name.charAt(0)}
            </div>
          ))}
          {scene.characters.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center text-xs text-white">
              +{scene.characters.length - 3}
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayFromScene(index);
              }}
              className="p-2 bg-purple-500 hover:bg-purple-600 rounded-full text-white transition-colors"
              title="Play from here"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSceneEdit(index);
              }}
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
              title="Edit scene"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scene info */}
      <div className="p-3 bg-gray-800">
        <h4 className="text-white font-medium text-sm truncate">{scene.title}</h4>
        <p className="text-gray-400 text-xs mt-1 line-clamp-2">{scene.narration}</p>
      </div>

      {/* Action buttons */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSceneDuplicate(index);
          }}
          className="p-1.5 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg"
          title="Duplicate"
        >
          <Copy className="w-3 h-3 text-white" />
        </button>
        {scenes.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSceneDelete(index);
            }}
            className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full shadow-lg"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    </motion.div>
  );

  const renderListItem = (scene: EditableScene, index: number) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer ${
        currentSceneIndex === index
          ? 'bg-purple-500/20 border border-purple-500/50'
          : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
      }`}
      onClick={() => onSceneSelect(index)}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-gray-500 hover:text-gray-300">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Scene number */}
      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold">
        {index + 1}
      </div>

      {/* Thumbnail */}
      <div
        className="w-24 h-14 rounded-lg flex-shrink-0"
        style={{ backgroundColor: getBackgroundColor(scene.background) }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{scene.title}</h4>
        <p className="text-gray-400 text-sm truncate">{scene.narration}</p>
      </div>

      {/* Duration */}
      <div className="text-gray-400 text-sm flex items-center gap-1">
        <Clock className="w-4 h-4" />
        {formatDuration(scene.duration)}
      </div>

      {/* Characters */}
      <div className="flex -space-x-1">
        {scene.characters.slice(0, 3).map((char) => (
          <div
            key={char.id}
            className="w-6 h-6 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center text-xs text-white"
          >
            {char.name.charAt(0)}
          </div>
        ))}
      </div>

      {/* Expand/collapse */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpandedScene(expandedScene === index ? null : index);
        }}
        className="p-1 hover:bg-gray-600 rounded"
      >
        {expandedScene === index ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlayFromScene(index);
          }}
          className="p-1.5 hover:bg-purple-500/20 rounded-lg text-purple-400"
          title="Play"
        >
          <Play className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSceneEdit(index);
          }}
          className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400"
          title="Edit"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSceneDuplicate(index);
          }}
          className="p-1.5 hover:bg-green-500/20 rounded-lg text-green-400"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </button>
        {scenes.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSceneDelete(index);
            }}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Storyboard</h2>
          <span className="text-gray-400 text-sm">
            {scenes.length} scenes • {formatDuration(totalDuration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Add scene */}
          <button
            onClick={onAddScene}
            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Scene
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <Reorder.Group
            axis="x"
            values={scenes}
            onReorder={onSceneReorder}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {scenes.map((scene, index) => (
              <Reorder.Item key={scene.id} value={scene}>
                {renderSceneCard(scene, index)}
              </Reorder.Item>
            ))}
            
            {/* Add scene card */}
            <motion.button
              onClick={onAddScene}
              className="aspect-video rounded-xl border-2 border-dashed border-gray-600 hover:border-purple-500 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm">Add Scene</span>
            </motion.button>
          </Reorder.Group>
        ) : (
          <Reorder.Group
            axis="y"
            values={scenes}
            onReorder={onSceneReorder}
            className="space-y-2"
          >
            {scenes.map((scene, index) => (
              <Reorder.Item key={scene.id} value={scene}>
                {renderListItem(scene, index)}
                
                {/* Expanded details */}
                <AnimatePresence>
                  {expandedScene === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-12 mt-2 p-4 bg-gray-800/50 rounded-xl"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-gray-400 text-xs uppercase mb-1">Narration</h5>
                          <p className="text-white text-sm">{scene.narration}</p>
                        </div>
                        <div>
                          <h5 className="text-gray-400 text-xs uppercase mb-1">Characters</h5>
                          <div className="flex flex-wrap gap-2">
                            {scene.characters.map((char) => (
                              <span
                                key={char.id}
                                className="px-2 py-1 bg-gray-700 rounded text-xs text-white"
                              >
                                {char.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-gray-400 text-xs uppercase mb-1">Background</h5>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: getBackgroundColor(scene.background) }}
                            />
                            <span className="text-white text-sm capitalize">{scene.background}</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-gray-400 text-xs uppercase mb-1">Camera</h5>
                          <span className="text-white text-sm">
                            Zoom: {(scene.cameraZoom ?? 1).toFixed(1)}x, Pan: ({scene.cameraPanX ?? 0}, {scene.cameraPanY ?? 0})
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Storyboard Overview</h2>
              <button
                onClick={() => setShowFullscreen(false)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 overflow-y-auto max-h-[calc(100vh-120px)]">
              {scenes.map((scene, index) => renderSceneCard(scene, index))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
