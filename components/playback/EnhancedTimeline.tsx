'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Plus, Trash2, Clock, Edit3, 
  ChevronLeft, ChevronRight, Maximize2,
  Copy, GripVertical
} from 'lucide-react';

interface TimelineScene {
  id: string;
  title: string;
  duration: number;
  background: string;
  narration: string;
  characters: { name: string }[];
}

interface EnhancedTimelineProps {
  scenes: TimelineScene[];
  currentSceneIndex: number;
  isPlaying: boolean;
  onSceneSelect: (index: number) => void;
  onSceneDelete?: (index: number) => void;
  onSceneDurationChange?: (index: number, duration: number) => void;
  onSceneDuplicate?: (index: number) => void;
  onSceneReorder?: (fromIndex: number, toIndex: number) => void;
  onPlayPause: () => void;
  onSeek?: (timeMs: number) => void;
  onPrevScene: () => void;
  onNextScene: () => void;
  onEditScene?: (index: number) => void;
  currentTimeInScene?: number; // 0-1 progress within current scene
}

// Background color mapping for thumbnails
const BG_COLORS: Record<string, string> = {
  meadow: '#90EE90',
  forest: '#228B22',
  beach: '#F4A460',
  night: '#1a1a2e',
  park: '#7CFC00',
  bedroom: '#E6E6FA',
  castle: '#DDA0DD',
  space: '#191970',
  underwater: '#00CED1',
  mountain: '#A0522D',
  city: '#708090',
  farm: '#DAA520',
  playground: '#FF6347',
  library: '#8B4513',
  kitchen: '#FFDAB9',
  garden: '#98FB98',
};

export default function EnhancedTimeline({
  scenes,
  currentSceneIndex,
  isPlaying,
  onSceneSelect,
  onSceneDelete,
  onSceneDurationChange,
  onSceneDuplicate,
  onSceneReorder,
  onPlayPause,
  onSeek,
  onPrevScene,
  onNextScene,
  onEditScene,
  currentTimeInScene = 0,
}: EnhancedTimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [editingDuration, setEditingDuration] = useState<number | null>(null);
  const [durationInput, setDurationInput] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  // Calculate current global time
  const currentGlobalTime = scenes
    .slice(0, currentSceneIndex)
    .reduce((sum, s) => sum + s.duration, 0) + 
    (scenes[currentSceneIndex]?.duration || 0) * currentTimeInScene;

  // Handle scrubber drag
  const handleScrubberMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleScrubberMove(e);
  }, []);

  const handleScrubberMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const progress = x / rect.width;
    const targetTime = progress * totalDuration;
    
    onSeek?.(targetTime);
  }, [totalDuration, onSeek]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleScrubberMove(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleScrubberMove]);

  // Format time as MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle duration edit
  const startEditDuration = (index: number) => {
    setEditingDuration(index);
    setDurationInput((scenes[index].duration / 1000).toString());
  };

  const saveDuration = () => {
    if (editingDuration !== null && onSceneDurationChange) {
      const newDuration = Math.max(1, Math.min(60, parseFloat(durationInput) || 5)) * 1000;
      onSceneDurationChange(editingDuration, newDuration);
    }
    setEditingDuration(null);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header with controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Playback controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevScene}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={onPlayPause}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={onNextScene}
              disabled={currentSceneIndex === scenes.length - 1}
              className="p-2 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time display */}
          <div className="text-white font-mono text-sm">
            <span className="text-purple-400">{formatTime(currentGlobalTime)}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-gray-400">{formatTime(totalDuration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {scenes.length} scenes
          </span>
        </div>
      </div>

      {/* Scrubber bar */}
      <div 
        ref={timelineRef}
        className="relative h-8 bg-gray-800 cursor-pointer mx-4 mt-3 rounded-lg overflow-hidden"
        onMouseDown={handleScrubberMouseDown}
      >
        {/* Scene segments */}
        <div className="absolute inset-0 flex">
          {scenes.map((scene, index) => {
            const widthPercent = (scene.duration / totalDuration) * 100;
            const isCurrentScene = index === currentSceneIndex;
            const bgColor = BG_COLORS[scene.background] || '#6366f1';
            
            return (
              <div
                key={scene.id}
                className={`relative h-full border-r border-gray-700 last:border-r-0 transition-opacity ${
                  isCurrentScene ? 'opacity-100' : 'opacity-60'
                }`}
                style={{ 
                  width: `${widthPercent}%`,
                  backgroundColor: bgColor,
                }}
              >
                {/* Scene number label */}
                {widthPercent > 5 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/80">
                    {index + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Playhead */}
        <div
          ref={scrubberRef}
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg shadow-white/50 pointer-events-none"
          style={{ left: `${(currentGlobalTime / totalDuration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
        </div>
      </div>

      {/* Scene cards */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3">
          {scenes.map((scene, index) => {
            const isSelected = index === currentSceneIndex;
            const bgColor = BG_COLORS[scene.background] || '#6366f1';
            const isDragged = draggedIndex === index;
            
            return (
              <motion.div
                key={scene.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: isDragged ? 0.5 : 1, scale: isDragged ? 0.95 : 1 }}
                draggable={!!onSceneReorder}
                onDragStart={() => setDraggedIndex(index)}
                onDragEnd={() => setDraggedIndex(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index && onSceneReorder) {
                    onSceneReorder(draggedIndex, index);
                    setDraggedIndex(index);
                  }
                }}
                className={`relative flex-shrink-0 w-40 rounded-xl overflow-hidden cursor-pointer transition-all group ${
                  isSelected 
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' 
                    : 'hover:ring-2 hover:ring-white/20'
                } ${isDragged ? 'opacity-50' : ''}`}
                onClick={() => onSceneSelect(index)}
              >
                {/* Drag Handle */}
                {onSceneReorder && (
                  <div className="absolute top-2 left-2 z-10 p-1 bg-black/50 backdrop-blur-sm rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>
                )}
                {/* Thumbnail */}
                <div 
                  className="h-20 relative"
                  style={{ backgroundColor: bgColor }}
                >
                  {/* Scene number badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>

                  {/* Character count */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs text-white">
                    {scene.characters.length} chars
                  </div>

                  {/* Playing indicator */}
                  {isSelected && isPlaying && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  )}

                  {/* Edit button */}
                  {onEditScene && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditScene(index);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/70 transition-all"
                    >
                      <Edit3 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 bg-gray-800">
                  <p className="text-sm font-medium text-white truncate">
                    {scene.title || `Scene ${index + 1}`}
                  </p>
                  
                  {/* Duration editor */}
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    {editingDuration === index ? (
                      <input
                        type="number"
                        value={durationInput}
                        onChange={(e) => setDurationInput(e.target.value)}
                        onBlur={saveDuration}
                        onKeyDown={(e) => e.key === 'Enter' && saveDuration()}
                        className="w-12 px-1 py-0.5 bg-gray-700 text-white text-xs rounded"
                        autoFocus
                        min="1"
                        max="60"
                        step="0.5"
                      />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditDuration(index);
                        }}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        {(scene.duration / 1000).toFixed(1)}s
                      </button>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Duplicate button */}
                  {onSceneDuplicate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSceneDuplicate(index);
                      }}
                      className="p-1.5 bg-blue-500/80 rounded-lg hover:bg-blue-500 transition-all"
                      title="Duplicate scene (Ctrl+D)"
                    >
                      <Copy className="w-3 h-3 text-white" />
                    </button>
                  )}
                  {/* Delete button */}
                  {onSceneDelete && scenes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this scene?')) {
                          onSceneDelete(index);
                        }
                      }}
                      className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-all"
                      title="Delete scene"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Space</kbd> Play/Pause</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">←</kbd><kbd className="px-1.5 py-0.5 bg-gray-800 rounded ml-1">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Ctrl+D</kbd> Duplicate</span>
        <span>Drag to reorder</span>
      </div>
    </div>
  );
}
