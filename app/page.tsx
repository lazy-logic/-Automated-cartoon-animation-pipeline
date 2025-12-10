'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Sparkles, 
  Wand2, 
  Play, 
  Download,
  Save,
  FolderOpen,
  Loader2,
  Plus,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Maximize2,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  X,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  Clock,
  Users,
  Image,
  Mic,
  LayoutTemplate,
  Copy,
  GripVertical,
  Keyboard,
  Share2,
  FileImage,
  AlertTriangle,
  PlusCircle,
  HelpCircle,
  Music,
  Globe,
  Undo2,
  Redo2,
} from 'lucide-react';
import StoryGenerator from '@/components/modals/StoryGenerator';
import EnhancedPlaybackViewer from '@/components/playback/EnhancedPlaybackViewer';
import InteractiveSceneEditor, { EditableScene } from '@/components/editors/InteractiveSceneEditor';
import VideoExporter from '@/components/modals/VideoExporter';
import RiggedCharacter from '@/components/shared/RiggedCharacter';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import ParallaxBackground from '@/components/shared/ParallaxBackground';
import { getCharacterRig, CHARACTER_RIGS } from '@/lib/utils/sprite-system';
import { storyToEditableScenes, autoEnhanceScene, applyAutoDurations, aiSceneToEditableScene } from '@/lib/animation/story-animator';
import type { AIStoryResponse } from '@/lib/ai/ai-types';
import { VideoExportEngine, editableSceneToRenderData, type ExportProgress } from '@/lib/export/video-export-engine';
import TTSSettingsPanel from '@/components/modals/TTSSettingsPanel';
import { SCENE_TEMPLATES, applyTemplate } from '@/lib/utils/scene-templates';
import CharacterCreatorModal from '@/components/modals/CharacterCreatorModal';
import KeyboardShortcutsPanel from '@/components/modals/KeyboardShortcutsPanel';
import SettingsPanel from '@/components/modals/SettingsPanel';
import CollaborationPanel from '@/components/modals/CollaborationPanel';
import { TransitionConfig, createDefaultTransition, TRANSITION_PRESETS } from '@/lib/utils/scene-transitions';
import TransitionPicker from '@/components/ui/TransitionPicker';
import { AutoSaveManager, loadProjectLocally, formatTimeAgo } from '@/lib/utils/auto-save';
import { copyToClipboard, generateSceneThumbnail } from '@/lib/export/gif-export';
import { suggestNextScene, analyzeEmotion, suggestBackgrounds } from '@/lib/ai/ai-suggestions';
import OnboardingTour from '@/components/ui/OnboardingTour';
import { continueStory } from '@/lib/ai/ai-story-generator';
import StoryStarters, { StoryStarter } from '@/components/ui/StoryStarters';
import MusicPlayer from '@/components/ui/MusicPlayer';
import { LanguageSelector, useMultiLanguageTTS } from '@/components/ui/LanguageSelector';
import UndoRedoToolbar, { useUndoRedo } from '@/components/ui/UndoRedoToolbar';
import SpeechBubble from '@/components/shared/SpeechBubble';
import { useToast } from '@/components/ui/Toast';

// Background configurations
const BACKGROUNDS = [
  { id: 'meadow', name: 'Sunny Meadow', color: '#90EE90' },
  { id: 'forest', name: 'Magical Forest', color: '#228B22' },
  { id: 'beach', name: 'Sandy Beach', color: '#F4A460' },
  { id: 'night', name: 'Starry Night', color: '#1a1a2e' },
  { id: 'park', name: 'City Park', color: '#7CFC00' },
  { id: 'bedroom', name: 'Cozy Bedroom', color: '#E6E6FA' },
];

export default function HomePage() {
  // Toast notifications
  const toast = useToast();
  
  const [showStoryGenerator, setShowStoryGenerator] = useState(false);
  const [showPlaybackViewer, setShowPlaybackViewer] = useState(false);
  const [showVideoExporter, setShowVideoExporter] = useState(false);
  const [showSceneEditor, setShowSceneEditor] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [editingSceneIndex, setEditingSceneIndex] = useState(0);
  const [editableScenes, setEditableScenes] = useState<EditableScene[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [projectTitle, setProjectTitle] = useState('My Cartoon Story');
  const [isMuted, setIsMuted] = useState(false);
  const [hasProject, setHasProject] = useState(false);
  const [isRegeneratingScene, setIsRegeneratingScene] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const lastSpokenSceneRef = useRef<number>(-1);
  const [characterRoleLabels, setCharacterRoleLabels] = useState<Record<string, string>>({});
  const [characterRoleDescriptions, setCharacterRoleDescriptions] = useState<Record<string, string>>({});
  const [lastStoryProvider, setLastStoryProvider] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<{ id: string; title: string; updatedAt: string }[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isContinuingStory, setIsContinuingStory] = useState(false);
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  const [showAddSceneModal, setShowAddSceneModal] = useState(false);
  
  // New feature states
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [sceneTransitions, setSceneTransitions] = useState<Record<string, TransitionConfig>>({});
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const autoSaveManagerRef = useRef<AutoSaveManager | null>(null);
  
  // AI Background Generation states
  const [showAIBackgroundModal, setShowAIBackgroundModal] = useState(false);
  const [aiBackgroundPrompt, setAiBackgroundPrompt] = useState('');
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [generatedBackgrounds, setGeneratedBackgrounds] = useState<{url: string; prompt: string}[]>([]);
  const [customBackgrounds, setCustomBackgrounds] = useState<Record<string, string>>({});
  
  // New feature states (improvements 2-8)
  const [showStoryStarters, setShowStoryStarters] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isMusicMinimized, setIsMusicMinimized] = useState(true);
  const [ttsLanguage, setTtsLanguage] = useState('en-US');

  // Speak narration for preview
  const speakNarration = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to find a friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') || 
      v.name.includes('Female') ||
      v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // Speak when scene changes in preview
  useEffect(() => {
    if (hasProject && editableScenes[currentSceneIndex] && currentSceneIndex !== lastSpokenSceneRef.current) {
      lastSpokenSceneRef.current = currentSceneIndex;
      // Small delay to let the scene render first
      const timer = setTimeout(() => {
        speakNarration(editableScenes[currentSceneIndex].narration);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSceneIndex, hasProject, editableScenes, speakNarration]);

  // Stop speech when unmounting or when playback viewer opens
  useEffect(() => {
    if (showPlaybackViewer) {
      window.speechSynthesis?.cancel();
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [showPlaybackViewer]);

  // Auto-advance scenes when playing
  useEffect(() => {
    if (!isPlaying || !hasProject || editableScenes.length === 0) return;
    
    const currentScene = editableScenes[currentSceneIndex];
    if (!currentScene) return;
    
    const duration = currentScene.duration || 5000;
    
    const timer = setTimeout(() => {
      if (currentSceneIndex < editableScenes.length - 1) {
        setCurrentSceneIndex(prev => prev + 1);
      } else {
        // Reached the end, stop playing
        setIsPlaying(false);
        setCurrentSceneIndex(0);
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex, hasProject, editableScenes]);

  // Initialize auto-save
  useEffect(() => {
    if (hasProject && editableScenes.length > 0 && !autoSaveManagerRef.current) {
      autoSaveManagerRef.current = new AutoSaveManager({
        projectTitle,
        scenes: editableScenes,
        projectId: projectId || undefined,
        coverImage: coverImage || undefined,
        storyProvider: lastStoryProvider || undefined,
      }, {
        intervalMs: 30000, // Auto-save every 30 seconds
        debounceMs: 2000,
        maxBackups: 5,
        onSave: (timestamp: Date) => {
          setLastAutoSaved(timestamp);
        },
      });
      autoSaveManagerRef.current.start();
    }
    
    return () => {
      if (autoSaveManagerRef.current) {
        autoSaveManagerRef.current.stop();
      }
    };
  }, [hasProject, editableScenes.length > 0]);

  // Update auto-save data when project changes
  useEffect(() => {
    if (autoSaveManagerRef.current && hasProject) {
      autoSaveManagerRef.current.updateData({
        projectTitle,
        scenes: editableScenes,
        projectId: projectId || undefined,
        coverImage: coverImage || undefined,
        storyProvider: lastStoryProvider || undefined,
      });
    }
  }, [projectTitle, editableScenes, projectId, coverImage, lastStoryProvider, hasProject]);

  // -------- Scene Management Functions --------
  
  // Duplicate a scene
  const duplicateScene = useCallback((index: number) => {
    const scene = editableScenes[index];
    if (!scene) return;
    
    const newScene: EditableScene = {
      ...scene,
      id: `scene-${Date.now()}`,
      title: `${scene.title} (Copy)`,
    };
    
    const newScenes = [...editableScenes];
    newScenes.splice(index + 1, 0, newScene);
    setEditableScenes(newScenes);
    setCurrentSceneIndex(index + 1);
  }, [editableScenes]);

  // Delete a scene with confirmation
  const deleteScene = useCallback((index: number) => {
    if (editableScenes.length <= 1) return; // Don't delete last scene
    
    const newScenes = editableScenes.filter((_, i) => i !== index);
    setEditableScenes(newScenes);
    setCurrentSceneIndex(Math.min(currentSceneIndex, newScenes.length - 1));
    setShowDeleteConfirm(null);
  }, [editableScenes, currentSceneIndex]);

  // Reorder scenes via drag and drop
  const moveScene = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newScenes = [...editableScenes];
    const [movedScene] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, movedScene);
    setEditableScenes(newScenes);
    setCurrentSceneIndex(toIndex);
  }, [editableScenes]);

  // Continue story - add more scenes using AI
  const handleContinueStory = useCallback(async () => {
    if (editableScenes.length === 0) return;
    
    setIsContinuingStory(true);
    try {
      // Get unique character names from existing scenes
      const characters = Array.from(new Set(
        editableScenes.flatMap(s => s.characters.map(c => c.name))
      ));
      
      // Determine mood from story context
      const mood = lastStoryProvider || 'adventure';
      
      // Generate continuation scenes
      const newScenes = await continueStory({
        existingScenes: editableScenes.map(s => ({
          title: s.title,
          narration: s.narration,
          background: s.background,
          characters: s.characters.map(c => ({
            name: c.name,
            action: c.animation || 'idle',
            expression: c.expression || 'neutral',
            position: (c.x < 40 ? 'left' : c.x > 60 ? 'right' : 'center') as 'left' | 'center' | 'right',
          })),
          duration: s.duration,
        })),
        characters,
        mood,
        additionalSceneCount: 3, // Add 3 more scenes
      });
      
      // Convert to editable scenes and add to project
      const editableNewScenes: EditableScene[] = newScenes.map((scene, index) => ({
        id: `scene-${Date.now()}-${index}`,
        title: scene.title,
        narration: scene.narration,
        background: scene.background,
        duration: scene.duration || 6000,
        cameraZoom: 1,
        cameraPanX: 0,
        cameraPanY: 0,
        characters: scene.characters.map((c, i) => {
          const rig = getCharacterRig(c.name);
          return {
            id: `char-${Date.now()}-${i}`,
            rigId: rig?.id || 'kiara',
            name: c.name,
            x: c.position === 'left' ? 25 : c.position === 'right' ? 75 : 50,
            y: 65,
            scale: 1,
            flipX: c.position === 'right',
            animation: c.action || 'idle',
            expression: (c.expression as 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry') || 'neutral',
            isTalking: false,
            zIndex: i,
          };
        }),
      }));
      
      setEditableScenes([...editableScenes, ...editableNewScenes]);
      setCurrentSceneIndex(editableScenes.length); // Jump to first new scene
    } catch (error) {
      console.error('Failed to continue story:', error);
    } finally {
      setIsContinuingStory(false);
    }
  }, [editableScenes, lastStoryProvider]);

  // Handle scene drag start
  const handleSceneDragStart = (index: number) => {
    setDraggedSceneIndex(index);
  };

  // Handle scene drag over
  const handleSceneDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSceneIndex !== null && draggedSceneIndex !== index) {
      moveScene(draggedSceneIndex, index);
      setDraggedSceneIndex(index);
    }
  };

  // Handle scene drag end
  const handleSceneDragEnd = () => {
    setDraggedSceneIndex(null);
  };

  // Update scene transition
  const updateSceneTransition = useCallback((sceneId: string, transition: TransitionConfig) => {
    setSceneTransitions(prev => ({ ...prev, [sceneId]: transition }));
  }, []);

  // Generate share link
  const handleGenerateShareLink = async () => {
    if (!projectId) {
      // Save project first if not saved
      if (hasProject && editableScenes.length > 0) {
        toast.info('Saving project first...', 'Please wait');
        await handleSaveProject();
      } else {
        toast.warning('No project to share', 'Create or save a project first');
        return;
      }
    }
    
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate share link');
      }
      
      setShareLink(data.shareLink);
      setShowShareModal(true);
      toast.success('Share link created!', 'Copy the link to share your animation');
    } catch (err: any) {
      toast.error('Share failed', err.message || 'Could not generate share link');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // ? - Show keyboard shortcuts
      if (e.key === '?') {
        setShowKeyboardShortcuts(true);
        return;
      }
      
      // Space - Play/Pause
      if (e.key === ' ' && hasProject) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }
      
      // Arrow keys - Navigate scenes
      if (e.key === 'ArrowLeft' && hasProject) {
        setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1));
        return;
      }
      if (e.key === 'ArrowRight' && hasProject) {
        setCurrentSceneIndex(Math.min(editableScenes.length - 1, currentSceneIndex + 1));
        return;
      }
      
      // M - Toggle mute
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted(!isMuted);
        return;
      }
      
      // Ctrl+D - Duplicate scene
      if (e.ctrlKey && e.key === 'd' && hasProject) {
        e.preventDefault();
        duplicateScene(currentSceneIndex);
        return;
      }
      
      // Delete - Delete scene (with confirmation)
      if (e.key === 'Delete' && hasProject && editableScenes.length > 1) {
        setShowDeleteConfirm(currentSceneIndex);
        return;
      }
      
      // Number keys 1-9 - Jump to scene
      if (/^[1-9]$/.test(e.key) && hasProject) {
        const sceneIndex = parseInt(e.key) - 1;
        if (sceneIndex < editableScenes.length) {
          setCurrentSceneIndex(sceneIndex);
        }
        return;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasProject, isPlaying, currentSceneIndex, editableScenes.length, isMuted, duplicateScene]);

  // -------- Project Persistence Helpers --------
  const buildProjectPayload = useCallback(() => {
    return {
      id: projectId ?? undefined,
      title: projectTitle || 'My Cartoon Story',
      description: '',
      coverImage,
      storyProvider: lastStoryProvider,
      scenes: editableScenes.map((scene, index) => ({
        id: scene.id,
        title: scene.title,
        narration: scene.narration,
        background: scene.background,
        duration: scene.duration,
        cameraZoom: scene.cameraZoom,
        cameraPanX: scene.cameraPanX,
        cameraPanY: scene.cameraPanY,
        mood: (scene as any).mood,
        dialogue: (scene as any).dialogue,
        characters: scene.characters.map((c) => ({
          id: c.id,
          rigId: c.rigId,
          name: c.name,
          x: c.x,
          y: c.y,
          scale: c.scale,
          flipX: c.flipX,
          animation: c.animation,
          expression: c.expression,
          isTalking: c.isTalking,
          zIndex: c.zIndex,
        })),
      })),
      audioTracks: [],
      settings: {
        resolutionWidth: 1280,
        resolutionHeight: 720,
        fps: 30,
        defaultSceneDuration: 5000,
        autoNarration: false,
        narratorVoice: null,
      },
    };
  }, [coverImage, editableScenes, lastStoryProvider, projectId, projectTitle]);

  const toEditableScenesFromApi = useCallback((project: any): EditableScene[] => {
    if (!project?.scenes) return [];
    return project.scenes.map((scene: any) => ({
      id: scene.id,
      title: scene.title,
      narration: scene.narration,
      background: scene.background,
      duration: scene.duration,
      cameraZoom: scene.cameraZoom ?? 1,
      cameraPanX: scene.cameraPanX ?? 0,
      cameraPanY: scene.cameraPanY ?? 0,
      dialogue: scene.dialogueJson as any,
      characters: (scene.characters || []).map((c: any) => ({
        id: c.id,
        rigId: c.rigId,
        name: c.name,
        x: c.x,
        y: c.y,
        scale: c.scale,
        flipX: c.flipX,
        animation: c.animation,
        expression: c.expression,
        isTalking: c.isTalking,
        zIndex: c.zIndex,
      })),
    }));
  }, []);

  // AI Background Generation with Imagine.art
  const handleGenerateAIBackground = useCallback(async (prompt: string, autoApply = false) => {
    if (!prompt.trim()) {
      toast.warning('Enter a prompt', 'Describe the background you want');
      return;
    }
    
    setIsGeneratingBackground(true);
    try {
      const res = await fetch('/api/imagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          type: 'background',
          aspectRatio: '16:9',
          style: 'cartoon',
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Generation failed');
      }
      
      const data = await res.json();
      if (data.imageUrl) {
        const newBg = { url: data.imageUrl, prompt };
        setGeneratedBackgrounds(prev => [newBg, ...prev].slice(0, 10)); // Keep last 10
        
        if (autoApply && editableScenes[currentSceneIndex]) {
          // Apply to current scene
          const bgId = `ai-bg-${Date.now()}`;
          setCustomBackgrounds(prev => ({ ...prev, [bgId]: data.imageUrl }));
          
          const newScenes = [...editableScenes];
          newScenes[currentSceneIndex] = {
            ...newScenes[currentSceneIndex],
            background: bgId,
          };
          setEditableScenes(newScenes);
          toast.success('Background applied!', 'AI generated background added to scene');
        } else {
          toast.success('Background generated!', 'Click to apply it to the scene');
        }
      }
    } catch (err: any) {
      console.error('AI Background error:', err);
      toast.error('Generation failed', err?.message || 'Could not generate background');
    } finally {
      setIsGeneratingBackground(false);
    }
  }, [currentSceneIndex, editableScenes, toast]);

  // Auto-generate background from scene narration
  const handleAutoGenerateBackground = useCallback(async () => {
    if (!editableScenes[currentSceneIndex]) return;
    
    const scene = editableScenes[currentSceneIndex];
    const keywords = scene.narration.split(' ').slice(0, 10).join(' ');
    const prompt = `${scene.title} scene: ${keywords}`;
    
    await handleGenerateAIBackground(prompt, true);
  }, [currentSceneIndex, editableScenes, handleGenerateAIBackground]);

  const handleSaveProject = useCallback(async () => {
    if (!hasProject || editableScenes.length === 0) {
      toast.warning('Nothing to save', 'Create a story first');
      return;
    }
    setIsSavingProject(true);
    setSaveError(null);
    try {
      const payload = buildProjectPayload();
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Save failed');
      }
      const data = await res.json();
      if (data?.id) setProjectId(data.id);
      setLastAutoSaved(new Date());
      toast.success('Project saved!', 'Your animation has been saved');
    } catch (err: any) {
      setSaveError(err?.message || 'Save failed');
      toast.error('Save failed', err?.message || 'Could not save project');
    } finally {
      setIsSavingProject(false);
    }
  }, [buildProjectPayload, editableScenes.length, hasProject, toast]);

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to load projects');
      const data = await res.json();
      setAvailableProjects(data.projects || []);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const handleLoadProject = useCallback(
    async (id: string) => {
      setIsLoadingProjects(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Project not found');
        const data = await res.json();
        const proj = data.project;
        const scenes = toEditableScenesFromApi(proj);
        if (scenes.length === 0) throw new Error('No scenes in project');
        setEditableScenes(scenes);
        setProjectTitle(proj.title || 'My Cartoon Story');
        setProjectId(proj.id);
        setCoverImage(proj.coverImage ?? null);
        setHasProject(true);
        setCurrentSceneIndex(0);
        lastSpokenSceneRef.current = -1;
        setShowLoadDialog(false);
        toast.success('Project loaded!', proj.title);
      } catch (err: any) {
        setLoadError(err?.message || 'Failed to load project');
        toast.error('Load failed', err?.message || 'Could not load project');
      } finally {
        setIsLoadingProjects(false);
      }
    },
    [toEditableScenesFromApi, toast]
  );

  useEffect(() => {
    if (showLoadDialog) {
      fetchProjects();
    }
  }, [showLoadDialog, fetchProjects]);

  // Handle story generation
  const handleStoryGenerated = useCallback((story: { title: string; theme: string; scenes: any[]; castLabels?: Record<string, string>; castDescriptions?: Record<string, string>; provider?: string; coverImage?: string }) => {
    // Convert story to editable scenes with proper animations
    let scenes = storyToEditableScenes(story);
    // Auto-enhance scenes based on narration
    scenes = scenes.map(scene => autoEnhanceScene(scene));
    // Apply auto-calculated durations
    scenes = applyAutoDurations(scenes);
    
    setEditableScenes(scenes);
    setProjectTitle(story.title);
    setShowStoryGenerator(false);
    setHasProject(true);
    setCurrentSceneIndex(0);
    lastSpokenSceneRef.current = -1;
    setLastStoryProvider((story as any).provider ?? null);
    setCoverImage((story as any).coverImage ?? null);
    
    toast.success('Story created!', `"${story.title}" with ${scenes.length} scenes`);
    
    const rawLabels = (story as any).castLabels as Record<string, string> | undefined;
    if (rawLabels && typeof rawLabels === 'object') {
      const normalized: Record<string, string> = {};
      for (const [id, label] of Object.entries(rawLabels)) {
        if (typeof label === 'string' && label.trim()) {
          normalized[id.toLowerCase()] = label.trim();
        }
      }
      setCharacterRoleLabels(normalized);
    } else {
      setCharacterRoleLabels({});
    }

    const rawDescriptions = (story as any).castDescriptions as Record<string, string> | undefined;
    if (rawDescriptions && typeof rawDescriptions === 'object') {
      const normalizedDesc: Record<string, string> = {};
      for (const [id, desc] of Object.entries(rawDescriptions)) {
        if (typeof desc === 'string' && desc.trim()) {
          normalizedDesc[id.toLowerCase()] = desc.trim();
        }
      }
      setCharacterRoleDescriptions(normalizedDesc);
    } else {
      setCharacterRoleDescriptions({});
    }
  }, [toast]);

  const handleRegenerateScene = useCallback(async (sceneIndex: number) => {
    const baseScene = editableScenes[sceneIndex];
    if (!baseScene) return;

    try {
      setIsRegeneratingScene(true);
      setRegenError(null);

      const characterNames = Array.from(new Set(baseScene.characters.map(c => c.name.toLowerCase())));
      const prompt = `Regenerate this single children's story scene. Keep the same characters (${characterNames.join(', ')}) and background (${baseScene.background}), but rewrite the action in a fresh, fun way. Current narration: "${baseScene.narration}"`;

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre: 'adventure',
          characters: characterNames,
          sceneCount: 1,
          targetAudience: 'child',
        }),
      });

      if (!response.ok) {
        let message = 'Failed to regenerate scene';
        try {
          const errJson = await response.json();
          if (errJson?.error) message = errJson.error;
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const aiStory: AIStoryResponse = await response.json();

      if (!aiStory.success || !aiStory.scenes || aiStory.scenes.length === 0) {
        throw new Error(aiStory.error || 'AI did not return a scene');
      }

      const aiScene = aiStory.scenes[0];
      let newScene = aiSceneToEditableScene(aiScene, sceneIndex, baseScene);
      newScene = autoEnhanceScene(newScene);
      const [sceneWithDuration] = applyAutoDurations([newScene]);

      setEditableScenes(prev => prev.map((s, i) => (i === sceneIndex ? sceneWithDuration : s)));
    } catch (error: any) {
      console.error('Scene regeneration failed:', error);
      setRegenError(error?.message || 'Scene regeneration failed');
    } finally {
      setIsRegeneratingScene(false);
    }
  }, [editableScenes]);

  const handlePolishSceneDialogue = useCallback(
    async (sceneIndex: number) => {
      const baseScene = editableScenes[sceneIndex];
      if (!baseScene) return;

      try {
        setIsRegeneratingScene(true);
        setRegenError(null);

        const characterNames = Array.from(
          new Set(baseScene.characters.map((c) => c.name.toLowerCase()))
        );

        const existingDialogue: any = (baseScene as any).dialogue;
        const dialogueSummary =
          Array.isArray(existingDialogue) && existingDialogue.length > 0
            ? existingDialogue
                .map(
                  (line: any) =>
                    `${line.speaker ?? 'Narrator'}: "${String(line.text ?? '')}"`
                )
                .join(' | ')
            : 'No explicit dialogue lines yet.';

        const prompt = `Rewrite this single children's story scene to improve the spoken dialogue and make it clearer, more engaging, and age-appropriate, while keeping the same basic events, characters (${characterNames.join(
          ', '
        )}), and background (${baseScene.background}). Use 1-2 sentences of narration plus 1-3 short dialogue lines, where each spoken line is attributed to a character. Current narration: "${baseScene.narration}" Current dialogue: ${dialogueSummary}`;

        const response = await fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            genre: 'adventure',
            characters: characterNames,
            sceneCount: 1,
            targetAudience: 'child',
          }),
        });

        if (!response.ok) {
          let message = 'Failed to improve dialogue';
          try {
            const errJson = await response.json();
            if (errJson?.error) message = errJson.error;
          } catch {
          }
          throw new Error(message);
        }

        const aiStory: AIStoryResponse = await response.json();

        if (!aiStory.success || !aiStory.scenes || aiStory.scenes.length === 0) {
          throw new Error(aiStory.error || 'AI did not return a scene');
        }

        const aiScene = aiStory.scenes[0];
        let newScene = aiSceneToEditableScene(aiScene, sceneIndex, baseScene);
        newScene = autoEnhanceScene(newScene);
        const [sceneWithDuration] = applyAutoDurations([newScene]);

        setEditableScenes((prev) =>
          prev.map((s, i) => (i === sceneIndex ? sceneWithDuration : s))
        );
      } catch (error: any) {
        console.error('Scene dialogue polish failed:', error);
        setRegenError(error?.message || 'Scene dialogue polish failed');
      } finally {
        setIsRegeneratingScene(false);
      }
    },
    [editableScenes]
  );

  const handleRefineSceneMood = useCallback(
    async (sceneIndex: number, direction: 'calmer' | 'more-exciting') => {
      const baseScene = editableScenes[sceneIndex];
      if (!baseScene) return;

      try {
        setIsRegeneratingScene(true);
        setRegenError(null);

        const characterNames = Array.from(
          new Set(baseScene.characters.map((c) => c.name.toLowerCase()))
        );

        const moodInstruction =
          direction === 'calmer'
            ? 'Make the scene feel calmer and more soothing, with slower, softer action, suitable for bedtime.'
            : 'Make the scene feel more exciting and energetic, with a sense of adventure and higher energy, but still age-appropriate.';

        const prompt = `Regenerate this single children's story scene with an adjusted mood. Keep the same characters (${characterNames.join(
          ', '
        )}) and background (${baseScene.background}). ${moodInstruction} Current narration: "${baseScene.narration}"`;

        const response = await fetch('/api/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            genre: 'adventure',
            characters: characterNames,
            sceneCount: 1,
            targetAudience: 'child',
          }),
        });

        if (!response.ok) {
          let message = 'Failed to adjust scene mood';
          try {
            const errJson = await response.json();
            if (errJson?.error) message = errJson.error;
          } catch {
          }
          throw new Error(message);
        }

        const aiStory: AIStoryResponse = await response.json();

        if (!aiStory.success || !aiStory.scenes || aiStory.scenes.length === 0) {
          throw new Error(aiStory.error || 'AI did not return a scene');
        }

        const aiScene = aiStory.scenes[0];
        let newScene = aiSceneToEditableScene(aiScene, sceneIndex, baseScene);
        newScene = autoEnhanceScene(newScene);
        const [sceneWithDuration] = applyAutoDurations([newScene]);

        setEditableScenes((prev) =>
          prev.map((s, i) => (i === sceneIndex ? sceneWithDuration : s))
        );
      } catch (error: any) {
        console.error('Scene mood refinement failed:', error);
        setRegenError(error?.message || 'Scene mood refinement failed');
      } finally {
        setIsRegeneratingScene(false);
      }
    },
    [editableScenes]
  );

  // Handle scene edit
  const handleEditScene = (sceneIndex: number) => {
    setEditingSceneIndex(sceneIndex);
    setShowPlaybackViewer(false);
    setShowSceneEditor(true);
  };

  // Handle scene update from editor
  const handleSceneUpdate = (updatedScene: EditableScene) => {
    setEditableScenes(prev => 
      prev.map((s, i) => i === editingSceneIndex ? updatedScene : s)
    );
  };

  // Handle video export with real canvas capture
  const performExport = useCallback(async (options: any): Promise<Blob | null> => {
    if (editableScenes.length === 0) {
      toast.warning('Nothing to export', 'Create a story first');
      throw new Error('No scenes to export');
    }

    toast.info('Exporting video...', 'This may take a moment');

    // Convert editable scenes to render data
    const renderScenes = editableScenes.map(editableSceneToRenderData);

    // Create export engine with progress callback
    const engine = new VideoExportEngine(
      options.width,
      options.height,
      (progress: ExportProgress) => {
        console.log(`Export: ${progress.phase} - ${progress.progress}% - ${progress.message || ''}`);
      }
    );

    try {
      const blob = await engine.exportVideo(renderScenes, {
        format: options.format || 'webm',
        quality: options.quality || 'medium',
        fps: options.fps || 30,
        width: options.width,
        height: options.height,
        includeAudio: options.includeAudio ?? true,
      });
      toast.success('Export complete!', `Your ${options.format?.toUpperCase() || 'video'} is ready`);
      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed', 'Could not create video file');
      throw error;
    } finally {
      engine.cleanup();
    }
  }, [editableScenes, toast]);

  // Calculate total duration
  const totalDuration = editableScenes.reduce((sum, s) => sum + s.duration, 0);

  // Current scene
  const currentScene = editableScenes[currentSceneIndex];

  const usedRigIds = Array.from(
    new Set(editableScenes.flatMap((s) => s.characters.map((c) => c.rigId)))
  );
  const usedRigsRaw = usedRigIds
    .map((id) => getCharacterRig(id))
    .filter((rig) => rig !== undefined) as any[];
  const rigsToShow = usedRigsRaw.length > 0 ? usedRigsRaw : CHARACTER_RIGS.slice(0, 3);
  const hasCharacterRoleLabels = Object.keys(characterRoleLabels).length > 0;

  const storySourceLabel = lastStoryProvider === 'gemini'
    ? 'Gemini (AI)'
    : lastStoryProvider === 'openai'
    ? 'OpenAI (AI)'
    : lastStoryProvider === 'fallback'
    ? 'AI fallback story'
    : lastStoryProvider === 'template-fallback'
    ? 'Templates (AI fallback)'
    : lastStoryProvider === 'template'
    ? 'Smart templates'
    : null;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header - Compact */}
      <header className="relative z-10 border-b border-white/10 bg-black/30 backdrop-blur-xl flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo - Compact */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">Cartoon Studio</h1>
                <p className="text-xs text-purple-300/80">AI Animation</p>
              </div>
            </div>

            {/* Center: Generation Tools - Compact */}
            <div className="flex items-center gap-1.5">
              {/* Primary: Create Story */}
              <button
                onClick={() => setShowStoryGenerator(true)}
                data-tour="create-story"
                className="px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/20 font-medium text-xs"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
              
              {/* Secondary: Character Creator */}
              <button
                onClick={() => setShowCharacterCreator(true)}
                className="px-2.5 py-1.5 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20 font-medium text-xs"
                title="Create AI Character"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Character</span>
              </button>
              
              {/* Story Starters */}
              <button
                onClick={() => setShowStoryStarters(true)}
                title="Story starters & prompts"
                className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/80 to-orange-500/80 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 font-medium text-xs"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Templates</span>
              </button>
            </div>

            {/* Right: Utility buttons */}
            <div className="flex items-center gap-1.5">
              {/* Music Player Toggle */}
              <button
                onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                title="Background music"
                className={`p-2 rounded-lg transition-all ${showMusicPlayer ? 'bg-purple-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'}`}
              >
                <Music className="w-4 h-4" />
              </button>
              
              {/* TTS Settings */}
              <button
                onClick={() => setShowTTSSettings(true)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
                title="Voice Settings"
              >
                <Mic className="w-4 h-4" />
              </button>
              
              {/* Language Selector */}
              <LanguageSelector
                selectedLanguage={ttsLanguage}
                onLanguageChange={setTtsLanguage}
                isCompact={true}
              />
              
              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
                title="Keyboard Shortcuts (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>
              
              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              
              {/* Help */}
              <button
                onClick={() => setShowOnboarding(true)}
                title="Show tour guide"
                className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-white/20 mx-1" />
              
              {hasProject && (
                <>
                  {/* Share */}
                  <button
                    onClick={handleGenerateShareLink}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
                    title="Share Project"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {/* Export */}
                  <button
                    onClick={() => setShowVideoExporter(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
                    title="Export Video"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {/* Save */}
                  <button
                    onClick={handleSaveProject}
                    disabled={isSavingProject}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all disabled:opacity-60"
                    title="Save Project"
                  >
                    {isSavingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </button>
                  {/* Load */}
                  <button
                    onClick={() => setShowLoadDialog(true)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
                    title="Load Project"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Fills remaining space */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 py-3">
        {!hasProject ? (
          /* Welcome Screen - Compact */
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                Create Your Own
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent mt-1">
                  Animated Story
                </span>
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
                Turn your imagination into beautiful cartoon animations in just a few clicks.
              </p>

              <button
                onClick={() => setShowStoryGenerator(true)}
                data-tour="create-story"
                className="px-7 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg rounded-xl transition-all flex items-center gap-3 mx-auto shadow-xl shadow-purple-500/30 font-semibold"
              >
                <Wand2 className="w-5 h-5" />
                Start Creating
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Features - Compact */}
              <div className="grid grid-cols-3 gap-4 mt-10">
                {[
                  { icon: Users, title: 'Characters', desc: 'Pre-made & AI' },
                  { icon: Mic, title: 'Narration', desc: 'Auto voice-over' },
                  { icon: Download, title: 'Export', desc: 'Video download' },
                ].map((feature, i) => (
                  <div key={i} className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <feature.icon className="w-6 h-6 text-purple-400 mb-2 mx-auto" />
                    <h3 className="font-medium text-white text-sm mb-0.5">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Project View - Compact Grid */
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Main Preview - Takes 9 columns */}
            <div className="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden">
              {/* Project Title Bar */}
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div className="flex items-center gap-3">
                  {coverImage && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex-shrink-0">
                      <img
                        src={coverImage}
                        alt="Story cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{projectTitle}</h2>
                    <p className="text-xs text-purple-300">{editableScenes.length} scenes • {Math.round(totalDuration / 1000)}s</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlaybackViewer(true)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2 font-medium text-sm shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  Watch Full Story
                </button>
              </div>

              {/* Preview Stage - Flexible height */}
              <div 
                data-tour="canvas"
                className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-xl overflow-hidden shadow-xl border border-white/10 flex-1 min-h-0"
              >
                {/* Stage Header */}
                <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/60 via-black/30 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                      <p className="text-white font-medium text-xs">{currentScene?.title || 'No scene'}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-500/30 backdrop-blur-md rounded-md text-purple-200 text-xs font-medium border border-purple-500/30">
                      {currentSceneIndex + 1}/{editableScenes.length}
                    </span>
                  </div>
                </div>

                <div className="w-full h-full relative">
                  {currentScene && (
                    <>
                      {/* Check if using AI-generated custom background */}
                      {currentScene.background.startsWith('ai-bg-') && customBackgrounds[currentScene.background] ? (
                        <div className="absolute inset-0 z-10">
                          <img 
                            src={customBackgrounds[currentScene.background]} 
                            alt="AI Generated Background"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <>
                          {/* Parallax Background with mountains, trees, etc. */}
                          <div className="absolute inset-0 z-10">
                            <ParallaxBackground
                              theme={currentScene.background as any}
                              season="summer"
                              timeOfDay={currentScene.background === 'night' ? 'night' : 'day'}
                              animationProgress={0.5}
                              enableParallax={false}
                            />
                          </div>

                          {/* Animated Elements (butterflies, birds, clouds, fireflies, etc.) */}
                          <div className="absolute inset-0 z-20 pointer-events-none">
                            <AnimatedBackground
                              backgroundType={currentScene.background as any}
                              season="summer"
                              intensity="medium"
                            />
                          </div>
                        </>
                      )}

                      {/* Characters - positioned on the ground */}
                      <div className="absolute bottom-[12%] left-0 right-0 flex items-end justify-center gap-6 z-30">
                        {currentScene.characters.map((char, idx) => {
                          const rig = getCharacterRig(char.rigId);
                          const label = characterRoleLabels[rig?.id.toLowerCase() || ''];
                          
                          // Check if this is an AI-generated character
                          if (char.useAICharacter && char.aiGeneratedImage) {
                            return (
                              <div
                                key={idx}
                                className="transform relative"
                                style={{ transform: `scale(${char.scale * 0.6})` }}
                              >
                                <div className="w-28 h-36 relative">
                                  <img 
                                    src={char.aiGeneratedImage} 
                                    alt={char.name}
                                    className="w-full h-full object-contain drop-shadow-lg"
                                  />
                                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <span className="px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                                      {label || char.name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          if (!rig) return null;
                          return (
                            <div key={idx} className="transform">
                              <RiggedCharacter
                                rig={rig}
                                animation={isPlaying ? char.animation : 'idle'}
                                scale={char.scale * 0.8}
                                flipX={char.flipX}
                                expression={char.expression || 'happy'}
                                showName={true}
                                label={label}
                                customColors={char.customColors}
                                customAccessories={char.customAccessories}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Narration Box */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-[70%]">
                        <div className="px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl">
                          <p className="text-white text-center leading-relaxed text-sm">{currentScene.narration}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Minimal Playback Controls */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50">
                  <div className="flex items-center gap-0.5 px-1 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    <button
                      onClick={() => setCurrentSceneIndex(Math.max(0, currentSceneIndex - 1))}
                      disabled={currentSceneIndex === 0}
                      className="p-1 text-white/60 hover:text-white rounded-full transition-colors disabled:opacity-30"
                    >
                      <SkipBack className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => setCurrentSceneIndex(Math.min(editableScenes.length - 1, currentSceneIndex + 1))}
                      disabled={currentSceneIndex === editableScenes.length - 1}
                      className="p-1 text-white/60 hover:text-white rounded-full transition-colors disabled:opacity-30"
                    >
                      <SkipForward className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scene Timeline - Compact */}
              <div data-tour="timeline" className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-3 border border-white/10 mt-2 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white text-sm">Scenes</h3>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium">
                      {currentSceneIndex + 1}/{editableScenes.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {editableScenes.length > 0 && (
                      <>
                        <button
                          onClick={handleContinueStory}
                          disabled={isContinuingStory}
                          className="px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 disabled:opacity-50 text-white shadow shadow-emerald-500/20 transition-all"
                          title="Add more scenes"
                        >
                          <PlusCircle className="w-3 h-3" />
                          {isContinuingStory ? '...' : 'Continue'}
                        </button>
                        <button
                          onClick={() => handleRegenerateScene(currentSceneIndex)}
                          disabled={isRegeneratingScene}
                          className="px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-50 text-white shadow shadow-purple-500/20 transition-all"
                        >
                          <Sparkles className="w-3 h-3" />
                          {isRegeneratingScene ? '...' : 'Regen'}
                        </button>
                        <button
                          onClick={handleAutoGenerateBackground}
                          disabled={isGeneratingBackground}
                          className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-indigo-500/50 to-purple-500/50 hover:from-indigo-500/70 hover:to-purple-500/70 text-indigo-200 transition-all flex items-center gap-1"
                          title="AI Background"
                        >
                          <FileImage className="w-3 h-3" />
                          {isGeneratingBackground ? '...' : 'AI BG'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 pt-3 scrollbar-thin scrollbar-thumb-white/10 overflow-visible">
                  {editableScenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      draggable
                      onDragStart={() => handleSceneDragStart(index)}
                      onDragOver={(e) => handleSceneDragOver(e, index)}
                      onDragEnd={handleSceneDragEnd}
                      className={`relative flex-shrink-0 group ${draggedSceneIndex === index ? 'opacity-50' : ''}`}
                    >
                      <button
                        onClick={() => setCurrentSceneIndex(index)}
                        className={`px-3 py-2 rounded-lg transition-all text-left ${
                          currentSceneIndex === index
                            ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3 h-3 opacity-40 cursor-grab" />
                          <div className="min-w-[70px]">
                            <div className={`text-[10px] font-medium ${currentSceneIndex === index ? 'text-white/80' : 'text-gray-500'}`}>
                              Scene {index + 1}
                            </div>
                            <div className="text-xs font-semibold truncate max-w-[80px]">{scene.title}</div>
                          </div>
                        </div>
                      </button>
                      
                      {/* Scene actions on hover */}
                      <div className="absolute -top-2.5 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateScene(index); }}
                          className="p-1 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3 text-white" />
                        </button>
                        {editableScenes.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(index); }}
                            className="p-1 bg-red-500 hover:bg-red-600 rounded-full shadow-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Add Scene Button */}
                  <button
                    onClick={() => setShowAddSceneModal(true)}
                    className="flex-shrink-0 px-3 py-2 rounded-lg transition-all bg-white/5 hover:bg-purple-500/20 text-gray-400 hover:text-white border border-dashed border-white/20 hover:border-purple-500/50"
                  >
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-medium">Add</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Takes 3 columns */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-3 overflow-y-auto max-h-full">
              {/* Quick Actions - Compact */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="font-medium text-white mb-3 text-sm">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowPlaybackViewer(true)}
                    className="px-3 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all flex items-center gap-2 border border-green-500/30 text-xs font-medium"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Watch</span>
                  </button>
                  <button
                    onClick={() => setShowVideoExporter(true)}
                    data-tour="export"
                    className="px-3 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all flex items-center gap-2 border border-blue-500/30 text-xs font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setShowStoryGenerator(true)}
                    className="px-3 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all flex items-center gap-2 border border-purple-500/30 text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                  <button
                    onClick={() => setShowCharacterCreator(true)}
                    className="px-3 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all flex items-center gap-2 border border-cyan-500/30 text-xs font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Char</span>
                  </button>
                </div>
              </div>

              {/* Project Info - Compact */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <h3 className="font-medium text-white mb-3 text-sm">Project Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <span className="text-lg font-bold text-white">{editableScenes.length}</span>
                    <p className="text-[10px] text-gray-400">Scenes</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <span className="text-lg font-bold text-white">{Math.round(totalDuration / 1000)}s</span>
                    <p className="text-[10px] text-gray-400">Duration</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <span className="text-lg font-bold text-white">
                      {new Set(editableScenes.flatMap(s => s.characters.map(c => c.name))).size}
                    </span>
                    <p className="text-[10px] text-gray-400">Characters</p>
                  </div>
                  {storySourceLabel && (
                    <div className="text-center p-2 bg-purple-500/10 rounded-lg">
                      <span className="text-xs font-medium text-purple-300">{storySourceLabel.split(' ')[0]}</span>
                      <p className="text-[10px] text-gray-400">Source</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Characters Preview - Compact */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white text-sm">Characters</h3>
                  {hasCharacterRoleLabels && (
                    <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px]">AI</span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {rigsToShow.slice(0, 8).map((rig) => {
                    const idKey = rig.id.toLowerCase();
                    const label = characterRoleLabels[idKey] || rig.name;
                    return (
                      <div key={rig.id} className="text-center">
                        <div 
                          className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-1"
                          style={{ backgroundColor: rig.colors.primary + '30' }}
                        >
                          <div 
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: rig.colors.primary }}
                          />
                        </div>
                        <p className="text-[9px] text-gray-300 truncate">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Story Generator Modal */}
      <AnimatePresence>
        {showStoryGenerator && (
          <StoryGenerator
            onStoryGenerated={handleStoryGenerated}
            onClose={() => setShowStoryGenerator(false)}
          />
        )}
      </AnimatePresence>

      {/* Playback Viewer Modal */}
      <AnimatePresence>
        {showPlaybackViewer && editableScenes.length > 0 && (
          <EnhancedPlaybackViewer
            scenes={editableScenes}
            onClose={() => setShowPlaybackViewer(false)}
            onEditScene={handleEditScene}
            autoPlay={true}
            characterRoleLabels={characterRoleLabels}
            customBackgrounds={customBackgrounds}
          />
        )}
      </AnimatePresence>

      {/* Scene Editor Modal */}
      <AnimatePresence>
        {showSceneEditor && editableScenes[editingSceneIndex] && (
          <InteractiveSceneEditor
            scene={editableScenes[editingSceneIndex]}
            onSceneUpdate={handleSceneUpdate}
            onClose={() => setShowSceneEditor(false)}
            onSave={() => {
              setShowSceneEditor(false);
              setShowPlaybackViewer(true);
            }}
            characterRoleLabels={characterRoleLabels}
          />
        )}
      </AnimatePresence>

      {/* Video Exporter Modal */}
      <AnimatePresence>
        {showVideoExporter && (
          <VideoExporter
            onExport={performExport}
            onClose={() => setShowVideoExporter(false)}
            totalDuration={totalDuration}
            sceneCount={editableScenes.length}
          />
        )}
      </AnimatePresence>

      {/* Load Project Modal */}
      <AnimatePresence>
        {showLoadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Load Project</h3>
                </div>
                <button onClick={() => setShowLoadDialog(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
                {isLoadingProjects && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading projects...
                  </div>
                )}

                {loadError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                    {loadError}
                  </div>
                )}

                {!isLoadingProjects && !loadError && availableProjects.length === 0 && (
                  <p className="text-sm text-gray-600">No saved projects yet.</p>
                )}

                {availableProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-between group"
                  >
                    <button
                      onClick={() => handleLoadProject(proj.id)}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-gray-900">{proj.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Updated {new Date(proj.updatedAt).toLocaleString()}
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${proj.title}"? This cannot be undone.`)) {
                          try {
                            const res = await fetch(`/api/projects/${proj.id}`, { method: 'DELETE' });
                            if (res.ok) {
                              setAvailableProjects(prev => prev.filter(p => p.id !== proj.id));
                            }
                          } catch (err) {
                            console.error('Delete failed:', err);
                          }
                        }
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TTS Settings Panel */}
      <TTSSettingsPanel
        isOpen={showTTSSettings}
        onClose={() => setShowTTSSettings(false)}
      />

      {/* Add Scene Template Modal */}
      <AnimatePresence>
        {showAddSceneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddSceneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Add New Scene</h3>
                </div>
                <button onClick={() => setShowAddSceneModal(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
                <p className="text-gray-400 text-sm mb-4">
                  Choose a template to add a new scene to your story.
                </p>
                
                {/* Template Categories */}
                {(['dialogue', 'action', 'emotion', 'transition', 'establishing'] as const).map((category) => {
                  const categoryTemplates = SCENE_TEMPLATES.filter(t => t.category === category);
                  if (categoryTemplates.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-6">
                      <h4 className="text-white font-medium mb-3 capitalize flex items-center gap-2">
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
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoryTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              // Get characters from existing scenes
                              const existingChars = editableScenes.length > 0
                                ? editableScenes[0].characters.map(c => ({ rigId: c.rigId, name: c.name }))
                                : CHARACTER_RIGS.slice(0, 2).map(r => ({ rigId: r.id, name: r.name }));
                              
                              // Apply template
                              const newSceneData = applyTemplate(template, existingChars);
                              
                              const newScene: EditableScene = {
                                id: `scene-${Date.now()}`,
                                title: newSceneData.title || `Scene ${editableScenes.length + 1}`,
                                narration: newSceneData.narration || '',
                                background: newSceneData.background || 'meadow',
                                characters: newSceneData.characters || [],
                                duration: newSceneData.duration || 5000,
                                cameraZoom: newSceneData.cameraZoom || 1,
                                cameraPanX: newSceneData.cameraPanX || 0,
                                cameraPanY: newSceneData.cameraPanY || 0,
                              };
                              
                              setEditableScenes([...editableScenes, newScene]);
                              setCurrentSceneIndex(editableScenes.length);
                              setShowAddSceneModal(false);
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
                
                {/* Blank Scene Option */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      const existingChars = editableScenes.length > 0
                        ? editableScenes[0].characters.slice(0, 2).map(c => ({
                            ...c,
                            id: `char-${Date.now()}-${Math.random()}`,
                            animation: 'idle',
                            expression: 'neutral' as const,
                          }))
                        : [];
                      
                      const newScene: EditableScene = {
                        id: `scene-${Date.now()}`,
                        title: `Scene ${editableScenes.length + 1}`,
                        narration: 'Add your narration here...',
                        background: 'meadow',
                        characters: existingChars,
                        duration: 5000,
                        cameraZoom: 1,
                        cameraPanX: 0,
                        cameraPanY: 0,
                      };
                      
                      setEditableScenes([...editableScenes, newScene]);
                      setCurrentSceneIndex(editableScenes.length);
                      setShowAddSceneModal(false);
                    }}
                    className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-all border-2 border-dashed border-gray-600 hover:border-purple-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📝</div>
                      <div>
                        <div className="text-white font-medium">Blank Scene</div>
                        <div className="text-gray-400 text-xs">Start from scratch with an empty scene</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
      />

      {/* Collaboration Panel */}
      <AnimatePresence>
        {showCollaboration && (
          <CollaborationPanel
            isOpen={showCollaboration}
            onClose={() => setShowCollaboration(false)}
            currentUser={{
              id: 'user-1',
              name: 'You',
              avatar: '👤',
              color: '#8B5CF6',
              status: 'online',
              role: 'owner',
              currentScene: currentSceneIndex,
            }}
            collaborators={[]}
            onInvite={() => {
              // TODO: Implement invite functionality
              alert('Invite feature coming soon!');
            }}
          />
        )}
      </AnimatePresence>

      {/* AI Background Generator Modal */}
      <AnimatePresence>
        {showAIBackgroundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAIBackgroundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#12121a] rounded-2xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">AI Background Generator</h3>
                <p className="text-sm text-zinc-500 mt-1">Create unique backgrounds with AI</p>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Prompt Input */}
                <div>
                  <label className="text-sm font-medium text-zinc-400 block mb-2">Describe your background</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiBackgroundPrompt}
                      onChange={(e) => setAiBackgroundPrompt(e.target.value)}
                      placeholder="e.g., magical forest at sunset, cozy bedroom with toys..."
                      className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isGeneratingBackground) {
                          handleGenerateAIBackground(aiBackgroundPrompt, false);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleGenerateAIBackground(aiBackgroundPrompt, false)}
                      disabled={isGeneratingBackground || !aiBackgroundPrompt.trim()}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isGeneratingBackground ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate'
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div>
                  <label className="text-sm font-medium text-zinc-400 block mb-2">Quick ideas</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'magical forest with glowing mushrooms',
                      'sunny beach with palm trees',
                      'cozy bedroom at night',
                      'city park in autumn',
                      'underwater coral reef',
                      'snowy mountain landscape',
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setAiBackgroundPrompt(prompt)}
                        className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 text-zinc-400 rounded-lg transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Backgrounds Gallery */}
                {generatedBackgrounds.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-zinc-400 block mb-2">Generated backgrounds</label>
                    <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">
                      {generatedBackgrounds.map((bg, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (editableScenes[currentSceneIndex]) {
                              const bgId = `ai-bg-${Date.now()}`;
                              setCustomBackgrounds(prev => ({ ...prev, [bgId]: bg.url }));
                              const newScenes = [...editableScenes];
                              newScenes[currentSceneIndex] = {
                                ...newScenes[currentSceneIndex],
                                background: bgId,
                              };
                              setEditableScenes(newScenes);
                              setShowAIBackgroundModal(false);
                              toast.success('Background applied!');
                            }
                          }}
                          className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all group"
                        >
                          <img src={bg.url} alt={bg.prompt} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Apply</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => setShowAIBackgroundModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleGenerateAIBackground(aiBackgroundPrompt, true);
                    setShowAIBackgroundModal(false);
                  }}
                  disabled={isGeneratingBackground || !aiBackgroundPrompt.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  Generate & Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character Creator Modal */}
      <CharacterCreatorModal
        isOpen={showCharacterCreator}
        onClose={() => setShowCharacterCreator(false)}
        onSave={(character) => {
          // If no scenes exist, create a default scene first
          if (editableScenes.length === 0) {
            const defaultScene: EditableScene = {
              id: `scene-${Date.now()}`,
              title: 'Scene 1',
              narration: 'Once upon a time...',
              background: 'park',
              duration: 5000,
              characters: [
                {
                  id: character.id,
                  rigId: character.rigId,
                  name: character.name,
                  x: 50,
                  y: 70,
                  scale: 1,
                  flipX: false,
                  animation: 'idle',
                  expression: 'neutral' as const,
                  isTalking: false,
                  zIndex: 0,
                  customColors: character.colors,
                  customAccessories: character.accessories,
                  customOutfit: character.outfit,
                  aiGeneratedImage: character.aiGeneratedImage,
                  useAICharacter: character.useAICharacter,
                },
              ],
              props: [],
              cameraKeyframes: [],
            };
            setEditableScenes([defaultScene]);
            setHasProject(true);
            setProjectTitle('My New Story');
            toast.success(`Created "${character.name}" in a new scene!`);
          } else if (editableScenes[currentSceneIndex]) {
            // Add character to current scene with all custom settings
            const updatedScenes = [...editableScenes];
            const existingChars = updatedScenes[currentSceneIndex].characters;
            updatedScenes[currentSceneIndex] = {
              ...updatedScenes[currentSceneIndex],
              characters: [
                ...existingChars,
                {
                  id: character.id,
                  rigId: character.rigId,
                  name: character.name,
                  x: 50,
                  y: 70,
                  scale: 1,
                  flipX: false,
                  animation: 'idle',
                  expression: 'neutral' as const,
                  isTalking: false,
                  zIndex: existingChars.length,
                  // Apply custom colors and accessories from Character Creator
                  customColors: character.colors,
                  customAccessories: character.accessories,
                  customOutfit: character.outfit,
                  aiGeneratedImage: character.aiGeneratedImage,
                  useAICharacter: character.useAICharacter,
                },
              ],
            };
            setEditableScenes(updatedScenes);
            toast.success(`Added "${character.name}" to the scene!`);
          }
          setShowCharacterCreator(false);
        }}
        mode="create"
      />

      {/* Delete Scene Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Scene?</h3>
                    <p className="text-gray-400 text-sm">
                      This will delete "{editableScenes[showDeleteConfirm]?.title}"
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-6">
                  This action cannot be undone. The scene and all its contents will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteScene(showDeleteConfirm)}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    Delete Scene
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Share Project</h3>
                    <p className="text-gray-400 text-sm">Anyone with this link can view</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm"
                  />
                  <button
                    onClick={async () => {
                      await copyToClipboard(shareLink);
                      alert('Link copied!');
                    }}
                    className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
                  >
                    Copy
                  </button>
                </div>
                
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-save indicator */}
      {lastAutoSaved && (
        <div className="fixed bottom-4 left-4 z-30 px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm rounded-lg text-xs text-gray-400 flex items-center gap-2">
          <Save className="w-3 h-3" />
          Saved {formatTimeAgo(lastAutoSaved.getTime())}
        </div>
      )}

      {/* Onboarding Tour */}
      <OnboardingTour 
        forceShow={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />

      {/* Story Starters Modal */}
      <StoryStarters
        isOpen={showStoryStarters}
        onClose={() => setShowStoryStarters(false)}
        onSelectStarter={(starter) => {
          // Pre-fill the story generator with the starter prompt
          setShowStoryStarters(false);
          setShowStoryGenerator(true);
        }}
      />

      {/* Background Music Player */}
      {showMusicPlayer && (
        <MusicPlayer
          isMinimized={isMusicMinimized}
          onMinimizeToggle={() => setIsMusicMinimized(!isMusicMinimized)}
        />
      )}
    </div>
  );
}
