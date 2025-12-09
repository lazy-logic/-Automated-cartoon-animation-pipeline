'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Move,
  RotateCcw,
  FlipHorizontal,
  Smile,
  Play,
  Pause,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  Zap,
  Eye,
  Settings,
  Layers,
  Camera,
  Focus,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Image,
  Undo2,
  Redo2,
  LayoutTemplate,
  Music,
} from 'lucide-react';
import RiggedCharacter from './RiggedCharacter';
import AudioTimeline, { AudioTrack } from './AudioTimeline';
import CameraKeyframeEditor from './CameraKeyframeEditor';
import { CameraKeyframe, createKeyframe } from '@/lib/camera-keyframes';
import { CharacterRig, CHARACTER_RIGS, getCharacterRig } from '@/lib/sprite-system';
import { ANIMATION_PRESETS } from '@/lib/keyframe-animation';
import { analyzeNarrationForActions } from '@/lib/story-animator';
import { UndoRedoManager, EDIT_ACTIONS, getActionDescription } from '@/lib/undo-redo';
import { SCENE_TEMPLATES, SceneTemplate, applyTemplate } from '@/lib/scene-templates';

// Custom character colors from Character Creator
export interface CustomCharacterColors {
  primary: string;
  secondary: string;
  skin: string;
  hair: string;
  eyes: string;
}

// Custom character accessories from Character Creator
export interface CustomCharacterAccessories {
  hat: boolean;
  glasses: boolean;
  cape: boolean;
  wings: boolean;
}

// Scene character for editing
export interface EditableCharacter {
  id: string;
  rigId: string;
  name: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  scale: number;
  flipX: boolean;
  animation: string;
  expression: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry';
  isTalking: boolean;
  zIndex: number;
  // Optional per-scene outfit/prop toggles
  outfitExplorer?: boolean; // e.g. Kiara's explorer gear / backpack
  propBall?: boolean; // e.g. Jayden's soccer ball
  // Custom character creator settings
  customColors?: CustomCharacterColors;
  customAccessories?: CustomCharacterAccessories;
  customOutfit?: string;
  // AI-generated character
  aiGeneratedImage?: string;
  useAICharacter?: boolean;
}

// Editable scene
export interface EditableScene {
  id: string;
  title: string;
  narration: string;
  background: string;
  characters: EditableCharacter[];
  duration: number;
  cameraZoom?: number;
  cameraPanX?: number;
  cameraPanY?: number;
  dialogue?: { speaker: string; text: string }[];
  props?: any[];
  cameraKeyframes?: any[];
}

interface InteractiveSceneEditorProps {
  scene: EditableScene;
  onSceneUpdate: (scene: EditableScene) => void;
  onClose: () => void;
  onSave: () => void;
  characterRoleLabels?: Record<string, string>;
}

// Background configurations - expanded list
const BACKGROUNDS: Record<string, { gradient: string; groundColor: string }> = {
  meadow: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 40%, #90EE90 100%)', groundColor: '#7CFC00' },
  forest: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #228B22 100%)', groundColor: '#228B22' },
  beach: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #87CEEB 40%, #00CED1 60%, #F4A460 100%)', groundColor: '#F4A460' },
  night: { gradient: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', groundColor: '#1a1a2e' },
  bedroom: { gradient: 'linear-gradient(180deg, #E6E6FA 0%, #DDA0DD 50%, #D2B48C 100%)', groundColor: '#D2B48C' },
  park: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #90EE90 100%)', groundColor: '#7CFC00' },
  castle: { gradient: 'linear-gradient(180deg, #B0C4DE 0%, #778899 50%, #696969 100%)', groundColor: '#808080' },
  space: { gradient: 'linear-gradient(180deg, #000428 0%, #004e92 50%, #000428 100%)', groundColor: '#1a1a2e' },
  underwater: { gradient: 'linear-gradient(180deg, #00CED1 0%, #008B8B 50%, #006666 100%)', groundColor: '#004d4d' },
  mountain: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0C4DE 40%, #8B7355 100%)', groundColor: '#6B4423' },
  city: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #B0C4DE 60%, #708090 100%)', groundColor: '#505050' },
  farm: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #F5DEB3 50%, #DAA520 100%)', groundColor: '#8B4513' },
  playground: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 50%, #90EE90 100%)', groundColor: '#228B22' },
  library: { gradient: 'linear-gradient(180deg, #DEB887 0%, #D2B48C 50%, #8B4513 100%)', groundColor: '#654321' },
  kitchen: { gradient: 'linear-gradient(180deg, #FFFAF0 0%, #FFF8DC 50%, #FAEBD7 100%)', groundColor: '#D2B48C' },
  garden: { gradient: 'linear-gradient(180deg, #87CEEB 0%, #98FB98 50%, #228B22 100%)', groundColor: '#006400' },
};

const EXPRESSIONS = ['neutral', 'happy', 'sad', 'surprised', 'angry'] as const;
const ANIMATIONS = ['idle', 'walk', 'run', 'wave', 'jump', 'talk', 'sit', 'dance', 'surprised', 'sad', 'sleep', 'eat', 'read', 'play', 'think', 'laugh', 'cry'] as const;

export default function InteractiveSceneEditor({
  scene,
  onSceneUpdate,
  onClose,
  onSave,
  characterRoleLabels,
}: InteractiveSceneEditorProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'characters' | 'scene' | 'camera' | 'timing' | 'audio'>('characters');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Audio timeline state
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(() => {
    // Initialize with a narration track based on scene narration
    if (scene.narration) {
      return [{
        id: 'narration-main',
        name: 'Narration',
        type: 'narration' as const,
        text: scene.narration,
        startTime: 0,
        duration: Math.min(scene.duration * 0.8, 5000),
        volume: 1,
        muted: false,
        locked: false,
        color: '#3B82F6',
      }];
    }
    return [];
  });
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Camera keyframes state
  const [cameraKeyframes, setCameraKeyframes] = useState<CameraKeyframe[]>(() => [
    createKeyframe(0, scene.cameraZoom ?? 1, scene.cameraPanX ?? 0, scene.cameraPanY ?? 0, 0, 'ease-out'),
  ]);
  const [cameraCurrentTime, setCameraCurrentTime] = useState(0);
  
  // Undo/Redo system
  const undoManagerRef = useRef<UndoRedoManager<EditableScene> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Initialize undo manager
  useEffect(() => {
    undoManagerRef.current = new UndoRedoManager(scene, { maxHistory: 50, debounceMs: 300 });
    undoManagerRef.current.onHistoryChange = (undo, redo) => {
      setCanUndo(undo);
      setCanRedo(redo);
    };
    return () => { undoManagerRef.current = null; };
  }, []);
  
  // Track scene changes for undo
  const updateSceneWithHistory = useCallback((newScene: EditableScene, action: string, details?: Record<string, any>) => {
    undoManagerRef.current?.pushState(newScene, action, getActionDescription(action as any, details));
    onSceneUpdate(newScene);
  }, [onSceneUpdate]);
  
  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const prevState = undoManagerRef.current?.undo();
    if (prevState) onSceneUpdate(prevState);
  }, [onSceneUpdate]);
  
  const handleRedo = useCallback(() => {
    const nextState = undoManagerRef.current?.redo();
    if (nextState) onSceneUpdate(nextState);
  }, [onSceneUpdate]);
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const selectedCharacter = scene.characters.find(c => c.id === selectedCharacterId);
  const bgConfig = BACKGROUNDS[scene.background] || BACKGROUNDS.meadow;
  const narrationAnalysis = analyzeNarrationForActions(scene.narration || '');
  const primarySuggestion = narrationAnalysis[0];

  // Handle character drag
  const handleMouseDown = useCallback((e: React.MouseEvent, characterId: string) => {
    e.preventDefault();
    setSelectedCharacterId(characterId);
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedCharacterId || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(20, Math.min(90, y));

    onSceneUpdate({
      ...scene,
      characters: scene.characters.map(c =>
        c.id === selectedCharacterId ? { ...c, x: clampedX, y: clampedY } : c
      ),
    });
  }, [isDragging, selectedCharacterId, scene, onSceneUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Update character property
  const updateCharacter = (characterId: string, updates: Partial<EditableCharacter>) => {
    onSceneUpdate({
      ...scene,
      characters: scene.characters.map(c =>
        c.id === characterId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleResyncActing = useCallback(() => {
    if (!scene.narration) return;

    const analysis = analyzeNarrationForActions(scene.narration || '');
    const suggestion = analysis[0];
    if (!suggestion) return;

    const enhancedCharacters = scene.characters.map((char, index) => {
      if (index === 0) {
        return {
          ...char,
          animation: suggestion.suggestedAction,
          expression: suggestion.suggestedExpression as any,
          isTalking: suggestion.isTalking,
        };
      }

      return {
        ...char,
        animation: suggestion.isTalking ? 'idle' : char.animation,
        expression: suggestion.suggestedExpression === 'happy' ? 'happy' : char.expression,
      };
    });

    onSceneUpdate({
      ...scene,
      characters: enhancedCharacters,
    });
  }, [scene, onSceneUpdate]);

  // Add character to scene
  const addCharacter = (rigId: string) => {
    const rig = getCharacterRig(rigId);
    if (!rig) return;

    const newCharacter: EditableCharacter = {
      id: `char-${Date.now()}`,
      rigId: rig.id,
      name: rig.name,
      x: 50,
      y: 70,
      scale: 1,
      flipX: false,
      animation: 'idle',
      expression: 'neutral',
      isTalking: false,
      zIndex: scene.characters.length,
      outfitExplorer: rig.id.toLowerCase() === 'kiara',
      propBall: rig.id.toLowerCase() === 'jayden',
    };

    onSceneUpdate({
      ...scene,
      characters: [...scene.characters, newCharacter],
    });
    setSelectedCharacterId(newCharacter.id);
  };

  // Remove character
  const removeCharacter = (characterId: string) => {
    onSceneUpdate({
      ...scene,
      characters: scene.characters.filter(c => c.id !== characterId),
    });
    if (selectedCharacterId === characterId) {
      setSelectedCharacterId(null);
    }
  };

  // Speak narration
  const speakNarration = useCallback(() => {
    if (isMuted || !scene.narration) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(scene.narration);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    // Set talking state for characters
    onSceneUpdate({
      ...scene,
      characters: scene.characters.map(c => ({ ...c, isTalking: true })),
    });
    
    utterance.onend = () => {
      onSceneUpdate({
        ...scene,
        characters: scene.characters.map(c => ({ ...c, isTalking: false })),
      });
    };
    
    window.speechSynthesis.speak(utterance);
  }, [scene, isMuted, onSceneUpdate]);

  // Toggle play/preview
  const togglePlay = () => {
    if (!isPlaying) {
      speakNarration();
    } else {
      window.speechSynthesis.cancel();
      onSceneUpdate({
        ...scene,
        characters: scene.characters.map(c => ({ ...c, isTalking: false })),
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex"
    >
      {/* Main Stage Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <input
                type="text"
                value={scene.title}
                onChange={(e) => onSceneUpdate({ ...scene, title: e.target.value })}
                className="bg-transparent text-white font-bold text-lg border-none focus:outline-none focus:ring-0"
                placeholder="Scene Title"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 mr-2 border-r border-gray-700 pr-3">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-colors ${
                  canUndo ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-colors ${
                  canRedo ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Template Picker */}
            <button
              onClick={() => setShowTemplateModal(true)}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              title="Apply Scene Template"
            >
              <LayoutTemplate className="w-5 h-5 text-white" />
            </button>
            
            {/* Playback Controls */}
            <button
              onClick={togglePlay}
              className={`p-2.5 rounded-lg transition-colors ${
                isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="flex-1 p-6 flex items-center justify-center bg-gray-800">
          <div
            ref={stageRef}
            className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-crosshair"
            style={{ background: bgConfig.gradient }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedCharacterId(null)}
          >
            {/* Camera Transform Container - applies zoom and pan */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{
                transform: `scale(${scene.cameraZoom ?? 1}) translate(${-(scene.cameraPanX ?? 0)}%, ${-(scene.cameraPanY ?? 0)}%)`,
                transformOrigin: 'center center',
              }}
            >
            {/* Ground (subtle gradient so it doesn't feel like a solid block) */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[22%]"
              style={{
                background: `linear-gradient(to top, ${bgConfig.groundColor}, transparent)`,
                opacity: 0.8,
              }}
            />

            {/* Sun/Moon */}
            {scene.background !== 'night' && scene.background !== 'bedroom' && (
              <div
                className="absolute top-[10%] right-[15%] w-16 h-16 bg-yellow-200 rounded-full"
                style={{ boxShadow: '0 0 60px 20px rgba(255, 255, 200, 0.5)' }}
              />
            )}
            {scene.background === 'night' && (
              <>
                <div
                  className="absolute top-[10%] right-[15%] w-12 h-12 bg-yellow-100 rounded-full"
                  style={{ boxShadow: '0 0 30px 8px rgba(255, 255, 200, 0.3)' }}
                />
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      top: `${10 + (i * 5) % 40}%`,
                      left: `${5 + (i * 11) % 90}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </>
            )}

            {/* Characters */}
            {scene.characters.map((char) => {
              const rig = getCharacterRig(char.rigId);
              if (!rig) return null;

              const isSelected = char.id === selectedCharacterId;

              return (
                <div
                  key={char.id}
                  className={`absolute cursor-move transition-all ${
                    isSelected ? 'ring-4 ring-purple-500 ring-offset-2 ring-offset-transparent rounded-lg' : ''
                  }`}
                  style={{
                    left: `${char.x}%`,
                    top: `${char.y}%`,
                    transform: 'translate(-50%, -100%)',
                    zIndex: char.zIndex + 10,
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, char.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCharacterId(char.id);
                  }}
                >
                  <RiggedCharacter
                    rig={rig}
                    animation={char.animation}
                    scale={char.scale}
                    flipX={char.flipX}
                    expression={char.expression}
                    isTalking={char.isTalking}
                    showExplorerGear={char.outfitExplorer}
                    showBallProp={char.propBall}
                    customColors={char.customColors}
                    customAccessories={char.customAccessories}
                  />
                  {isSelected && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-purple-500 text-white text-xs rounded-full whitespace-nowrap">
                      {(characterRoleLabels && characterRoleLabels[char.rigId.toLowerCase()]) || char.name}
                    </div>
                  )}
                </div>
              );
            })}

            </div>{/* End Camera Transform Container */}

            {/* Narration Box - outside camera transform so it stays fixed */}
            {scene.narration && (
              <div className="absolute bottom-4 left-4 right-4 px-6 py-4 bg-black/70 backdrop-blur-sm rounded-2xl z-50">
                <p className="text-white text-center leading-relaxed">{scene.narration}</p>
              </div>
            )}

            {/* Camera info overlay */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 rounded-lg text-[10px] text-white/70 font-mono z-50">
              📷 {(scene.cameraZoom ?? 1).toFixed(1)}x | Pan: {scene.cameraPanX ?? 0}, {scene.cameraPanY ?? 0}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-gray-900 border-t border-gray-700 px-4 py-3">
          <div className="flex items-center gap-4">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-sm">Duration:</span>
            <input
              type="range"
              min={2000}
              max={15000}
              step={500}
              value={scene.duration}
              onChange={(e) => onSceneUpdate({ ...scene, duration: Number(e.target.value) })}
              className="flex-1 accent-purple-500"
            />
            <span className="text-white font-mono text-sm w-16">
              {(scene.duration / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'characters', label: 'Characters', icon: Layers },
            { id: 'scene', label: 'Scene', icon: Image },
            { id: 'camera', label: 'Camera', icon: Camera },
            { id: 'timing', label: 'Timing', icon: Zap },
            { id: 'audio', label: 'Audio', icon: Music },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'characters' && (
            <div className="space-y-4">
              {/* Add Character */}
              <div>
                <h3 className="text-white font-medium mb-2">Add Character</h3>
                <div className="grid grid-cols-2 gap-2">
                  {CHARACTER_RIGS.map((rig) => (
                    <button
                      key={rig.id}
                      onClick={() => addCharacter(rig.id)}
                      className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-full mb-2"
                        style={{ backgroundColor: rig.colors.primary }}
                      />
                      <div className="text-white text-sm font-medium">{rig.name}</div>
                      <div className="text-gray-500 text-xs">{rig.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Character Controls */}
              {selectedCharacter && (
                <div className="space-y-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{selectedCharacter.name}</h3>
                    <button
                      onClick={() => removeCharacter(selectedCharacter.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Position */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 text-xs flex items-center gap-1 mb-1">
                        <Move className="w-3 h-3" /> X Position
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={selectedCharacter.x}
                        onChange={(e) =>
                          updateCharacter(selectedCharacter.id, { x: Number(e.target.value) })
                        }
                        className="w-full accent-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Y Position</label>
                      <input
                        type="range"
                        min={20}
                        max={90}
                        value={selectedCharacter.y}
                        onChange={(e) =>
                          updateCharacter(selectedCharacter.id, { y: Number(e.target.value) })
                        }
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Scale */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Scale: {selectedCharacter.scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={selectedCharacter.scale}
                      onChange={(e) =>
                        updateCharacter(selectedCharacter.id, { scale: Number(e.target.value) })
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  {/* Flip */}
                  <button
                    onClick={() =>
                      updateCharacter(selectedCharacter.id, { flipX: !selectedCharacter.flipX })
                    }
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCharacter.flipX
                        ? 'bg-purple-500/30 text-purple-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    Flip Horizontal
                  </button>

                  {/* Animation */}
                  <div>
                    <label className="text-gray-400 text-xs mb-2 block">Animation</label>
                    <div className="grid grid-cols-3 gap-1">
                      {ANIMATIONS.map((anim) => (
                        <button
                          key={anim}
                          onClick={() => updateCharacter(selectedCharacter.id, { animation: anim })}
                          className={`px-2 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                            selectedCharacter.animation === anim
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expression */}
                  <div>
                    <div className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                      <Smile className="w-3 h-3" /> Expression
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {EXPRESSIONS.map((expr) => (
                        <button
                          key={expr}
                          onClick={() => updateCharacter(selectedCharacter.id, { expression: expr })}
                          className={`px-2 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                            selectedCharacter.expression === expr
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {expr}
                        </button>
                      ))}
                    </div>
                    {primarySuggestion && (
                      <div className="mt-1 text-[11px] text-purple-300">
                        Suggested: {primarySuggestion.suggestedAction} 
                        
                        <span className="mx-1">•</span>
                        {primarySuggestion.suggestedExpression}
                        <button
                          onClick={() =>
                            updateCharacter(selectedCharacter.id, {
                              animation: primarySuggestion.suggestedAction,
                              expression: primarySuggestion.suggestedExpression as any,
                              isTalking: primarySuggestion.isTalking,
                            })
                          }
                          className="ml-2 px-2 py-0.5 rounded-full bg-purple-600/60 text-[10px] text-white hover:bg-purple-600"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Outfit & Props (per-scene) */}
                  {(() => {
                    const rig = getCharacterRig(selectedCharacter.rigId);
                    if (!rig) return null;
                    const rigId = rig.id.toLowerCase();
                    const isKiara = rigId === 'kiara';
                    const isJayden = rigId === 'jayden';
                    if (!isKiara && !isJayden) return null;

                    const explorerOn =
                      selectedCharacter.outfitExplorer ?? isKiara;
                    const ballOn = selectedCharacter.propBall ?? isJayden;

                    return (
                      <div className="mt-2 space-y-2">
                        <div className="text-gray-500 text-xs mb-1">Outfit & Props</div>
                        {isKiara && (
                          <button
                            onClick={() =>
                              updateCharacter(selectedCharacter.id, {
                                outfitExplorer: !explorerOn,
                              })
                            }
                            className={`w-full px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              explorerOn
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <span>Explorer gear</span>
                            <span className="text-[10px] uppercase tracking-wide">
                              {explorerOn ? 'On' : 'Off'}
                            </span>
                          </button>
                        )}
                        {isJayden && (
                          <button
                            onClick={() =>
                              updateCharacter(selectedCharacter.id, {
                                propBall: !ballOn,
                              })
                            }
                            className={`w-full px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              ballOn
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <span>Soccer ball</span>
                            <span className="text-[10px] uppercase tracking-wide">
                              {ballOn ? 'On' : 'Off'}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Character List */}
              {scene.characters.length > 0 && (
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-white font-medium mb-2">Scene Characters</h3>
                  <div className="space-y-2">
                    {scene.characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => setSelectedCharacterId(char.id)}
                        className={`w-full p-3 rounded-xl text-left transition-colors flex items-center gap-3 ${
                          char.id === selectedCharacterId
                            ? 'bg-purple-500/30 border border-purple-500'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{
                            backgroundColor: getCharacterRig(char.rigId)?.colors.primary || '#888',
                          }}
                        />
                        <div>
                          <div className="text-white text-sm font-medium">
                            {(characterRoleLabels && characterRoleLabels[char.rigId.toLowerCase()]) || char.name}
                          </div>
                          <div className="text-gray-500 text-xs capitalize">{char.animation}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scene' && (
            <div className="space-y-4">
              {/* Background */}
              <div>
                <h3 className="text-white font-medium mb-2">Background</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(BACKGROUNDS).map(([id, bg]) => (
                    <button
                      key={id}
                      onClick={() => onSceneUpdate({ ...scene, background: id })}
                      className={`p-3 rounded-xl transition-colors ${
                        scene.background === id
                          ? 'ring-2 ring-purple-500'
                          : 'hover:ring-2 hover:ring-gray-600'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-lg mb-2"
                        style={{ background: bg.gradient }}
                      />
                      <div className="text-white text-xs capitalize">{id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Narration */}
              <div>
                <h3 className="text-white font-medium mb-2">Narration</h3>
                <textarea
                  value={scene.narration}
                  onChange={(e) => onSceneUpdate({ ...scene, narration: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Enter narration text..."
                />
                <button
                  onClick={speakNarration}
                  className="mt-2 w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Preview Narration
                </button>
                <button
                  onClick={handleResyncActing}
                  className="mt-2 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  Re-sync acting to narration
                </button>
              </div>

              {scene.dialogue && scene.dialogue.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 mt-4">Dialogue Acting Presets</h3>
                  <div className="space-y-2">
                    {scene.dialogue.map((line, index) => {
                      const text = line.text || '';
                      if (!text.trim()) return null;
                      const analysis = analyzeNarrationForActions(text);
                      const suggestion = analysis[0];
                      const speakerName = (line.speaker || '').toLowerCase();
                      const targetChar = scene.characters.find(
                        (c) => c.name.toLowerCase() === speakerName
                      ) || scene.characters[0];

                      return (
                        <div key={index} className="p-2 bg-gray-800 rounded-lg text-xs text-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-white">{line.speaker || 'Narrator'}</span>
                            {targetChar && suggestion && (
                              <button
                                onClick={() =>
                                  updateCharacter(targetChar.id, {
                                    animation: suggestion.suggestedAction,
                                    expression: suggestion.suggestedExpression as any,
                                    isTalking: suggestion.isTalking,
                                  })
                                }
                                className="px-2 py-0.5 rounded-full bg-purple-600/70 text-[10px] text-white hover:bg-purple-600"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                          <div className="text-gray-300 truncate mb-1">{text}</div>
                          {suggestion && (
                            <div className="text-[11px] text-purple-300">
                              Suggested: {suggestion.suggestedAction}
                              <span className="mx-1">•</span>
                              {suggestion.suggestedExpression}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {activeTab === 'camera' && (
            <div className="space-y-4">
              {/* Camera Preview */}
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Camera Settings
                  </h3>
                  <button
                    onClick={() => onSceneUpdate({ ...scene, cameraZoom: 1, cameraPanX: 0, cameraPanY: 0 })}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
                
                {/* Visual camera indicator */}
                <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
                  <div 
                    className="absolute inset-0 border-2 border-purple-500/50 transition-all duration-300"
                    style={{
                      transform: `scale(${1/(scene.cameraZoom ?? 1)}) translate(${(scene.cameraPanX ?? 0) * (scene.cameraZoom ?? 1)}%, ${(scene.cameraPanY ?? 0) * (scene.cameraZoom ?? 1)}%)`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Focus className="w-6 h-6 text-purple-400/50" />
                  </div>
                  <div className="absolute bottom-1 right-1 text-[10px] text-gray-500 font-mono">
                    {(scene.cameraZoom ?? 1).toFixed(1)}x
                  </div>
                </div>
              </div>

              {/* Zoom Control */}
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-300 text-sm flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    Zoom
                  </label>
                  <span className="text-purple-400 font-mono text-sm">{(scene.cameraZoom ?? 1).toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSceneUpdate({ ...scene, cameraZoom: Math.max(0.5, (scene.cameraZoom ?? 1) - 0.1) })}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-300" />
                  </button>
                  <input
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={scene.cameraZoom ?? 1}
                    onChange={(e) => onSceneUpdate({ ...scene, cameraZoom: Number(e.target.value) })}
                    className="flex-1 accent-purple-500"
                  />
                  <button
                    onClick={() => onSceneUpdate({ ...scene, cameraZoom: Math.min(2.5, (scene.cameraZoom ?? 1) + 0.1) })}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Pan Controls */}
              <div className="p-4 bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-gray-300 text-sm flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Pan Position
                  </label>
                  <span className="text-gray-500 font-mono text-xs">
                    X: {scene.cameraPanX ?? 0} | Y: {scene.cameraPanY ?? 0}
                  </span>
                </div>
                
                {/* Pan grid control */}
                <div className="relative w-full aspect-square max-w-[160px] mx-auto bg-gray-900 rounded-lg mb-3">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {[
                      { x: -25, y: -25 }, { x: 0, y: -25 }, { x: 25, y: -25 },
                      { x: -25, y: 0 }, { x: 0, y: 0 }, { x: 25, y: 0 },
                      { x: -25, y: 25 }, { x: 0, y: 25 }, { x: 25, y: 25 },
                    ].map((pos, i) => (
                      <button
                        key={i}
                        onClick={() => onSceneUpdate({ ...scene, cameraPanX: pos.x, cameraPanY: pos.y })}
                        className={`border border-gray-700 hover:bg-purple-500/30 transition-colors ${
                          scene.cameraPanX === pos.x && scene.cameraPanY === pos.y
                            ? 'bg-purple-500/50'
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  {/* Current position indicator */}
                  <div
                    className="absolute w-3 h-3 bg-purple-500 rounded-full border-2 border-white pointer-events-none transition-all duration-200"
                    style={{
                      left: `${50 + (scene.cameraPanX ?? 0)}%`,
                      top: `${50 + (scene.cameraPanY ?? 0)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>

                {/* Fine-tune sliders */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-8">X:</span>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={scene.cameraPanX ?? 0}
                      onChange={(e) => onSceneUpdate({ ...scene, cameraPanX: Number(e.target.value) })}
                      className="flex-1 accent-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-8">Y:</span>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={scene.cameraPanY ?? 0}
                      onChange={(e) => onSceneUpdate({ ...scene, cameraPanY: Number(e.target.value) })}
                      className="flex-1 accent-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shot Presets */}
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Shot Presets
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'wide', label: 'Wide Shot', desc: 'Full scene', zoom: 1, panX: 0, panY: 0, icon: '🎬' },
                    { id: 'medium', label: 'Medium', desc: 'Waist up', zoom: 1.3, panX: 0, panY: -10, icon: '👤' },
                    { id: 'closeup', label: 'Close-up', desc: 'Face focus', zoom: 1.8, panX: 0, panY: -20, icon: '😊' },
                    { id: 'extreme', label: 'Extreme CU', desc: 'Eyes/detail', zoom: 2.2, panX: 0, panY: -25, icon: '👁️' },
                    { id: 'over-shoulder', label: 'Over Shoulder', desc: 'Dialogue', zoom: 1.4, panX: 20, panY: -5, icon: '💬' },
                    { id: 'low-angle', label: 'Low Angle', desc: 'Powerful', zoom: 1.2, panX: 0, panY: 15, icon: '⬆️' },
                    { id: 'high-angle', label: 'High Angle', desc: 'Vulnerable', zoom: 1.2, panX: 0, panY: -15, icon: '⬇️' },
                    { id: 'dutch', label: 'Dutch Tilt', desc: 'Tension', zoom: 1.1, panX: 10, panY: -5, icon: '↗️' },
                  ].map((preset) => {
                    const isActive = 
                      Math.abs((scene.cameraZoom ?? 1) - preset.zoom) < 0.05 &&
                      Math.abs((scene.cameraPanX ?? 0) - preset.panX) < 3 &&
                      Math.abs((scene.cameraPanY ?? 0) - preset.panY) < 3;
                    
                    return (
                      <button
                        key={preset.id}
                        onClick={() =>
                          onSceneUpdate({
                            ...scene,
                            cameraZoom: preset.zoom,
                            cameraPanX: preset.panX,
                            cameraPanY: preset.panY,
                          })
                        }
                        className={`p-3 rounded-xl text-left transition-all ${
                          isActive
                            ? 'bg-purple-500/30 ring-2 ring-purple-500'
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{preset.icon}</span>
                          <span className="text-white text-sm font-medium">{preset.label}</span>
                        </div>
                        <div className="text-gray-400 text-[10px]">{preset.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus on Character */}
              {scene.characters.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Focus className="w-4 h-4" />
                    Focus on Character
                  </h3>
                  <div className="space-y-2">
                    {scene.characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => {
                          // Calculate pan to center on character
                          const panX = 50 - char.x;
                          const panY = 50 - char.y;
                          onSceneUpdate({
                            ...scene,
                            cameraZoom: 1.5,
                            cameraPanX: Math.max(-50, Math.min(50, panX)),
                            cameraPanY: Math.max(-50, Math.min(50, panY)),
                          });
                        }}
                        className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors flex items-center gap-3"
                      >
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: getCharacterRig(char.rigId)?.colors.primary || '#888' }}
                        />
                        <div>
                          <div className="text-white text-sm">{char.name}</div>
                          <div className="text-gray-500 text-xs">Position: {char.x.toFixed(0)}%, {char.y.toFixed(0)}%</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Camera Keyframe Animation */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Camera Animation
                </h3>
                <p className="text-gray-400 text-xs mb-3">
                  Add keyframes to animate camera movement during the scene.
                </p>
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <CameraKeyframeEditor
                    keyframes={cameraKeyframes}
                    duration={scene.duration}
                    currentTime={cameraCurrentTime}
                    onKeyframesChange={(newKeyframes) => {
                      setCameraKeyframes(newKeyframes);
                      // Apply first keyframe values to scene if exists
                      if (newKeyframes.length > 0) {
                        const first = newKeyframes[0];
                        onSceneUpdate({
                          ...scene,
                          cameraZoom: first.zoom,
                          cameraPanX: first.panX,
                          cameraPanY: first.panY,
                        });
                      }
                    }}
                    onSeek={setCameraCurrentTime}
                    onPreview={(state) => {
                      // Live preview camera state
                      onSceneUpdate({
                        ...scene,
                        cameraZoom: state.zoom,
                        cameraPanX: state.panX,
                        cameraPanY: state.panY,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timing' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">Scene Duration</h3>
                <div className="p-4 bg-gray-800 rounded-xl">
                  <div className="text-3xl font-bold text-white text-center mb-2">
                    {(scene.duration / 1000).toFixed(1)}s
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={15000}
                    step={500}
                    value={scene.duration}
                    onChange={(e) => onSceneUpdate({ ...scene, duration: Number(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Animation Presets</h3>
                <div className="space-y-2">
                  {Object.keys(ANIMATION_PRESETS).slice(0, 8).map((preset) => (
                    <div
                      key={preset}
                      className="p-3 bg-gray-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-white text-sm capitalize">{preset}</div>
                        <div className="text-gray-500 text-xs">
                          {ANIMATION_PRESETS[preset].duration}ms
                          {ANIMATION_PRESETS[preset].loop && ' • Loop'}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedCharacter) {
                            updateCharacter(selectedCharacter.id, { animation: preset });
                          }
                        }}
                        disabled={!selectedCharacter}
                        className="px-3 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Audio Timeline
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  Drag tracks to reposition. Click timeline to seek.
                </p>
              </div>
              
              {/* Embedded Audio Timeline */}
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <AudioTimeline
                  tracks={audioTracks}
                  duration={scene.duration}
                  currentTime={audioCurrentTime}
                  isPlaying={isAudioPlaying}
                  onTracksChange={setAudioTracks}
                  onSeek={setAudioCurrentTime}
                  onPlayPause={() => setIsAudioPlaying(!isAudioPlaying)}
                />
              </div>
              
              {/* Quick Add Tracks */}
              <div className="p-3 bg-gray-800 rounded-xl">
                <div className="text-white text-sm font-medium mb-2">Quick Add</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['narration', 'music', 'sfx', 'ambient'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        const newTrack: AudioTrack = {
                          id: `${type}-${Date.now()}`,
                          name: type === 'narration' ? 'Narration' : type === 'music' ? 'Background Music' : type === 'sfx' ? 'Sound Effect' : 'Ambient',
                          type,
                          text: type === 'narration' ? scene.narration : undefined,
                          startTime: 0,
                          duration: type === 'sfx' ? 1000 : Math.min(scene.duration * 0.8, 5000),
                          volume: type === 'ambient' ? 0.3 : 0.8,
                          muted: false,
                          locked: false,
                          color: type === 'narration' ? '#3B82F6' : type === 'music' ? '#8B5CF6' : type === 'sfx' ? '#F59E0B' : '#10B981',
                        };
                        setAudioTracks([...audioTracks, newTrack]);
                      }}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 capitalize transition-colors"
                    >
                      + {type}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Current narration info */}
              <div className="p-3 bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">Scene Narration</span>
                  <span className="text-green-400 text-xs">{audioTracks.filter(t => t.type === 'narration').length} track(s)</span>
                </div>
                <div className="text-gray-400 text-xs truncate">{scene.narration || 'No narration'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scene Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5" />
                  Scene Templates
                </h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                {/* Template Categories */}
                {(['dialogue', 'action', 'emotion', 'transition', 'establishing'] as const).map((category) => {
                  const categoryTemplates = SCENE_TEMPLATES.filter(t => t.category === category);
                  if (categoryTemplates.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-6">
                      <h3 className="text-white font-medium mb-3 capitalize flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{
                          backgroundColor: {
                            dialogue: '#3B82F6',
                            action: '#EF4444',
                            emotion: '#F59E0B',
                            transition: '#8B5CF6',
                            establishing: '#10B981',
                          }[category]
                        }} />
                        {category} Scenes
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoryTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              // Apply template positions to current scene characters
                              const updatedScene: EditableScene = {
                                ...scene,
                                background: template.background,
                                duration: template.suggestedDuration,
                                characters: scene.characters.map((char, i) => {
                                  const pos = template.characterPositions[i];
                                  if (pos) {
                                    return {
                                      ...char,
                                      x: pos.x,
                                      y: pos.y,
                                      scale: pos.scale,
                                      flipX: pos.flipX,
                                      animation: pos.animation,
                                      expression: pos.expression as any,
                                    };
                                  }
                                  return char;
                                }),
                              };
                              
                              updateSceneWithHistory(updatedScene, EDIT_ACTIONS.APPLY_TEMPLATE, { template: template.name });
                              setShowTemplateModal(false);
                            }}
                            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-all hover:ring-2 hover:ring-purple-500"
                          >
                            <div className="text-2xl mb-2">
                              {category === 'dialogue' ? '💬' : category === 'action' ? '🏃' : category === 'emotion' ? '😊' : category === 'transition' ? '🎬' : '🏞️'}
                            </div>
                            <div className="text-white font-medium text-sm">{template.name}</div>
                            <div className="text-gray-400 text-xs mt-1">{template.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-gray-700 rounded text-[10px] text-gray-300">
                                {template.characterPositions.length} char
                              </span>
                              <span className="px-2 py-0.5 bg-gray-700 rounded text-[10px] text-gray-300 capitalize">
                                {template.background}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
