'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  RotateCcw,
  Film,
  Loader2,
  AlertTriangle,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import RiggedCharacter from '@/components/RiggedCharacter';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCharacterRig } from '@/lib/sprite-system';

interface SharedScene {
  id: string;
  title: string;
  narration: string;
  background: string;
  duration: number;
  cameraZoom?: number;
  cameraPanX?: number;
  cameraPanY?: number;
  characters: {
    rigId: string;
    name: string;
    x: number;
    y: number;
    scale: number;
    flipX: boolean;
    animation: string;
    expression: string;
  }[];
}

interface SharedProject {
  id: string;
  title: string;
  scenes: SharedScene[];
}

export default function ViewProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<SharedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const lastSpokenRef = useRef(-1);

  // Load project
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/share?projectId=${params.id}`);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to load project');
        }
        
        setProject(data.project);
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    
    loadProject();
  }, [params.id]);

  // Speak narration
  const speakNarration = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || v.name.includes('Karen') || v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Auto-play scenes
  useEffect(() => {
    if (!isPlaying || !project || project.scenes.length === 0) return;
    
    const currentScene = project.scenes[currentSceneIndex];
    if (!currentScene) return;
    
    // Speak narration for new scene
    if (currentSceneIndex !== lastSpokenRef.current) {
      lastSpokenRef.current = currentSceneIndex;
      speakNarration(currentScene.narration);
    }
    
    const timer = setTimeout(() => {
      if (currentSceneIndex < project.scenes.length - 1) {
        setCurrentSceneIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentSceneIndex(0);
      }
    }, currentScene.duration || 5000);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex, project, speakNarration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading animation...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Animation Not Found</h1>
          <p className="text-gray-300 mb-6">{error || 'This animation may have been removed or the link is invalid.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Create Your Own
          </Link>
        </div>
      </div>
    );
  }

  const currentScene = project.scenes[currentSceneIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Film className="w-6 h-6 text-purple-400" />
            <h1 className="text-lg font-bold text-white truncate">{project.title}</h1>
          </div>
          <Link
            href="/"
            className="text-sm text-purple-300 hover:text-white transition-colors"
          >
            Create Your Own →
          </Link>
        </div>
      </header>

      {/* Main Viewer */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Animation Stage */}
        <div className="relative aspect-video bg-black/40 rounded-2xl overflow-hidden shadow-2xl mb-6">
          {currentScene && (
            <div 
              className="absolute inset-0"
              style={{
                transform: `scale(${currentScene.cameraZoom || 1}) translate(${(currentScene.cameraPanX || 0) * 5}%, ${(currentScene.cameraPanY || 0) * 5}%)`,
                transition: 'transform 0.5s ease-out',
              }}
            >
              {/* Background */}
              <AnimatedBackground backgroundType={currentScene.background as any} />

              {/* Characters */}
              {currentScene.characters.map((char, idx) => {
                const rig = getCharacterRig(char.rigId);
                if (!rig) return null;
                
                return (
                  <div
                    key={`${char.rigId}-${idx}`}
                    className="absolute"
                    style={{
                      left: `${char.x}%`,
                      bottom: `${100 - char.y}%`,
                      transform: `translateX(-50%) ${char.flipX ? 'scaleX(-1)' : ''}`,
                    }}
                  >
                    <RiggedCharacter
                      rig={rig}
                      animation={char.animation as any}
                      expression={char.expression as any}
                      scale={char.scale * 0.6}
                      isTalking={false}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Narration Overlay */}
          {currentScene && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center text-lg max-w-3xl mx-auto leading-relaxed">
                {currentScene.narration}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => {
                setCurrentSceneIndex(0);
                setIsPlaying(false);
                window.speechSynthesis?.cancel();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full bg-purple-500 hover:bg-purple-600 text-white transition-colors shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            
            <button
              onClick={() => setCurrentSceneIndex(Math.min(project.scenes.length - 1, currentSceneIndex + 1))}
              disabled={currentSceneIndex === project.scenes.length - 1}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (!isMuted) window.speechSynthesis?.cancel();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">{currentSceneIndex + 1}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${((currentSceneIndex + 1) / project.scenes.length) * 100}%` }}
              />
            </div>
            <span className="text-white/60 text-sm">{project.scenes.length}</span>
          </div>

          {/* Scene Thumbnails */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {project.scenes.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => {
                  setCurrentSceneIndex(idx);
                  setIsPlaying(false);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm transition-colors ${
                  idx === currentSceneIndex
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {scene.title || `Scene ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
