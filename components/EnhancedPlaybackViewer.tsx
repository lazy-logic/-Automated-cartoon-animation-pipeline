'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  Maximize,
  Settings,
  Edit3,
  Music,
  Music2,
  Camera,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Move,
  Layers,
  Wand2,
} from 'lucide-react';
import RiggedCharacter from './RiggedCharacter';
import { getCharacterRig } from '@/lib/sprite-system';
import { EditableScene, EditableCharacter } from './InteractiveSceneEditor';
import { getAudioController, createNarrationDialogue, DialoguePlayer } from '@/lib/audio-system';
import { MouthShape } from '@/lib/keyframe-animation';
import AnimatedBackground from './AnimatedBackground';
import ParallaxBackground from './ParallaxBackground';
import SceneTransition, { TransitionType } from './SceneTransition';
import { getAmbientSoundController, AmbientSoundType } from '@/lib/ambient-sounds';
import { 
  CameraState, 
  DEFAULT_CAMERA_STATE, 
  cameraStateToCSS, 
  suggestCameraForScene,
  generateShakeValues 
} from '@/lib/camera-system';
import { 
  generateSceneSounds, 
  getSoundSynthesizer, 
  SoundEvent 
} from '@/lib/auto-sound-generator';
import { 
  getMotionCurveForAction, 
  MOTION_PRESETS,
  calculateSquashStretch 
} from '@/lib/animation-interpolation';
import {
  Layer,
  createLayer,
  getLayerFilterCSS,
  getLayerTransformCSS,
  sortLayersByZIndex,
  DEFAULT_LAYER_PRESETS,
} from '@/lib/layer-system';

interface EnhancedPlaybackViewerProps {
  scenes: EditableScene[];
  onClose?: () => void;
  onEditScene?: (sceneIndex: number) => void;
  autoPlay?: boolean;
  characterRoleLabels?: Record<string, string>;
  customBackgrounds?: Record<string, string>; // Map of background ID to URL
}

// Background configurations with fallback colors
const BACKGROUNDS: Record<string, { gradient: string; groundColor: string; elements: string }> = {
  meadow: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 40%, #90EE90 100%)',
    groundColor: '#7CFC00',
    elements: 'nature',
  },
  forest: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #228B22 100%)',
    groundColor: '#228B22',
    elements: 'nature',
  },
  beach: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 40%, #00CED1 60%, #F4A460 100%)',
    groundColor: '#F4A460',
    elements: 'beach',
  },
  night: {
    gradient: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    groundColor: '#1a1a2e',
    elements: 'night',
  },
  bedroom: {
    gradient: 'linear-gradient(180deg, #E6E6FA 0%, #DDA0DD 50%, #D2B48C 100%)',
    groundColor: '#D2B48C',
    elements: 'indoor',
  },
  park: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #90EE90 100%)',
    groundColor: '#7CFC00',
    elements: 'nature',
  },
  castle: {
    gradient: 'linear-gradient(180deg, #4A5568 0%, #2D3748 50%, #1A202C 100%)',
    groundColor: '#4A5568',
    elements: 'indoor',
  },
  space: {
    gradient: 'linear-gradient(180deg, #0B0B1A 0%, #1A1A3E 50%, #0B0B1A 100%)',
    groundColor: '#1A1A3E',
    elements: 'night',
  },
  underwater: {
    gradient: 'linear-gradient(180deg, #006994 0%, #004466 50%, #002233 100%)',
    groundColor: '#002233',
    elements: 'beach',
  },
  mountain: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #B8D4E3 40%, #8B9DC3 70%, #6B8E23 100%)',
    groundColor: '#6B8E23',
    elements: 'nature',
  },
  city: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0C4DE 50%, #708090 100%)',
    groundColor: '#696969',
    elements: 'indoor',
  },
  farm: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 40%, #90EE90 100%)',
    groundColor: '#8B4513',
    elements: 'nature',
  },
  playground: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 50%, #98FB98 100%)',
    groundColor: '#DEB887',
    elements: 'nature',
  },
  library: {
    gradient: 'linear-gradient(180deg, #D2B48C 0%, #BC8F8F 50%, #A0522D 100%)',
    groundColor: '#8B4513',
    elements: 'indoor',
  },
  kitchen: {
    gradient: 'linear-gradient(180deg, #FFFAF0 0%, #FFF5EE 50%, #FFE4C4 100%)',
    groundColor: '#D2691E',
    elements: 'indoor',
  },
  garden: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #228B22 100%)',
    groundColor: '#228B22',
    elements: 'nature',
  },
};

// Default/fallback background for unknown backgrounds
const DEFAULT_BACKGROUND = {
  gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 40%, #90EE90 100%)',
  groundColor: '#7CFC00',
  elements: 'nature',
};

type SceneIntensity = 'calm' | 'normal' | 'intense';

function computeSceneIntensity(narration: string): SceneIntensity {
  const text = narration.toLowerCase();

  if (/(chase|run|race|storm|thunder|lightning|danger|scared|afraid|excited|amazing|wow|fast)/.test(text)) {
    return 'intense';
  }

  if (/(sleep|bedtime|quiet|calm|peaceful|gentle|dream|slow)/.test(text)) {
    return 'calm';
  }

  return 'normal';
}

export default function EnhancedPlaybackViewer({
  scenes,
  onClose,
  onEditScene,
  autoPlay = true,
  characterRoleLabels,
  customBackgrounds = {},
}: EnhancedPlaybackViewerProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(true);
  const [characterMouthShapes, setCharacterMouthShapes] = useState<Record<string, MouthShape>>({});
  const [talkingCharacterId, setTalkingCharacterId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [cameraState, setCameraState] = useState<CameraState>(DEFAULT_CAMERA_STATE);
  const [cameraTime, setCameraTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [cameraEffect, setCameraEffect] = useState<'none' | 'shake-light' | 'pulse' | 'wobble'>('none');
  const [sceneIntensity, setSceneIntensity] = useState<SceneIntensity>('normal');
  
  // New AI-inspired features state
  const [autoSoundEnabled, setAutoSoundEnabled] = useState(true);
  const [layerEffectsEnabled, setLayerEffectsEnabled] = useState(true);
  const [smoothAnimationEnabled, setSmoothAnimationEnabled] = useState(true);
  const [characterSquash, setCharacterSquash] = useState<Record<string, { squash: number; stretch: number }>>({});
  const [sceneLayers, setSceneLayers] = useState<Layer[]>([]);
  const [scheduledSounds, setScheduledSounds] = useState<SoundEvent[]>([]);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const audioControllerRef = useRef(getAudioController());
  const ambientControllerRef = useRef(getAmbientSoundController());
  const soundSynthRef = useRef(getSoundSynthesizer());
  const dialoguePlayerRef = useRef<DialoguePlayer | null>(null);
  const hasSpokenRef = useRef(false);
  const soundsPlayedRef = useRef<Set<number>>(new Set());

  const safeSceneIndex = Math.min(currentSceneIndex, scenes.length - 1);
  const currentScene = scenes[safeSceneIndex];
  
  // Check for custom/AI-generated background URL
  const customBgUrl = currentScene?.background ? customBackgrounds[currentScene.background] : null;
  const bgConfig = currentScene ? (BACKGROUNDS[currentScene.background] || DEFAULT_BACKGROUND) : DEFAULT_BACKGROUND;
  
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);
  const hasRoleLabels = characterRoleLabels && Object.keys(characterRoleLabels).length > 0;
  const moodLabel =
    sceneIntensity === 'calm'
      ? 'Calm'
      : sceneIntensity === 'intense'
      ? 'Exciting'
      : 'Normal';
  const moodClass =
    sceneIntensity === 'calm'
      ? 'text-cyan-300'
      : sceneIntensity === 'intense'
      ? 'text-red-300'
      : 'text-purple-200';

  // Speak narration with lip sync
  const speakNarration = useCallback((text: string, characterIds: string[]) => {
    if (isMuted || !text) return;

    const speakingCharId = characterIds[0] || null;
    setTalkingCharacterId(speakingCharId);

    audioControllerRef.current.speak(text, {
      rate: 0.9,
      pitch: 1.1,
      onMouthShapeChange: (shape) => {
        if (speakingCharId) {
          setCharacterMouthShapes(prev => ({ ...prev, [speakingCharId]: shape }));
        }
      },
      onEnd: () => {
        setTalkingCharacterId(null);
        setCharacterMouthShapes({});
      },
    });
  }, [isMuted]);

  // Scene change effect
  useEffect(() => {
    dialoguePlayerRef.current?.stop();
    hasSpokenRef.current = false;
    soundsPlayedRef.current.clear();
    setShowTitle(true);
    setCharacterMouthShapes({});
    setTalkingCharacterId(null);
    setCameraTime(0);

    if (currentScene) {
      const intensity = computeSceneIntensity(currentScene.narration);
      setSceneIntensity(intensity);

      const transitionForScene: TransitionType =
        intensity === 'intense'
          ? 'zoom-in'
          : intensity === 'calm'
          ? 'fade'
          : 'slide-left';
      setTransitionType(transitionForScene);

      const hasCustomCamera =
        (typeof currentScene.cameraZoom === 'number' && currentScene.cameraZoom !== 1) ||
        (typeof currentScene.cameraPanX === 'number' && currentScene.cameraPanX !== 0) ||
        (typeof currentScene.cameraPanY === 'number' && currentScene.cameraPanY !== 0);

      let cameraTimer: ReturnType<typeof setTimeout> | undefined;

      if (hasCustomCamera) {
        const baseZoom = currentScene.cameraZoom || 1;
        const baseX = currentScene.cameraPanX || 0;
        const baseY = currentScene.cameraPanY || 0;
        const transitionDuration =
          intensity === 'calm' ? 1200 :
          intensity === 'intense' ? 800 :
          1000;

        setCameraState({
          ...DEFAULT_CAMERA_STATE,
          x: baseX,
          y: baseY,
          zoom: baseZoom,
          transitionDuration,
          easing: 'ease-in-out',
        });
      } else {
        // Update camera based on scene content with more dramatic effects
        const suggestedCamera = suggestCameraForScene(
          currentScene.narration,
          currentScene.characters.length,
          currentScene.characters[0]?.animation || 'idle'
        );
        const initialZoom =
          intensity === 'calm' ? 0.9 :
          intensity === 'intense' ? 1.1 :
          0.95;
        const targetZoom =
          suggestedCamera.zoom ??
          (intensity === 'intense' ? 1.3 : intensity === 'calm' ? 1.0 : 1.05);
        const initialDuration =
          intensity === 'calm' ? 1000 :
          intensity === 'intense' ? 600 :
          800;
        const focusDuration =
          intensity === 'calm' ? 2200 :
          intensity === 'intense' ? 1400 :
          2000;

        // Start with a wide shot then zoom to suggested angle
        setCameraState({
          ...DEFAULT_CAMERA_STATE,
          zoom: initialZoom,
          transitionDuration: initialDuration,
          easing: intensity === 'intense' ? 'ease-in' : 'ease-out',
        });
        
        // After a delay, apply the suggested camera
        cameraTimer = setTimeout(() => {
          setCameraState(prev => ({
            ...prev,
            ...suggestedCamera,
            zoom: targetZoom,
            transitionDuration: focusDuration,
            easing: 'ease-in-out',
          }));
        }, 500);
      }

      // Auto camera effect based on intensity when user hasn't chosen one
      if (cameraEffect === 'none') {
        const effectForScene =
          intensity === 'intense' ? 'shake-light' :
          intensity === 'calm' ? 'pulse' :
          'none';

        if (effectForScene !== 'none') {
          setCameraEffect(effectForScene);
          setCameraState(prev => ({
            ...prev,
            effect: effectForScene as any,
          }));
        }
      }

      // Update ambient sound based on background
      if (ambientEnabled) {
        const bgType = currentScene.background as AmbientSoundType;
        ambientControllerRef.current.play(bgType);
      }

      // Generate auto sounds for the scene (Diff-Foley inspired)
      if (autoSoundEnabled && !isMuted) {
        const characters = currentScene.characters.map(c => ({
          action: c.animation,
          position: c.x / 100,
        }));
        const sounds = generateSceneSounds(
          currentScene.background,
          characters,
          currentScene.narration,
          currentScene.duration
        );
        setScheduledSounds(sounds);
        
        // Resume audio context on user interaction
        soundSynthRef.current.resume();
      }

      // Create layer composition (LayerAnimate inspired)
      if (layerEffectsEnabled) {
        const layers: Layer[] = [
          createLayer('Background', 'background', { 
            ...DEFAULT_LAYER_PRESETS.sky, 
            parallaxSpeed: 0.1 
          }),
          createLayer('Midground', 'environment', { 
            ...DEFAULT_LAYER_PRESETS.trees, 
            parallaxSpeed: 0.4,
            blur: 0.5,
          }),
          createLayer('Characters', 'character', { 
            ...DEFAULT_LAYER_PRESETS.character, 
            parallaxSpeed: 1 
          }),
          createLayer('Foreground', 'foreground', { 
            ...DEFAULT_LAYER_PRESETS.foregroundProps, 
            parallaxSpeed: 1.3,
            blur: 2,
            opacity: 0.4,
          }),
        ];
        setSceneLayers(sortLayersByZIndex(layers));
      }

      // Initialize squash-stretch for characters (ToonCrafter inspired)
      if (smoothAnimationEnabled) {
        const initialSquash: Record<string, { squash: number; stretch: number }> = {};
        currentScene.characters.forEach(char => {
          initialSquash[char.id] = { squash: 1, stretch: 1 };
        });
        setCharacterSquash(initialSquash);
      }

      const titleTimer = setTimeout(() => setShowTitle(false), 2000);
      
      return () => {
        if (cameraTimer) {
          clearTimeout(cameraTimer);
        }
        clearTimeout(titleTimer);
      };
    }
  }, [currentSceneIndex, currentScene, ambientEnabled, autoSoundEnabled, layerEffectsEnabled, smoothAnimationEnabled, isMuted, cameraEffect]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !currentScene) return;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Update camera time for effects
      setCameraTime(prev => prev + deltaTime);

      setSceneProgress(prev => {
        const newProgress = prev + deltaTime;

        // Speak dialogue or narration after title fades
        if (!hasSpokenRef.current && newProgress > 800) {
          const sceneDialogue = currentScene.dialogue || [];

          if (sceneDialogue.length > 0) {
            const lines = sceneDialogue
              .map((line, index) => {
                const speakerName = (line.speaker || '').toLowerCase();
                const targetChar = currentScene.characters.find(
                  (c) => c.name.toLowerCase() === speakerName
                ) || currentScene.characters[0];

                if (!targetChar || !line.text) return null;

                return {
                  characterId: targetChar.id,
                  text: line.text,
                  emotion: 'neutral' as const,
                  delay: index === 0 ? 200 : 100,
                };
              })
              .filter((l): l is { characterId: string; text: string; emotion: 'neutral'; delay: number } => !!l);

            if (lines.length > 0) {
              if (!dialoguePlayerRef.current) {
                dialoguePlayerRef.current = new DialoguePlayer();
              }

              dialoguePlayerRef.current.play(
                {
                  id: `scene-${safeSceneIndex}-${Date.now()}`,
                  lines,
                },
                {
                  onLineStart: (line) => {
                    setTalkingCharacterId(line.characterId);
                  },
                  onLineEnd: () => {
                    setTalkingCharacterId(null);
                  },
                  onSequenceEnd: () => {
                    setTalkingCharacterId(null);
                    setCharacterMouthShapes({});
                  },
                  onMouthShapeChange: (characterId, shape) => {
                    setCharacterMouthShapes((prev) => ({ ...prev, [characterId]: shape }));
                  },
                }
              );

              hasSpokenRef.current = true;
            }
          }

          if (!hasSpokenRef.current) {
            const talker = currentScene.characters.find(c => c.animation === 'talk');
            const characterIds = talker
              ? [talker.id]
              : currentScene.characters.map(c => c.id);
            speakNarration(currentScene.narration, characterIds);
            hasSpokenRef.current = true;
          }
        }

        // Play scheduled sounds (Diff-Foley inspired)
        if (autoSoundEnabled && !isMuted) {
          scheduledSounds.forEach((sound, index) => {
            if (newProgress >= sound.time && !soundsPlayedRef.current.has(index)) {
              soundSynthRef.current.playSound(sound);
              soundsPlayedRef.current.add(index);
            }
          });
        }

        // Update squash-stretch based on character animations (ToonCrafter inspired)
        if (smoothAnimationEnabled) {
          const newSquash: Record<string, { squash: number; stretch: number }> = {};
          const intensityMultiplier =
            sceneIntensity === 'intense' ? 1.35 : sceneIntensity === 'calm' ? 0.8 : 1;
          currentScene.characters.forEach(char => {
            const motionCurve = getMotionCurveForAction(char.animation);
            // Calculate velocity-based deformation
            const cycleTime = (newProgress % 500) / 500; // 500ms cycle
            const baseAmplitude =
              char.animation === 'run' ? 30 : char.animation === 'walk' ? 15 : 5;
            const velocity = Math.sin(cycleTime * Math.PI * 2) * baseAmplitude * intensityMultiplier;

            const baseAmount =
              motionCurve.type === 'spring' || motionCurve.type === 'bounce' ? 0.15 : 0.08;
            newSquash[char.id] = calculateSquashStretch(velocity, baseAmount * intensityMultiplier);
          });
          setCharacterSquash(newSquash);
        }

        if (newProgress >= currentScene.duration) {
          const nextIndex = currentSceneIndex + 1;
          if (nextIndex < scenes.length) {
            // Trigger transition before changing scene
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentSceneIndex(nextIndex);
              hasSpokenRef.current = false;
              setIsTransitioning(false);
            }, 300);
            return 0;
          } else {
            setIsPlaying(false);
            return currentScene.duration;
          }
        }

        return newProgress;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [isPlaying, currentScene, currentSceneIndex, scenes.length, speakNarration, autoSoundEnabled, scheduledSounds, smoothAnimationEnabled, isMuted, sceneIntensity]);

  // Cleanup
  useEffect(() => {
    return () => {
      audioControllerRef.current.stop();
      ambientControllerRef.current.stop();
      dialoguePlayerRef.current?.stop();
    };
  }, []);

  // Handle ambient sound toggle
  useEffect(() => {
    if (!ambientEnabled) {
      ambientControllerRef.current.stop();
    } else if (currentScene) {
      const bgType = currentScene.background as AmbientSoundType;
      ambientControllerRef.current.play(bgType);
    }
  }, [ambientEnabled, currentScene]);

  // Controls
  const togglePlay = () => {
    if (!isPlaying) {
      lastTimeRef.current = 0;
    } else {
      audioControllerRef.current.stop();
      dialoguePlayerRef.current?.stop();
    }
    setIsPlaying(!isPlaying);
  };

  const goToScene = (index: number) => {
    audioControllerRef.current.stop();
    dialoguePlayerRef.current?.stop();
    setCurrentSceneIndex(Math.max(0, Math.min(scenes.length - 1, index)));
    setSceneProgress(0);
    lastTimeRef.current = 0;
    hasSpokenRef.current = false;
    setCharacterMouthShapes({});
    setTalkingCharacterId(null);
  };

  const restart = () => {
    audioControllerRef.current.stop();
    dialoguePlayerRef.current?.stop();
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    setIsPlaying(true);
    lastTimeRef.current = 0;
    hasSpokenRef.current = false;
  };

  const toggleMute = () => {
    if (!isMuted) {
      audioControllerRef.current.stop();
      dialoguePlayerRef.current?.stop();
    }
    setIsMuted(!isMuted);
  };

  // Progress calculation
  const overallProgress = scenes.slice(0, currentSceneIndex).reduce((sum, s) => sum + s.duration, 0) + sceneProgress;
  const progressPercent = totalDuration > 0 ? (overallProgress / totalDuration) * 100 : 0;

  if (!currentScene) return null;

  const isEnded = !isPlaying && safeSceneIndex === scenes.length - 1 && sceneProgress >= currentScene.duration - 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="text-white">
            <div className="flex items-center gap-2">
              <h2 className="font-bold">{currentScene.title}</h2>
              {hasRoleLabels && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-purple-500/30 text-purple-100 border border-purple-400/40">
                  <Wand2 className="w-3 h-3 mr-1" />
                  AI tags
                </span>
              )}
            </div>
            <p className="text-sm text-white/70 flex items-center gap-2">
              <span>
                Scene {safeSceneIndex + 1} of {scenes.length}
              </span>
              <span className={`text-xs ${moodClass}`}>
                {moodLabel}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEditScene && (
            <button
              onClick={() => {
                setIsPlaying(false);
                audioControllerRef.current.stop();
                onEditScene(safeSceneIndex);
              }}
              className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <Edit3 className="w-5 h-5 text-white" />
            </button>
          )}
          <button
            onClick={toggleMute}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            title="Toggle narration"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={() => setAmbientEnabled(!ambientEnabled)}
            className={`p-2 rounded-full transition-colors ${
              ambientEnabled ? 'bg-purple-500/50 hover:bg-purple-500/70' : 'bg-black/50 hover:bg-black/70'
            }`}
            title="Toggle ambient sounds"
          >
            {ambientEnabled ? (
              <Music2 className="w-5 h-5 text-white" />
            ) : (
              <Music className="w-5 h-5 text-white/50" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-colors ${
              showSettings ? 'bg-blue-500/50 hover:bg-blue-500/70' : 'bg-black/50 hover:bg-black/70'
            }`}
            title="Camera & Effects Settings"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-20 right-4 z-30 bg-black/80 backdrop-blur-md rounded-2xl p-4 w-72 border border-white/10"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera & Effects
            </h3>
            
            {/* Camera Zoom */}
            <div className="mb-4">
              <label className="text-white/70 text-sm mb-2 block">Camera Zoom</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCameraState(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                  <ZoomOut className="w-4 h-4 text-white" />
                </button>
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${((cameraState.zoom - 0.5) / 1.5) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setCameraState(prev => ({ ...prev, zoom: Math.min(2, prev.zoom + 0.1) }))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Camera Effect */}
            <div className="mb-4">
              <label className="text-white/70 text-sm mb-2 block">Camera Effect</label>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'shake-light', 'pulse', 'wobble'] as const).map((effect) => (
                  <button
                    key={effect}
                    onClick={() => {
                      setCameraEffect(effect);
                      setCameraState(prev => ({ ...prev, effect: effect as any }));
                    }}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      cameraEffect === effect
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {effect === 'none' ? 'None' : effect === 'shake-light' ? 'Shake' : effect.charAt(0).toUpperCase() + effect.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Scene Transition */}
            <div className="mb-2">
              <label className="text-white/70 text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Scene Transition
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['fade', 'slide-left', 'slide-right', 'wipe-left', 'circle-in', 'zoom-in'] as TransitionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTransitionType(type)}
                    className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      transitionType === type
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(' ', '\n').split('\n')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* AI-Inspired Features Section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                AI Features
              </h4>
              
              {/* Auto Sound Effects (Diff-Foley) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-white/80 text-sm">Auto Sound FX</span>
                </div>
                <button
                  onClick={() => setAutoSoundEnabled(!autoSoundEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    autoSoundEnabled ? 'bg-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    autoSoundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Layer Effects (LayerAnimate) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-white/80 text-sm">Layer Effects</span>
                </div>
                <button
                  onClick={() => setLayerEffectsEnabled(!layerEffectsEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    layerEffectsEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    layerEffectsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Smooth Animation (ToonCrafter) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/80 text-sm">Squash & Stretch</span>
                </div>
                <button
                  onClick={() => setSmoothAnimationEnabled(!smoothAnimationEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    smoothAnimationEnabled ? 'bg-yellow-500' : 'bg-white/20'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    smoothAnimationEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Status indicators */}
              <div className="mt-3 p-2 bg-white/5 rounded-lg">
                <p className="text-white/50 text-xs">
                  {autoSoundEnabled && `🔊 ${scheduledSounds.length} sounds queued`}
                  {autoSoundEnabled && layerEffectsEnabled && ' • '}
                  {layerEffectsEnabled && `📐 ${sceneLayers.length} layers active`}
                </p>
              </div>
            </div>

            {/* Test Transition Button */}
            <button
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => setIsTransitioning(false), 600);
              }}
              className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Test Transition
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene Transition Overlay */}
      <SceneTransition
        type={transitionType}
        isTransitioning={isTransitioning}
        duration={sceneIntensity === 'calm' ? 800 : sceneIntensity === 'intense' ? 400 : 600}
      />

      {/* Main Stage */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
          style={{
            ...cameraStateToCSS(cameraState, cameraTime),
            background: customBgUrl ? `url(${customBgUrl}) center/cover no-repeat` : bgConfig.gradient,
          }}
        >
          {/* Custom AI Background Image Overlay */}
          {customBgUrl && (
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${customBgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          
          {/* Parallax Background (only show if no custom background) */}
          {!customBgUrl && (
            <ParallaxBackground
              theme={currentScene.background as any}
              season="summer"
              timeOfDay={currentScene.background === 'night' ? 'night' : 'day'}
              animationProgress={sceneProgress / currentScene.duration}
              enableParallax={true}
            />
          )}

          {/* Animated Background Elements (butterflies, birds, etc.) */}
          <AnimatedBackground
            backgroundType={customBgUrl ? 'meadow' : currentScene.background as any}
            season="summer"
            intensity="medium"
          />

          {/* Ground overlay for character placement (subtle, so it doesn't cover scenery) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[22%] pointer-events-none"
            style={{
              background: customBgUrl 
                ? 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)'
                : `linear-gradient(to top, ${bgConfig.groundColor}, transparent)`,
              opacity: 0.7,
            }}
          />

          {/* Layer Effects - Foreground blur (LayerAnimate inspired) */}
          {layerEffectsEnabled && sceneLayers.find(l => l.type === 'foreground') && (
            <div 
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                filter: `blur(${sceneLayers.find(l => l.type === 'foreground')?.blur || 0}px)`,
                opacity: sceneLayers.find(l => l.type === 'foreground')?.opacity || 0.3,
              }}
            >
              {/* Foreground particles/elements would go here */}
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-t from-green-500/20 to-transparent rounded-full transform -translate-x-1/2 translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-t from-green-500/20 to-transparent rounded-full transform translate-x-1/2 translate-y-1/2" />
            </div>
          )}

          {/* Characters */}
          <AnimatePresence mode="sync">
            <motion.div
              key={`chars-${safeSceneIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {currentScene.characters.map((char, idx) => {
                const rig = getCharacterRig(char.rigId);
                if (!rig) return null;

                const isTalking = char.id === talkingCharacterId;
                const mouthShape = characterMouthShapes[char.id];
                
                // Get squash-stretch values (ToonCrafter inspired)
                const squashStretch = smoothAnimationEnabled 
                  ? characterSquash[char.id] || { squash: 1, stretch: 1 }
                  : { squash: 1, stretch: 1 };

                const label = characterRoleLabels
                  ? characterRoleLabels[rig.id.toLowerCase()] || undefined
                  : undefined;

                return (
                  <motion.div
                    key={char.id}
                    initial={{
                      x: char.flipX ? 100 : -100,
                      opacity: 0,
                    }}
                    animate={{
                      x: 0,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.15,
                      type: 'spring',
                      stiffness: 100,
                    }}
                    className="absolute"
                    style={{
                      left: `${char.x}%`,
                      top: `${char.y}%`,
                      transform: 'translate(-50%, -100%)',
                      zIndex: char.zIndex + 10,
                    }}
                  >
                    {/* Squash-stretch wrapper (ToonCrafter inspired) */}
                    <div
                      style={{
                        transform: `scaleX(${squashStretch.stretch}) scaleY(${squashStretch.squash})`,
                        transformOrigin: 'bottom center',
                        transition: 'transform 0.05s ease-out',
                      }}
                    >
                      <RiggedCharacter
                        rig={rig}
                        animation={isTalking ? 'talk' : char.animation}
                        scale={char.scale * 0.8}
                        flipX={char.flipX}
                        expression={char.expression}
                        isTalking={isTalking}
                        showName={!!label}
                        label={label}
                        showExplorerGear={char.outfitExplorer}
                        showBallProp={char.propBall}
                        customColors={char.customColors}
                        customAccessories={char.customAccessories}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Scene Title */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/60 backdrop-blur-md rounded-2xl"
              >
                <p className="text-white font-bold text-xl">{currentScene.title}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Narration Box */}
          <AnimatePresence mode="sync">
            <motion.div
              key={`narration-${safeSceneIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute bottom-6 left-6 right-6"
            >
              <div className="px-8 py-5 bg-black/70 backdrop-blur-md rounded-2xl border border-white/10">
                <p className="text-white text-lg text-center leading-relaxed font-medium">
                  {currentScene.narration}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black to-black/80 px-6 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/50">
            <span>{formatTime(overallProgress)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => goToScene(currentSceneIndex - 1)}
            disabled={currentSceneIndex === 0}
            className="p-3 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>

          <button
            onClick={() => goToScene(currentSceneIndex + 1)}
            disabled={currentSceneIndex === scenes.length - 1}
            className="p-3 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        {/* Scene thumbnails */}
        <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
          {scenes.map((scene, index) => (
            <button
              key={index}
              onClick={() => goToScene(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                safeSceneIndex === index
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span className="text-xs font-medium">Scene {index + 1}</span>
            </button>
          ))}
        </div>
      </div>

      {/* End Screen */}
      <AnimatePresence>
        {isEnded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-6"
              >
                🎬
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">The End!</h3>
              <p className="text-white/70 mb-8">Thanks for watching!</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={restart}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                  <RotateCcw className="w-5 h-5" />
                  Watch Again
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
