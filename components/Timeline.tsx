'use client';

import React from 'react';
import { useStudioStore } from '@/lib/store';
import { Plus, GripVertical, Play, Trash2 } from 'lucide-react';

export default function Timeline() {
  const {
    project,
    addScene,
    selectScene,
    deleteScene,
    editor,
    playback,
  } = useStudioStore();

  const scenes = project.scenes;
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">Timeline</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {scenes.length} scenes • {(totalDuration / 1000).toFixed(1)}s total
          </span>
          <button
            onClick={addScene}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Scene
          </button>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {scenes.map((scene, index) => {
            const isSelected = scene.id === editor.selectedSceneId;
            const isPlaying = playback.isPlaying && playback.currentSceneIndex === index;
            const widthPercent = Math.max(120, (scene.duration / 1000) * 30);

            return (
              <div
                key={scene.id}
                onClick={() => selectScene(scene.id)}
                className={`relative flex-shrink-0 rounded-xl border-2 cursor-pointer transition-all overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                    : isPlaying
                    ? 'border-green-500 shadow-lg shadow-green-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ width: widthPercent }}
              >
                {/* Scene Preview */}
                <div
                  className="h-16 relative"
                  style={{
                    background: `linear-gradient(135deg, ${
                      isPlaying ? '#22c55e' : isSelected ? '#6366f1' : '#e5e7eb'
                    } 0%, ${
                      isPlaying ? '#16a34a' : isSelected ? '#4f46e5' : '#d1d5db'
                    } 100%)`,
                  }}
                >
                  {/* Scene number */}
                  <div className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  {/* Playing indicator */}
                  {isPlaying && (
                    <div className="absolute top-2 right-2">
                      <Play className="w-4 h-4 text-white fill-white animate-pulse" />
                    </div>
                  )}

                  {/* Character count */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/30 rounded text-xs text-white">
                    {scene.characters.length} chars
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/30 rounded text-xs text-white">
                    {(scene.duration / 1000).toFixed(1)}s
                  </div>
                </div>

                {/* Scene Info */}
                <div className="p-2 bg-white">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {scene.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {scene.description || 'No description'}
                  </p>
                </div>

                {/* Delete button (shown on hover) */}
                {scenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this scene?')) {
                        deleteScene(scene.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Scene Button */}
          <button
            onClick={addScene}
            className="flex-shrink-0 w-24 h-[104px] rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-500"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add</span>
          </button>
        </div>

        {/* Progress Bar */}
        {playback.isPlaying && (
          <div className="mt-4">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-100"
                style={{
                  width: `${((playback.currentSceneIndex + 1) / scenes.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
