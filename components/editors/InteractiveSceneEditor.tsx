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
import RiggedCharacter from '../shared/RiggedCharacter';
import AudioTimeline, { AudioTrack } from '../playback/AudioTimeline';
import CameraKeyframeEditor from './CameraKeyframeEditor';
import { CameraKeyframe, createKeyframe } from '@/lib/animation/camera-keyframes';
import { CharacterRig, CHARACTER_RIGS, getCharacterRig } from '@/lib/utils/sprite-system';
import { ANIMATION_PRESETS } from '@/lib/animation/keyframe-animation';
import { analyzeNarrationForActions } from '@/lib/animation/story-animator';
import { UndoRedoManager, EDIT_ACTIONS, getActionDescription } from '@/lib/utils/undo-redo';
import { SCENE_TEMPLATES, SceneTemplate, applyTemplate } from '@/lib/utils/scene-templates';

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
      className="fixed inset-0 bg-[#0a0a0f] z-50 flex overflow-hidden"
    >
      {/* Left Sidebar - Tools */}
      <div className="w-14 bg-[#12121a] border-r border-white/5 flex flex-col items-center py-3 gap-1">
        <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-all mb-4" title="Close">
          <X className="w-5 h-5 text-gray-400" />
        </button>
        
        <div className="flex-1 flex flex-col items-center gap-1">
          {[
            { id: 'characters', icon: Layers, label: 'Characters' },
            { id: 'scene', icon: Image, label: 'Scene' },
            { id: 'camera', icon: Camera, label: 'Camera' },
            { id: 'timing', icon: Zap, label: 'Timing' },
            { id: 'audio', icon: Music, label: 'Audio' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-2.5 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'hover:bg-white/5 text-gray-500 hover:text-gray-300'
              }`}
              title={tab.label}
            >
              <tab.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-1 pt-2 border-t border-white/5">
          <button onClick={handleUndo} disabled={!canUndo} className={`p-2.5 rounded-xl transition-all ${canUndo ? 'hover:bg-white/5 text-gray-400' : 'text-gray-700'}`} title="Undo">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={handleRedo} disabled={!canRedo} className={`p-2.5 rounded-xl transition-all ${canRedo ? 'hover:bg-white/5 text-gray-400' : 'text-gray-700'}`} title="Redo">
            <Redo2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-[#12121a] border-b border-white/5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={scene.title}
              onChange={(e) => onSceneUpdate({ ...scene, title: e.target.value })}
              className="bg-transparent text-white font-semibold border-none focus:outline-none text-sm"
              placeholder="Scene Title"
            />
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">{(scene.duration / 1000).toFixed(1)}s</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${isPlaying ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Stop' : 'Preview'}
            </button>
            <button onClick={onSave} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all">
              <Save className="w-3.5 h-3.5" />
              Save & Close
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
          {/* Preview Canvas */}
          <div className="flex-1 p-6 flex items-center justify-center bg-[#0a0a0f]">
            <div className="relative">
              {/* Canvas Frame */}
              <div
                ref={stageRef}
                className="relative w-[640px] aspect-video rounded-lg overflow-hidden shadow-2xl cursor-crosshair ring-1 ring-white/10"
                style={{ background: bgConfig.gradient }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedCharacterId(null)}
              >
                {/* Camera Transform */}
                <div
                  className="absolute inset-0 transition-transform duration-300"
                  style={{
                    transform: `scale(${scene.cameraZoom ?? 1}) translate(${-(scene.cameraPanX ?? 0)}%, ${-(scene.cameraPanY ?? 0)}%)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-[22%]" style={{ background: `linear-gradient(to top, ${bgConfig.groundColor}, transparent)`, opacity: 0.8 }} />
                  
                  {scene.background !== 'night' && scene.background !== 'bedroom' && (
                    <div className="absolute top-[10%] right-[15%] w-10 h-10 bg-yellow-200 rounded-full" style={{ boxShadow: '0 0 30px 10px rgba(255, 255, 200, 0.4)' }} />
                  )}

                  {scene.characters.map((char) => {
                    const rig = getCharacterRig(char.rigId);
                    if (!rig) return null;
                    const isSelected = char.id === selectedCharacterId;
                    return (
                      <div
                        key={char.id}
                        className={`absolute cursor-move transition-shadow ${isSelected ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}`}
                        style={{ left: `${char.x}%`, top: `${char.y}%`, transform: 'translate(-50%, -100%)', zIndex: char.zIndex + 10 }}
                        onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, char.id); }}
                        onClick={(e) => { e.stopPropagation(); setSelectedCharacterId(char.id); }}
                      >
                        <RiggedCharacter rig={rig} animation={char.animation} scale={char.scale * 0.8} flipX={char.flipX} expression={char.expression} isTalking={char.isTalking} showExplorerGear={char.outfitExplorer} showBallProp={char.propBall} customColors={char.customColors} customAccessories={char.customAccessories} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Canvas Controls */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a24] rounded-full px-2 py-1.5 ring-1 ring-white/5">
                <button onClick={() => onSceneUpdate({ ...scene, cameraZoom: Math.max(0.5, (scene.cameraZoom ?? 1) - 0.2) })} className="p-1.5 hover:bg-white/5 rounded-full transition-all text-gray-400">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 font-mono w-10 text-center">{((scene.cameraZoom ?? 1) * 100).toFixed(0)}%</span>
                <button onClick={() => onSceneUpdate({ ...scene, cameraZoom: Math.min(2.5, (scene.cameraZoom ?? 1) + 0.2) })} className="p-1.5 hover:bg-white/5 rounded-full transition-all text-gray-400">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={() => onSceneUpdate({ ...scene, cameraZoom: 1, cameraPanX: 0, cameraPanY: 0 })} className="p-1.5 hover:bg-white/5 rounded-full transition-all text-gray-400" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="w-72 bg-[#12121a] border-l border-white/5 flex flex-col">
            {/* Panel Header */}
            <div className="h-10 px-4 flex items-center border-b border-white/5">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {activeTab === 'characters' ? 'Characters' : activeTab === 'scene' ? 'Scene Settings' : activeTab === 'camera' ? 'Camera' : activeTab === 'timing' ? 'Timing' : 'Audio'}
              </span>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeTab === 'characters' && (
                <div className="space-y-3">
                  {/* Add Character */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {CHARACTER_RIGS.map((rig) => (
                      <button
                        key={rig.id}
                        onClick={() => addCharacter(rig.id)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-center group"
                      >
                        <div className="w-6 h-6 rounded-full mx-auto mb-1 ring-2 ring-white/10 group-hover:ring-purple-500/50 transition-all" style={{ backgroundColor: rig.colors.primary }} />
                        <div className="text-[10px] text-gray-400 truncate">{rig.name}</div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Character */}
                  {selectedCharacter && (
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">{selectedCharacter.name}</span>
                        <button onClick={() => removeCharacter(selectedCharacter.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Position */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-500 uppercase">Position</span>
                          <span className="text-[10px] text-gray-600 font-mono">{selectedCharacter.x.toFixed(0)}, {selectedCharacter.y.toFixed(0)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="range" min={5} max={95} value={selectedCharacter.x} onChange={(e) => updateCharacter(selectedCharacter.id, { x: Number(e.target.value) })} className="w-full accent-purple-500 h-1" />
                          <input type="range" min={20} max={90} value={selectedCharacter.y} onChange={(e) => updateCharacter(selectedCharacter.id, { y: Number(e.target.value) })} className="w-full accent-purple-500 h-1" />
                        </div>
                      </div>

                      {/* Scale & Flip */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="text-[10px] text-gray-500 uppercase">Scale</span>
                          <input type="range" min={0.5} max={2} step={0.1} value={selectedCharacter.scale} onChange={(e) => updateCharacter(selectedCharacter.id, { scale: Number(e.target.value) })} className="w-full accent-purple-500 h-1" />
                        </div>
                        <button onClick={() => updateCharacter(selectedCharacter.id, { flipX: !selectedCharacter.flipX })} className={`p-2 rounded-lg transition-all ${selectedCharacter.flipX ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                          <FlipHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Animation */}
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block mb-1.5">Animation</span>
                        <div className="flex flex-wrap gap-1">
                          {ANIMATIONS.slice(0, 8).map((anim) => (
                            <button
                              key={anim}
                              onClick={() => updateCharacter(selectedCharacter.id, { animation: anim })}
                              className={`px-2 py-1 rounded text-[10px] transition-all ${selectedCharacter.animation === anim ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                              {anim}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Expression */}
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block mb-1.5">Expression</span>
                        <div className="flex gap-1">
                          {EXPRESSIONS.map((expr) => (
                            <button
                              key={expr}
                              onClick={() => updateCharacter(selectedCharacter.id, { expression: expr })}
                              className={`flex-1 py-1.5 rounded text-[10px] transition-all ${selectedCharacter.expression === expr ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                              {expr}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scene Characters List */}
                  {scene.characters.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase block mb-2">In Scene</span>
                      <div className="space-y-1">
                        {scene.characters.map((char) => (
                          <button
                            key={char.id}
                            onClick={() => setSelectedCharacterId(char.id)}
                            className={`w-full p-2 rounded-lg text-left flex items-center gap-2 transition-all ${char.id === selectedCharacterId ? 'bg-purple-500/20 ring-1 ring-purple-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                          >
                            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getCharacterRig(char.rigId)?.colors.primary || '#888' }} />
                            <span className="text-xs text-white">{char.name}</span>
                            <span className="text-[10px] text-gray-500 ml-auto">{char.animation}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'scene' && (
                <div className="space-y-3">
                  {/* Background */}
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block mb-2">Background</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(BACKGROUNDS).slice(0, 8).map(([id, bg]) => (
                        <button
                          key={id}
                          onClick={() => onSceneUpdate({ ...scene, background: id })}
                          className={`p-2 rounded-lg transition-all ${scene.background === id ? 'ring-2 ring-purple-500' : 'hover:ring-1 hover:ring-white/20'}`}
                        >
                          <div className="w-full h-8 rounded mb-1" style={{ background: bg.gradient }} />
                          <div className="text-[10px] text-gray-400 capitalize">{id}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Narration */}
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase block mb-2">Narration</span>
                    <textarea
                      value={scene.narration}
                      onChange={(e) => onSceneUpdate({ ...scene, narration: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
                      rows={3}
                      placeholder="Enter narration..."
                    />
                    <button onClick={speakNarration} className="mt-2 w-full px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all">
                      <Volume2 className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>

                  {/* Duration */}
                  <div className="pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">Duration</span>
                      <span className="text-xs text-white font-mono">{(scene.duration / 1000).toFixed(1)}s</span>
                    </div>
                    <input type="range" min={2000} max={15000} step={500} value={scene.duration} onChange={(e) => onSceneUpdate({ ...scene, duration: Number(e.target.value) })} className="w-full accent-purple-500 h-1" />
                  </div>
                </div>
              )}

              {activeTab === 'camera' && (
                <div className="space-y-3">
                  {/* Zoom */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-500 uppercase">Zoom</span>
                      <span className="text-xs text-white font-mono">{((scene.cameraZoom ?? 1) * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min={0.5} max={2.5} step={0.1} value={scene.cameraZoom ?? 1} onChange={(e) => onSceneUpdate({ ...scene, cameraZoom: Number(e.target.value) })} className="w-full accent-purple-500 h-1" />
                  </div>

                  {/* Pan */}
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase block mb-2">Pan Position</span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-4">X</span>
                        <input type="range" min={-50} max={50} value={scene.cameraPanX ?? 0} onChange={(e) => onSceneUpdate({ ...scene, cameraPanX: Number(e.target.value) })} className="flex-1 accent-purple-500 h-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-4">Y</span>
                        <input type="range" min={-50} max={50} value={scene.cameraPanY ?? 0} onChange={(e) => onSceneUpdate({ ...scene, cameraPanY: Number(e.target.value) })} className="flex-1 accent-purple-500 h-1" />
                      </div>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase block mb-2">Shot Presets</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Wide', zoom: 1, x: 0, y: 0 },
                        { label: 'Medium', zoom: 1.3, x: 0, y: -10 },
                        { label: 'Close-up', zoom: 1.8, x: 0, y: -20 },
                        { label: 'Extreme', zoom: 2.2, x: 0, y: -25 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => onSceneUpdate({ ...scene, cameraZoom: preset.zoom, cameraPanX: preset.x, cameraPanY: preset.y })}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'timing' && (
                <div className="space-y-3">
                  <div className="text-center py-6">
                    <div className="text-3xl font-bold text-white mb-1">{(scene.duration / 1000).toFixed(1)}s</div>
                    <div className="text-xs text-gray-500">Scene Duration</div>
                  </div>
                  <input type="range" min={2000} max={15000} step={500} value={scene.duration} onChange={(e) => onSceneUpdate({ ...scene, duration: Number(e.target.value) })} className="w-full accent-purple-500" />
                  
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase block mb-2">Quick Durations</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[3, 5, 7, 10].map((sec) => (
                        <button key={sec} onClick={() => onSceneUpdate({ ...scene, duration: sec * 1000 })} className={`py-2 rounded-lg text-xs transition-all ${scene.duration === sec * 1000 ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase">Narration</span>
                    <button onClick={() => setIsMuted(!isMuted)} className={`p-1.5 rounded transition-all ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400'}`}>
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-gray-300 line-clamp-2">{scene.narration || 'No narration'}</div>
                  </div>
                  <button onClick={speakNarration} className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all">
                    <Play className="w-3.5 h-3.5" />
                    Play Narration
                  </button>
                </div>
              )}
            </div>
          </div>
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
              className="bg-[#12121a] rounded-2xl max-w-3xl w-full max-h-[70vh] overflow-hidden ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-white font-medium">Scene Templates</span>
                <button onClick={() => setShowTemplateModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg transition-all">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
                <div className="grid grid-cols-3 gap-3">
                  {SCENE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        const updatedScene: EditableScene = {
                          ...scene,
                          background: template.background,
                          duration: template.suggestedDuration,
                          characters: scene.characters.map((char, i) => {
                            const pos = template.characterPositions[i];
                            if (pos) {
                              return { ...char, x: pos.x, y: pos.y, scale: pos.scale, flipX: pos.flipX, animation: pos.animation, expression: pos.expression as any };
                            }
                            return char;
                          }),
                        };
                        updateSceneWithHistory(updatedScene, EDIT_ACTIONS.APPLY_TEMPLATE, { template: template.name });
                        setShowTemplateModal(false);
                      }}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all"
                    >
                      <div className="text-white text-sm font-medium mb-1">{template.name}</div>
                      <div className="text-gray-500 text-[10px]">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

