'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Plus,
  Trash2,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import {
  CameraKeyframe,
  createKeyframe,
  getCameraAtTime,
  createCameraAnimation,
  CAMERA_ANIMATION_PRESETS,
  EASING_FUNCTIONS,
  EasingType,
} from '@/lib/camera-keyframes';

interface CameraKeyframeEditorProps {
  keyframes: CameraKeyframe[];
  duration: number; // Scene duration in ms
  currentTime: number;
  onKeyframesChange: (keyframes: CameraKeyframe[]) => void;
  onSeek: (time: number) => void;
  onPreview?: (cameraState: { zoom: number; panX: number; panY: number; rotation: number }) => void;
}

const PRESET_OPTIONS = Object.keys(CAMERA_ANIMATION_PRESETS) as (keyof typeof CAMERA_ANIMATION_PRESETS)[];

export default function CameraKeyframeEditor({
  keyframes,
  duration,
  currentTime,
  onKeyframesChange,
  onSeek,
  onPreview,
}: CameraKeyframeEditorProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedKeyframeIndex, setSelectedKeyframeIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pixelsPerMs = 0.15;
  const timelineWidth = duration * pixelsPerMs;

  // Sort keyframes by time
  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

  // Get current camera state from keyframes
  const getCurrentCameraState = useCallback((time: number) => {
    if (sortedKeyframes.length === 0) {
      return { zoom: 1, panX: 0, panY: 0, rotation: 0 };
    }
    // Create a temporary animation to use getCameraAtTime
    const animation = createCameraAnimation('temp', sortedKeyframes, duration, false);
    return getCameraAtTime(animation, time);
  }, [sortedKeyframes, duration]);

  // Update preview when time changes
  useEffect(() => {
    if (onPreview) {
      const state = getCurrentCameraState(currentTime);
      onPreview(state);
    }
  }, [currentTime, getCurrentCameraState, onPreview]);

  // Playback
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        const next = currentTime + 50;
        if (next >= duration) {
          setIsPlaying(false);
          onSeek(0);
        } else {
          onSeek(next);
        }
      }, 50);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, duration, onSeek]);

  // Add keyframe at current time
  const addKeyframe = () => {
    const currentState = getCurrentCameraState(currentTime);
    const newKeyframe = createKeyframe(
      currentTime,
      currentState.zoom,
      currentState.panX,
      currentState.panY,
      currentState.rotation,
      'ease-in-out'
    );
    onKeyframesChange([...keyframes, newKeyframe]);
  };

  // Update keyframe
  const updateKeyframe = (index: number, updates: Partial<CameraKeyframe>) => {
    const newKeyframes = [...keyframes];
    newKeyframes[index] = { ...newKeyframes[index], ...updates };
    onKeyframesChange(newKeyframes);
  };

  // Delete keyframe
  const deleteKeyframe = (index: number) => {
    onKeyframesChange(keyframes.filter((_, i) => i !== index));
    if (selectedKeyframeIndex === index) {
      setSelectedKeyframeIndex(null);
    }
  };

  // Apply preset
  const applyPreset = (presetName: keyof typeof CAMERA_ANIMATION_PRESETS) => {
    const presetFn = CAMERA_ANIMATION_PRESETS[presetName];
    const newKeyframes = presetFn(duration);
    onKeyframesChange(newKeyframes);
    setShowPresetMenu(false);
  };

  // Handle timeline click
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || isDragging) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = Math.max(0, Math.min(duration, x / pixelsPerMs));
    onSeek(time);
  };

  // Handle keyframe drag
  const handleKeyframeDrag = useCallback((e: MouseEvent, index: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = Math.max(0, Math.min(duration, x / pixelsPerMs));
    updateKeyframe(index, { time });
  }, [duration, pixelsPerMs]);

  const selectedKeyframe = selectedKeyframeIndex !== null ? keyframes[selectedKeyframeIndex] : null;

  // Generate time markers
  const markers: number[] = [];
  const markerInterval = 1000;
  for (let t = 0; t <= duration; t += markerInterval) {
    markers.push(t);
  }

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Camera className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">Camera Keyframes</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPresetMenu(!showPresetMenu)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Presets
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPresetMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10 max-h-64 overflow-y-auto">
                {PRESET_OPTIONS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {preset.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add keyframe */}
          <button
            onClick={addKeyframe}
            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Keyframe
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-24 overflow-x-auto bg-gray-800 cursor-crosshair"
        onClick={handleTimelineClick}
      >
        <div style={{ width: timelineWidth, minWidth: '100%' }} className="relative h-full">
          {/* Time markers */}
          <div className="absolute top-0 left-0 right-0 h-6 border-b border-gray-700">
            {markers.map((time) => (
              <div
                key={time}
                className="absolute top-0 bottom-0 border-l border-gray-600"
                style={{ left: time * pixelsPerMs }}
              >
                <span className="absolute top-1 left-1 text-[10px] text-gray-500 font-mono">
                  {(time / 1000).toFixed(1)}s
                </span>
              </div>
            ))}
          </div>

          {/* Keyframe track */}
          <div className="absolute top-8 left-0 right-0 bottom-0 px-2">
            {/* Connection lines */}
            {sortedKeyframes.length > 1 && (
              <svg className="absolute inset-0 pointer-events-none" style={{ width: timelineWidth }}>
                {sortedKeyframes.slice(0, -1).map((kf, i) => {
                  const nextKf = sortedKeyframes[i + 1];
                  const x1 = kf.time * pixelsPerMs;
                  const x2 = nextKf.time * pixelsPerMs;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={32}
                      x2={x2}
                      y2={32}
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      strokeDasharray={kf.easing === 'linear' ? '4,4' : undefined}
                    />
                  );
                })}
              </svg>
            )}

            {/* Keyframe markers */}
            {sortedKeyframes.map((kf, index) => {
              const originalIndex = keyframes.indexOf(kf);
              const isSelected = selectedKeyframeIndex === originalIndex;
              
              return (
                <motion.div
                  key={kf.id}
                  className={`absolute top-4 w-6 h-6 -ml-3 rounded-full cursor-pointer flex items-center justify-center ${
                    isSelected ? 'bg-purple-500 ring-2 ring-white' : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                  style={{ left: kf.time * pixelsPerMs }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedKeyframeIndex(originalIndex);
                    onSeek(kf.time);
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  drag="x"
                  dragConstraints={timelineRef}
                  dragElastic={0}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  onDrag={(_, info) => {
                    if (!timelineRef.current) return;
                    const rect = timelineRef.current.getBoundingClientRect();
                    const x = info.point.x - rect.left + timelineRef.current.scrollLeft;
                    const time = Math.max(0, Math.min(duration, x / pixelsPerMs));
                    updateKeyframe(originalIndex, { time });
                  }}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              );
            })}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
            style={{ left: currentTime * pixelsPerMs }}
          >
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Keyframe Properties */}
      {selectedKeyframe && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium text-sm">Keyframe Properties</h4>
            <button
              onClick={() => deleteKeyframe(selectedKeyframeIndex!)}
              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Time */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Time (ms)</label>
              <input
                type="number"
                value={Math.round(selectedKeyframe.time)}
                onChange={(e) => updateKeyframe(selectedKeyframeIndex!, { time: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>

            {/* Zoom */}
            <div>
              <label className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <ZoomIn className="w-3 h-3" /> Zoom
              </label>
              <input
                type="number"
                step={0.1}
                min={0.5}
                max={3}
                value={selectedKeyframe.zoom}
                onChange={(e) => updateKeyframe(selectedKeyframeIndex!, { zoom: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>

            {/* Pan X */}
            <div>
              <label className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <Move className="w-3 h-3" /> Pan X
              </label>
              <input
                type="number"
                value={selectedKeyframe.panX}
                onChange={(e) => updateKeyframe(selectedKeyframeIndex!, { panX: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>

            {/* Pan Y */}
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Pan Y</label>
              <input
                type="number"
                value={selectedKeyframe.panY}
                onChange={(e) => updateKeyframe(selectedKeyframeIndex!, { panY: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>

            {/* Rotation */}
            <div>
              <label className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Rotation
              </label>
              <input
                type="number"
                value={selectedKeyframe.rotation}
                onChange={(e) => updateKeyframe(selectedKeyframeIndex!, { rotation: Number(e.target.value) })}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
            </div>

            {/* Easing */}
            <div className="col-span-2 md:col-span-3">
              <label className="text-gray-400 text-xs mb-1 block">Easing</label>
              <div className="flex gap-1 flex-wrap">
                {(Object.keys(EASING_FUNCTIONS) as EasingType[]).map((easing) => (
                  <button
                    key={easing}
                    onClick={() => updateKeyframe(selectedKeyframeIndex!, { easing })}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedKeyframe.easing === easing
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {easing}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current camera state preview */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>Current: </span>
          <span>Zoom: {getCurrentCameraState(currentTime).zoom.toFixed(2)}x</span>
          <span>X: {getCurrentCameraState(currentTime).panX.toFixed(0)}</span>
          <span>Y: {getCurrentCameraState(currentTime).panY.toFixed(0)}</span>
          <span>Rot: {getCurrentCameraState(currentTime).rotation.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}
