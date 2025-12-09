'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStudioStore } from '@/lib/store';
import { speak, stopSpeaking, initAudio } from '@/lib/audio';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  Settings,
} from 'lucide-react';

interface PlaybackControlsProps {
  onExport?: () => void;
  onFullscreen?: () => void;
}

export default function PlaybackControls({
  onExport,
  onFullscreen,
}: PlaybackControlsProps) {
  const {
    project,
    playback,
    play,
    pause,
    stop,
    nextScene,
    prevScene,
    setCurrentTime,
  } = useStudioStore();

  const [isMuted, setIsMuted] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sceneStartTimeRef = useRef<number>(0);

  const scenes = project.scenes;
  const currentScene = scenes[playback.currentSceneIndex];
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);

  // Initialize audio
  useEffect(() => {
    initAudio();
  }, []);

  // Handle narration
  const narrateScene = useCallback(async () => {
    if (!currentScene || isMuted || !project.settings.autoNarration) return;

    const text = currentScene.narration || currentScene.description;
    if (!text) return;

    setIsNarrating(true);
    try {
      await speak(text, {
        rate: 0.9,
        onEnd: () => setIsNarrating(false),
      });
    } catch (e) {
      setIsNarrating(false);
    }
  }, [currentScene, isMuted, project.settings.autoNarration]);

  // Playback loop
  useEffect(() => {
    if (!playback.isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopSpeaking();
      return;
    }

    sceneStartTimeRef.current = Date.now();
    narrateScene();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - sceneStartTimeRef.current;
      setCurrentTime(elapsed);

      if (currentScene && elapsed >= currentScene.duration) {
        // Move to next scene
        if (playback.currentSceneIndex < scenes.length - 1) {
          nextScene();
          sceneStartTimeRef.current = Date.now();
          stopSpeaking();
          setTimeout(narrateScene, 300);
        } else {
          // End of story
          stop();
        }
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [playback.isPlaying, playback.currentSceneIndex, currentScene, scenes.length, narrateScene, nextScene, stop, setCurrentTime]);

  const handlePlayPause = () => {
    if (playback.isPlaying) {
      pause();
      stopSpeaking();
    } else {
      play();
    }
  };

  const handleStop = () => {
    stop();
    stopSpeaking();
    setIsNarrating(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpeaking();
    }
  };

  const progressPercent = currentScene
    ? (playback.currentTime / currentScene.duration) * 100
    : 0;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>
            Scene {playback.currentSceneIndex + 1} of {scenes.length}
          </span>
          <span>
            {formatTime(playback.currentTime)} / {formatTime(currentScene?.duration || 0)}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Previous */}
          <button
            onClick={prevScene}
            disabled={playback.currentSceneIndex === 0}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous scene"
          >
            <SkipBack className="w-5 h-5 text-gray-600" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white hover:shadow-lg hover:scale-105 transition-all"
            title={playback.isPlaying ? 'Pause' : 'Play'}
          >
            {playback.isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Stop"
          >
            <Square className="w-5 h-5 text-gray-600" />
          </button>

          {/* Next */}
          <button
            onClick={nextScene}
            disabled={playback.currentSceneIndex >= scenes.length - 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next scene"
          >
            <SkipForward className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          {isNarrating && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Narrating...
            </div>
          )}

          {playback.isPlaying && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Playing
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Mute */}
          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-lg transition-colors ${
              isMuted ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          {/* Fullscreen */}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Export */}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              title="Export video"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Scene Title */}
      {currentScene && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-800">{currentScene.title}</p>
          <p className="text-xs text-gray-500 truncate">{currentScene.description}</p>
        </div>
      )}
    </div>
  );
}
