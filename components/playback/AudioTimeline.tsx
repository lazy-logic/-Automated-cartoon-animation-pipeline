'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Music,
  Mic,
  AudioWaveform,
  Plus,
  Trash2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Copy,
  Lock,
  Unlock,
} from 'lucide-react';

export interface AudioTrack {
  id: string;
  name: string;
  type: 'narration' | 'music' | 'sfx' | 'ambient';
  url?: string;
  text?: string; // For TTS tracks
  startTime: number; // ms from scene start
  duration: number; // ms
  volume: number; // 0-1
  muted: boolean;
  locked: boolean;
  color: string;
  waveform?: number[]; // Normalized amplitude values
}

interface AudioTimelineProps {
  tracks: AudioTrack[];
  duration: number; // Total scene duration in ms
  currentTime: number;
  isPlaying: boolean;
  onTracksChange: (tracks: AudioTrack[]) => void;
  onSeek: (time: number) => void;
  onPlayPause: () => void;
}

const TRACK_COLORS = {
  narration: '#3B82F6',
  music: '#8B5CF6',
  sfx: '#F59E0B',
  ambient: '#10B981',
};

const TRACK_ICONS = {
  narration: Mic,
  music: Music,
  sfx: AudioWaveform,
  ambient: Volume2,
};

export default function AudioTimeline({
  tracks,
  duration,
  currentTime,
  isPlaying,
  onTracksChange,
  onSeek,
  onPlayPause,
}: AudioTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [draggingTrack, setDraggingTrack] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [zoom, setZoom] = useState(1); // pixels per ms

  const pixelsPerMs = 0.1 * zoom;
  const timelineWidth = duration * pixelsPerMs;

  // Generate time markers
  const markers: number[] = [];
  const markerInterval = zoom > 1.5 ? 500 : zoom > 0.8 ? 1000 : 2000;
  for (let t = 0; t <= duration; t += markerInterval) {
    markers.push(t);
  }

  // Handle timeline click for seeking
  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current || draggingTrack) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const time = Math.max(0, Math.min(duration, x / pixelsPerMs));
    onSeek(time);
  };

  // Handle track drag start
  const handleTrackDragStart = (e: React.MouseEvent, trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track || track.locked) return;
    
    e.stopPropagation();
    setDraggingTrack(trackId);
    setDragStartX(e.clientX);
    setDragStartTime(track.startTime);
  };

  // Handle track drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingTrack) return;

    const deltaX = e.clientX - dragStartX;
    const deltaTime = deltaX / pixelsPerMs;
    const newStartTime = Math.max(0, dragStartTime + deltaTime);

    onTracksChange(
      tracks.map(t =>
        t.id === draggingTrack
          ? { ...t, startTime: Math.min(newStartTime, duration - t.duration) }
          : t
      )
    );
  }, [draggingTrack, dragStartX, dragStartTime, pixelsPerMs, duration, tracks, onTracksChange]);

  // Handle track drag end
  const handleMouseUp = useCallback(() => {
    setDraggingTrack(null);
  }, []);

  useEffect(() => {
    if (draggingTrack) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingTrack, handleMouseMove, handleMouseUp]);

  // Update track
  const updateTrack = (trackId: string, updates: Partial<AudioTrack>) => {
    onTracksChange(
      tracks.map(t => (t.id === trackId ? { ...t, ...updates } : t))
    );
  };

  // Delete track
  const deleteTrack = (trackId: string) => {
    onTracksChange(tracks.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) setSelectedTrackId(null);
  };

  // Add new track
  const addTrack = (type: AudioTrack['type']) => {
    const newTrack: AudioTrack = {
      id: `track-${Date.now()}`,
      name: `New ${type}`,
      type,
      startTime: 0,
      duration: Math.min(3000, duration),
      volume: 0.8,
      muted: false,
      locked: false,
      color: TRACK_COLORS[type],
    };
    onTracksChange([...tracks, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  // Duplicate track
  const duplicateTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const newTrack: AudioTrack = {
      ...track,
      id: `track-${Date.now()}`,
      name: `${track.name} (Copy)`,
      startTime: Math.min(track.startTime + track.duration, duration - track.duration),
    };
    onTracksChange([...tracks, newTrack]);
  };

  const selectedTrack = tracks.find(t => t.id === selectedTrackId);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-medium">Audio Timeline</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onPlayPause}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onSeek(0)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </div>
          <span className="text-gray-400 text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom control */}
          <div className="flex items-center gap-2 mr-4">
            <span className="text-gray-500 text-xs">Zoom:</span>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20 accent-purple-500"
            />
          </div>

          {/* Add track buttons */}
          {(['narration', 'music', 'sfx', 'ambient'] as const).map((type) => {
            const Icon = TRACK_ICONS[type];
            return (
              <button
                key={type}
                onClick={() => addTrack(type)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={`Add ${type} track`}
              >
                <Icon className="w-4 h-4" style={{ color: TRACK_COLORS[type] }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex">
        {/* Track labels */}
        <div className="w-40 flex-shrink-0 border-r border-gray-700">
          {/* Time ruler spacer */}
          <div className="h-8 border-b border-gray-700" />
          
          {/* Track labels */}
          {tracks.map((track) => {
            const Icon = TRACK_ICONS[track.type];
            return (
              <div
                key={track.id}
                className={`h-16 px-3 flex items-center gap-2 border-b border-gray-800 cursor-pointer transition-colors ${
                  selectedTrackId === track.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                }`}
                onClick={() => setSelectedTrackId(track.id)}
              >
                <Icon className="w-4 h-4" style={{ color: track.color }} />
                <span className="text-white text-sm truncate flex-1">{track.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTrack(track.id, { muted: !track.muted });
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {track.muted ? (
                    <VolumeX className="w-3 h-3 text-gray-500" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Timeline content */}
        <div
          ref={timelineRef}
          className="flex-1 overflow-x-auto"
          onClick={handleTimelineClick}
        >
          <div style={{ width: timelineWidth, minWidth: '100%' }}>
            {/* Time ruler */}
            <div className="h-8 border-b border-gray-700 relative">
              {markers.map((time) => (
                <div
                  key={time}
                  className="absolute top-0 bottom-0 border-l border-gray-700"
                  style={{ left: time * pixelsPerMs }}
                >
                  <span className="absolute top-1 left-1 text-[10px] text-gray-500 font-mono">
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tracks */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-gray-800 relative"
              >
                {/* Track clip */}
                <motion.div
                  className={`absolute top-2 bottom-2 rounded-lg cursor-move ${
                    track.locked ? 'opacity-50 cursor-not-allowed' : ''
                  } ${selectedTrackId === track.id ? 'ring-2 ring-white' : ''}`}
                  style={{
                    left: track.startTime * pixelsPerMs,
                    width: track.duration * pixelsPerMs,
                    backgroundColor: track.color,
                    opacity: track.muted ? 0.4 : 0.8,
                  }}
                  onMouseDown={(e) => handleTrackDragStart(e, track.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrackId(track.id);
                  }}
                >
                  {/* Waveform visualization */}
                  {track.waveform && (
                    <div className="absolute inset-0 flex items-center justify-around px-1">
                      {track.waveform.slice(0, 50).map((amp, i) => (
                        <div
                          key={i}
                          className="w-0.5 bg-white/50 rounded-full"
                          style={{ height: `${amp * 80}%` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Track name */}
                  <div className="absolute inset-x-2 top-1 text-[10px] text-white font-medium truncate">
                    {track.name}
                  </div>

                  {/* Duration */}
                  <div className="absolute right-2 bottom-1 text-[9px] text-white/70 font-mono">
                    {formatTime(track.duration)}
                  </div>

                  {/* Lock indicator */}
                  {track.locked && (
                    <Lock className="absolute right-2 top-1 w-3 h-3 text-white/50" />
                  )}

                  {/* Resize handles */}
                  {!track.locked && selectedTrackId === track.id && (
                    <>
                      <div
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 rounded-l-lg"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          // Handle left resize
                        }}
                      />
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/20 hover:bg-white/40 rounded-r-lg"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          // Handle right resize
                        }}
                      />
                    </>
                  )}
                </motion.div>
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
              style={{ left: currentTime * pixelsPerMs }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Selected track properties */}
      {selectedTrack && (
        <div className="px-4 py-3 border-t border-gray-700 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Volume:</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedTrack.volume}
              onChange={(e) => updateTrack(selectedTrack.id, { volume: Number(e.target.value) })}
              className="w-24 accent-purple-500"
            />
            <span className="text-white text-sm w-10">
              {Math.round(selectedTrack.volume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Start:</span>
            <input
              type="number"
              value={Math.round(selectedTrack.startTime)}
              onChange={(e) => updateTrack(selectedTrack.id, { startTime: Number(e.target.value) })}
              className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            <span className="text-gray-500 text-xs">ms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Duration:</span>
            <input
              type="number"
              value={Math.round(selectedTrack.duration)}
              onChange={(e) => updateTrack(selectedTrack.id, { duration: Number(e.target.value) })}
              className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            />
            <span className="text-gray-500 text-xs">ms</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => updateTrack(selectedTrack.id, { locked: !selectedTrack.locked })}
              className={`p-2 rounded-lg transition-colors ${
                selectedTrack.locked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              title={selectedTrack.locked ? 'Unlock' : 'Lock'}
            >
              {selectedTrack.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => duplicateTrack(selectedTrack.id)}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteTrack(selectedTrack.id)}
              className="p-2 bg-gray-800 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const remainingMs = Math.floor((ms % 1000) / 10);
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${remainingMs.toString().padStart(2, '0')}`;
  }
  return `${remainingSeconds}.${remainingMs.toString().padStart(2, '0')}`;
}
