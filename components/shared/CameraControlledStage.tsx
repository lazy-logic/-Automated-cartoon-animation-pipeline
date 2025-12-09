'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  useCamera, 
  CameraTarget,
  createCartoonCamera 
} from '@/lib/animation/pixi-camera';
import { 
  CameraAngle, 
  CameraState,
  CAMERA_ANGLE_PRESETS 
} from '@/lib/animation/camera-system';
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  RotateCcw, 
  Target,
  Maximize2,
  Minimize2,
  Sparkles,
  Video
} from 'lucide-react';

interface CameraControlledStageProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  showControls?: boolean;
  initialAngle?: CameraAngle;
  onCameraChange?: (state: CameraState) => void;
}

// Camera angle button labels
const ANGLE_LABELS: Record<CameraAngle, string> = {
  'wide': 'Wide',
  'medium': 'Medium',
  'closeup': 'Close-up',
  'extreme-closeup': 'Extreme CU',
  'over-shoulder': 'Over Shoulder',
  'low-angle': 'Low Angle',
  'high-angle': 'High Angle',
  'dutch': 'Dutch',
  'bird-eye': "Bird's Eye",
};

export default function CameraControlledStage({
  children,
  width = 800,
  height = 450,
  showControls = true,
  initialAngle = 'wide',
  onCameraChange,
}: CameraControlledStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { 
    state: cameraState, 
    panTo, 
    zoomTo, 
    setAngle, 
    shake, 
    cutTo,
    getCSSTransform 
  } = useCamera({ angle: initialAngle });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAngleMenu, setShowAngleMenu] = useState(false);

  // Notify parent of camera changes
  useEffect(() => {
    onCameraChange?.(cameraState);
  }, [cameraState, onCameraChange]);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = (e.clientX - dragStart.x) / width * 100;
    const dy = (e.clientY - dragStart.y) / height * 100;
    
    panTo(cameraState.x + dx, cameraState.y + dy, { duration: 0 });
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, width, height, cameraState.x, cameraState.y, panTo]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, cameraState.zoom + delta));
    zoomTo(newZoom, { duration: 100 });
  }, [cameraState.zoom, zoomTo]);

  // Quick actions
  const handleZoomIn = () => zoomTo(cameraState.zoom + 0.2, { duration: 300 });
  const handleZoomOut = () => zoomTo(cameraState.zoom - 0.2, { duration: 300 });
  const handleReset = () => cutTo({ x: 0, y: 0, zoom: 1, rotation: 0, angle: 'wide' });
  const handleShake = () => shake('medium', 500);

  return (
    <div className="relative">
      {/* Stage Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl bg-gray-900 cursor-grab active:cursor-grabbing"
        style={{ width, height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Camera Transform Layer */}
        <div
          className="absolute inset-0 origin-center"
          style={{
            transform: getCSSTransform(),
            transition: cameraState.movement === 'static' ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {children}
        </div>

        {/* Camera Info Overlay */}
        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white font-mono">
          <div className="flex items-center gap-3">
            <span>📷 {ANGLE_LABELS[cameraState.angle]}</span>
            <span>🔍 {cameraState.zoom.toFixed(1)}x</span>
            {cameraState.rotation !== 0 && (
              <span>↻ {cameraState.rotation.toFixed(0)}°</span>
            )}
          </div>
        </div>

        {/* Recording indicator (for export) */}
        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-white">REC</span>
        </div>
      </div>

      {/* Camera Controls */}
      {showControls && (
        <div className="mt-4 flex items-center justify-between">
          {/* Left: Zoom controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${((cameraState.zoom - 0.5) / 2.5) * 100}%` }}
              />
            </div>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Angle presets */}
          <div className="relative">
            <button
              onClick={() => setShowAngleMenu(!showAngleMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors"
            >
              <Video className="w-4 h-4" />
              {ANGLE_LABELS[cameraState.angle]}
            </button>

            {/* Angle dropdown */}
            {showAngleMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 grid grid-cols-3 gap-1 min-w-[280px]"
              >
                {(Object.keys(ANGLE_LABELS) as CameraAngle[]).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => {
                      setAngle(angle, { duration: 500 });
                      setShowAngleMenu(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                      cameraState.angle === angle
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {ANGLE_LABELS[angle]}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right: Effects & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShake}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              title="Camera Shake"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
              title="Reset Camera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      {showControls && (
        <div className="mt-2 text-center text-xs text-gray-500">
          <span className="mr-4">🖱️ Drag to pan</span>
          <span className="mr-4">⚙️ Scroll to zoom</span>
          <span>⌨️ 1-9 for angles</span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// CAMERA TIMELINE COMPONENT
// ==========================================

interface CameraKeyframeUI {
  time: number;
  angle: CameraAngle;
  zoom: number;
  x: number;
  y: number;
}

interface CameraTimelineProps {
  duration: number;
  keyframes: CameraKeyframeUI[];
  currentTime: number;
  onKeyframeAdd: (time: number) => void;
  onKeyframeUpdate: (index: number, keyframe: CameraKeyframeUI) => void;
  onKeyframeDelete: (index: number) => void;
  onSeek: (time: number) => void;
}

export function CameraTimeline({
  duration,
  keyframes,
  currentTime,
  onKeyframeAdd,
  onKeyframeUpdate,
  onKeyframeDelete,
  onSeek,
}: CameraTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    onSeek(time);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    onKeyframeAdd(time);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white text-sm font-medium">Camera Timeline</h3>
        <span className="text-gray-400 text-xs font-mono">
          {(currentTime / 1000).toFixed(1)}s / {(duration / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Timeline track */}
      <div
        ref={timelineRef}
        className="relative h-12 bg-gray-800 rounded-lg cursor-pointer"
        onClick={handleTimelineClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Keyframes */}
        {keyframes.map((kf, index) => (
          <div
            key={index}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform"
            style={{ left: `${(kf.time / duration) * 100}%` }}
            title={`${ANGLE_LABELS[kf.angle]} @ ${(kf.time / 1000).toFixed(1)}s`}
            onClick={(e) => {
              e.stopPropagation();
              onSeek(kf.time);
            }}
          />
        ))}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Double-click to add keyframe • Click keyframe to select • Drag to move
      </p>
    </div>
  );
}
