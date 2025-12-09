import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  Scene,
  CharacterInstance,
  EditorState,
  PlaybackState,
  Expression,
  CharacterAnimation,
  Keyframe,
} from './types';
import { CHARACTER_TEMPLATES, BACKGROUND_TEMPLATES } from './templates';

// Default project
const createDefaultProject = (): Project => ({
  id: uuidv4(),
  title: 'My Cartoon Story',
  description: 'A fun animated adventure',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  scenes: [
    {
      id: uuidv4(),
      title: 'The Beginning',
      description: 'Our story begins in a sunny meadow...',
      narration: 'Once upon a time, in a beautiful meadow, two friends were playing together.',
      backgroundId: 'meadow',
      characters: [
        {
          id: uuidv4(),
          templateId: 'luna',
          name: 'Luna',
          x: 25,
          y: 70,
          scale: 1,
          flipX: false,
          expression: 'happy',
          zIndex: 1,
        },
        {
          id: uuidv4(),
          templateId: 'max',
          name: 'Max',
          x: 70,
          y: 70,
          scale: 1,
          flipX: true,
          expression: 'neutral',
          zIndex: 2,
        },
      ],
      animations: [],
      duration: 5000,
      transition: 'fade',
      cameraZoom: 1,
      cameraPanX: 0,
      cameraPanY: 0,
    },
    {
      id: uuidv4(),
      title: 'The Discovery',
      description: 'They find something magical...',
      narration: 'Suddenly, they discovered a magical glowing butterfly!',
      backgroundId: 'forest',
      characters: [
        {
          id: uuidv4(),
          templateId: 'luna',
          name: 'Luna',
          x: 40,
          y: 65,
          scale: 1,
          flipX: false,
          expression: 'surprised',
          zIndex: 1,
        },
        {
          id: uuidv4(),
          templateId: 'max',
          name: 'Max',
          x: 60,
          y: 68,
          scale: 1,
          flipX: true,
          expression: 'surprised',
          zIndex: 2,
        },
      ],
      animations: [],
      duration: 5000,
      transition: 'slide',
      cameraZoom: 1.1,
      cameraPanX: 0,
      cameraPanY: 0,
    },
    {
      id: uuidv4(),
      title: 'Happy Ending',
      description: 'The adventure ends with joy',
      narration: 'And they all lived happily ever after. The end!',
      backgroundId: 'sunset',
      characters: [
        {
          id: uuidv4(),
          templateId: 'luna',
          name: 'Luna',
          x: 35,
          y: 72,
          scale: 1,
          flipX: false,
          expression: 'happy',
          zIndex: 1,
        },
        {
          id: uuidv4(),
          templateId: 'max',
          name: 'Max',
          x: 55,
          y: 70,
          scale: 1,
          flipX: false,
          expression: 'happy',
          zIndex: 2,
        },
        {
          id: uuidv4(),
          templateId: 'pip',
          name: 'Pip',
          x: 75,
          y: 75,
          scale: 0.8,
          flipX: true,
          expression: 'happy',
          zIndex: 3,
        },
      ],
      animations: [],
      duration: 5000,
      transition: 'fade',
      cameraZoom: 1,
      cameraPanX: 0,
      cameraPanY: 0,
    },
  ],
  audioTracks: [],
  settings: {
    resolution: { width: 1280, height: 720 },
    fps: 30,
    defaultSceneDuration: 5000,
    autoNarration: true,
    narratorVoice: 'default',
  },
});

interface StudioStore {
  // Project state
  project: Project;
  savedProjects: Project[];
  
  // Editor state
  editor: EditorState;
  
  // Playback state
  playback: PlaybackState;
  
  // Project actions
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  newProject: () => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  
  // Scene actions
  addScene: () => void;
  addSceneFromData: (scene: Scene) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  duplicateScene: (sceneId: string) => void;
  
  // Character actions
  addCharacter: (sceneId: string, templateId: string) => void;
  addCharacterToScene: (sceneId: string, character: CharacterInstance) => void;
  updateCharacter: (sceneId: string, characterId: string, updates: Partial<CharacterInstance>) => void;
  removeCharacter: (sceneId: string, characterId: string) => void;
  
  // Animation actions
  addKeyframe: (sceneId: string, characterId: string, keyframe: Keyframe) => void;
  updateAnimation: (sceneId: string, characterId: string, animation: CharacterAnimation) => void;
  
  // Editor actions
  selectScene: (sceneId: string | null) => void;
  selectCharacter: (characterId: string | null) => void;
  setEditorState: (updates: Partial<EditorState>) => void;
  
  // Playback actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  nextScene: () => void;
  prevScene: () => void;
}

export const useStudioStore = create<StudioStore>()(
  persist(
    (set, get) => ({
      project: createDefaultProject(),
      savedProjects: [],
      
      editor: {
        selectedSceneId: null,
        selectedCharacterId: null,
        isPlaying: false,
        currentTime: 0,
        zoom: 1,
        showGrid: false,
        showTimeline: true,
      },
      
      playback: {
        isPlaying: false,
        isPaused: false,
        currentSceneIndex: 0,
        currentTime: 0,
        totalDuration: 0,
      },
      
      // Project actions
      setProject: (project) => set({ project }),
      
      updateProject: (updates) => set((state) => ({
        project: { ...state.project, ...updates, updatedAt: Date.now() },
      })),
      
      newProject: () => set({ project: createDefaultProject() }),
      
      saveProject: () => set((state) => {
        const existingIndex = state.savedProjects.findIndex(
          (p) => p.id === state.project.id
        );
        const updatedProject = { ...state.project, updatedAt: Date.now() };
        
        if (existingIndex >= 0) {
          const newSaved = [...state.savedProjects];
          newSaved[existingIndex] = updatedProject;
          return { savedProjects: newSaved, project: updatedProject };
        }
        
        return {
          savedProjects: [...state.savedProjects, updatedProject],
          project: updatedProject,
        };
      }),
      
      loadProject: (id) => set((state) => {
        const project = state.savedProjects.find((p) => p.id === id);
        if (project) {
          return { project: { ...project } };
        }
        return {};
      }),
      
      deleteProject: (id) => set((state) => ({
        savedProjects: state.savedProjects.filter((p) => p.id !== id),
      })),
      
      // Scene actions
      addScene: () => set((state) => {
        const newScene: Scene = {
          id: uuidv4(),
          title: `Scene ${state.project.scenes.length + 1}`,
          description: 'New scene',
          narration: '',
          backgroundId: 'meadow',
          characters: [],
          animations: [],
          duration: state.project.settings.defaultSceneDuration,
          transition: 'fade',
          cameraZoom: 1,
          cameraPanX: 0,
          cameraPanY: 0,
        };
        
        return {
          project: {
            ...state.project,
            scenes: [...state.project.scenes, newScene],
            updatedAt: Date.now(),
          },
          editor: {
            ...state.editor,
            selectedSceneId: newScene.id,
          },
        };
      }),
      
      updateScene: (sceneId, updates) => set((state) => ({
        project: {
          ...state.project,
          scenes: state.project.scenes.map((scene) =>
            scene.id === sceneId ? { ...scene, ...updates } : scene
          ),
          updatedAt: Date.now(),
        },
      })),
      
      deleteScene: (sceneId) => set((state) => ({
        project: {
          ...state.project,
          scenes: state.project.scenes.filter((s) => s.id !== sceneId),
          updatedAt: Date.now(),
        },
        editor: {
          ...state.editor,
          selectedSceneId: state.editor.selectedSceneId === sceneId ? null : state.editor.selectedSceneId,
        },
      })),
      
      reorderScenes: (fromIndex, toIndex) => set((state) => {
        const scenes = [...state.project.scenes];
        const [removed] = scenes.splice(fromIndex, 1);
        scenes.splice(toIndex, 0, removed);
        
        return {
          project: { ...state.project, scenes, updatedAt: Date.now() },
        };
      }),
      
      duplicateScene: (sceneId) => set((state) => {
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return {};
        
        const newScene: Scene = {
          ...scene,
          id: uuidv4(),
          title: `${scene.title} (Copy)`,
          characters: scene.characters.map((c) => ({ ...c, id: uuidv4() })),
        };
        
        const index = state.project.scenes.findIndex((s) => s.id === sceneId);
        const scenes = [...state.project.scenes];
        scenes.splice(index + 1, 0, newScene);
        
        return {
          project: { ...state.project, scenes, updatedAt: Date.now() },
        };
      }),
      
      // Add scene from template data
      addSceneFromData: (scene) => set((state) => ({
        project: {
          ...state.project,
          scenes: [...state.project.scenes, scene],
          updatedAt: Date.now(),
        },
        editor: {
          ...state.editor,
          selectedSceneId: scene.id,
        },
      })),

      // Character actions
      addCharacter: (sceneId, templateId) => set((state) => {
        const template = CHARACTER_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return {};
        
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return {};
        
        const newCharacter: CharacterInstance = {
          id: uuidv4(),
          templateId,
          name: template.displayName,
          x: 50,
          y: 70,
          scale: 1,
          flipX: false,
          expression: 'neutral',
          zIndex: scene.characters.length + 1,
        };
        
        return {
          project: {
            ...state.project,
            scenes: state.project.scenes.map((s) =>
              s.id === sceneId
                ? { ...s, characters: [...s.characters, newCharacter] }
                : s
            ),
            updatedAt: Date.now(),
          },
        };
      }),

      // Add character instance directly to scene
      addCharacterToScene: (sceneId, character) => set((state) => ({
        project: {
          ...state.project,
          scenes: state.project.scenes.map((s) =>
            s.id === sceneId
              ? { ...s, characters: [...s.characters, character] }
              : s
          ),
          updatedAt: Date.now(),
        },
      })),
      
      updateCharacter: (sceneId, characterId, updates) => set((state) => ({
        project: {
          ...state.project,
          scenes: state.project.scenes.map((scene) =>
            scene.id === sceneId
              ? {
                  ...scene,
                  characters: scene.characters.map((char) =>
                    char.id === characterId ? { ...char, ...updates } : char
                  ),
                }
              : scene
          ),
          updatedAt: Date.now(),
        },
      })),
      
      removeCharacter: (sceneId, characterId) => set((state) => ({
        project: {
          ...state.project,
          scenes: state.project.scenes.map((scene) =>
            scene.id === sceneId
              ? {
                  ...scene,
                  characters: scene.characters.filter((c) => c.id !== characterId),
                }
              : scene
          ),
          updatedAt: Date.now(),
        },
        editor: {
          ...state.editor,
          selectedCharacterId:
            state.editor.selectedCharacterId === characterId
              ? null
              : state.editor.selectedCharacterId,
        },
      })),
      
      // Animation actions
      addKeyframe: (sceneId, characterId, keyframe) => set((state) => {
        const scene = state.project.scenes.find((s) => s.id === sceneId);
        if (!scene) return {};
        
        const existingAnim = scene.animations.find((a) => a.characterId === characterId);
        
        let newAnimations: CharacterAnimation[];
        if (existingAnim) {
          newAnimations = scene.animations.map((a) =>
            a.characterId === characterId
              ? { ...a, keyframes: [...a.keyframes, keyframe].sort((x, y) => x.time - y.time) }
              : a
          );
        } else {
          newAnimations = [
            ...scene.animations,
            { characterId, keyframes: [keyframe] },
          ];
        }
        
        return {
          project: {
            ...state.project,
            scenes: state.project.scenes.map((s) =>
              s.id === sceneId ? { ...s, animations: newAnimations } : s
            ),
            updatedAt: Date.now(),
          },
        };
      }),
      
      updateAnimation: (sceneId, characterId, animation) => set((state) => ({
        project: {
          ...state.project,
          scenes: state.project.scenes.map((scene) =>
            scene.id === sceneId
              ? {
                  ...scene,
                  animations: scene.animations.map((a) =>
                    a.characterId === characterId ? animation : a
                  ),
                }
              : scene
          ),
          updatedAt: Date.now(),
        },
      })),
      
      // Editor actions
      selectScene: (sceneId) => set((state) => ({
        editor: { ...state.editor, selectedSceneId: sceneId, selectedCharacterId: null },
      })),
      
      selectCharacter: (characterId) => set((state) => ({
        editor: { ...state.editor, selectedCharacterId: characterId },
      })),
      
      setEditorState: (updates) => set((state) => ({
        editor: { ...state.editor, ...updates },
      })),
      
      // Playback actions
      play: () => set((state) => ({
        playback: { ...state.playback, isPlaying: true, isPaused: false },
      })),
      
      pause: () => set((state) => ({
        playback: { ...state.playback, isPlaying: false, isPaused: true },
      })),
      
      stop: () => set((state) => ({
        playback: {
          ...state.playback,
          isPlaying: false,
          isPaused: false,
          currentSceneIndex: 0,
          currentTime: 0,
        },
      })),
      
      setCurrentTime: (time) => set((state) => ({
        playback: { ...state.playback, currentTime: time },
      })),
      
      nextScene: () => set((state) => {
        const nextIndex = Math.min(
          state.playback.currentSceneIndex + 1,
          state.project.scenes.length - 1
        );
        return {
          playback: { ...state.playback, currentSceneIndex: nextIndex, currentTime: 0 },
        };
      }),
      
      prevScene: () => set((state) => {
        const prevIndex = Math.max(state.playback.currentSceneIndex - 1, 0);
        return {
          playback: { ...state.playback, currentSceneIndex: prevIndex, currentTime: 0 },
        };
      }),
    }),
    {
      name: 'cartoon-studio-storage',
      partialize: (state) => ({
        project: state.project,
        savedProjects: state.savedProjects,
      }),
    }
  )
);
