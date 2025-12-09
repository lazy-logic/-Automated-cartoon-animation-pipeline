/**
 * Undo/Redo System
 * Tracks edit history for scenes, characters, and camera adjustments
 */

export interface HistoryState<T> {
  data: T;
  timestamp: number;
  action: string;
  description?: string;
}

export interface UndoRedoOptions {
  maxHistory?: number;
  debounceMs?: number;
}

/**
 * Generic Undo/Redo Manager
 */
export class UndoRedoManager<T> {
  private history: HistoryState<T>[] = [];
  private currentIndex: number = -1;
  private maxHistory: number;
  private debounceMs: number;
  private lastActionTime: number = 0;
  private pendingState: T | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Callbacks
  public onStateChange: ((state: T, action: string) => void) | null = null;
  public onHistoryChange: ((canUndo: boolean, canRedo: boolean) => void) | null = null;

  constructor(initialState: T, options: UndoRedoOptions = {}) {
    this.maxHistory = options.maxHistory || 50;
    this.debounceMs = options.debounceMs || 300;
    
    // Initialize with first state
    this.pushState(initialState, 'initial', 'Initial state');
  }

  /**
   * Push a new state to history
   */
  pushState(state: T, action: string, description?: string): void {
    const now = Date.now();

    // Debounce rapid changes
    if (this.debounceMs > 0 && now - this.lastActionTime < this.debounceMs) {
      this.pendingState = state;
      
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        if (this.pendingState) {
          this.commitState(this.pendingState, action, description);
          this.pendingState = null;
        }
      }, this.debounceMs);
      
      return;
    }

    this.commitState(state, action, description);
    this.lastActionTime = now;
  }

  private commitState(state: T, action: string, description?: string): void {
    // Remove any redo states
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push({
      data: this.cloneState(state),
      timestamp: Date.now(),
      action,
      description,
    });

    // Trim history if needed
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    this.currentIndex = this.history.length - 1;
    this.notifyHistoryChange();
  }

  /**
   * Undo to previous state
   */
  undo(): T | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    const state = this.history[this.currentIndex];
    
    this.onStateChange?.(this.cloneState(state.data), 'undo');
    this.notifyHistoryChange();
    
    return this.cloneState(state.data);
  }

  /**
   * Redo to next state
   */
  redo(): T | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const state = this.history[this.currentIndex];
    
    this.onStateChange?.(this.cloneState(state.data), 'redo');
    this.notifyHistoryChange();
    
    return this.cloneState(state.data);
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrentState(): T | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.cloneState(this.history[this.currentIndex].data);
  }

  /**
   * Get history info
   */
  getHistoryInfo(): { total: number; current: number; actions: string[] } {
    return {
      total: this.history.length,
      current: this.currentIndex,
      actions: this.history.map(h => h.action),
    };
  }

  /**
   * Get recent actions for display
   */
  getRecentActions(count: number = 10): { action: string; description?: string; isCurrent: boolean }[] {
    const start = Math.max(0, this.currentIndex - count + 1);
    const end = Math.min(this.history.length, this.currentIndex + count);
    
    return this.history.slice(start, end).map((h, i) => ({
      action: h.action,
      description: h.description,
      isCurrent: start + i === this.currentIndex,
    }));
  }

  /**
   * Clear all history
   */
  clear(newInitialState?: T): void {
    this.history = [];
    this.currentIndex = -1;
    
    if (newInitialState) {
      this.pushState(newInitialState, 'initial', 'Initial state');
    }
    
    this.notifyHistoryChange();
  }

  /**
   * Jump to specific history index
   */
  jumpTo(index: number): T | null {
    if (index < 0 || index >= this.history.length) return null;

    this.currentIndex = index;
    const state = this.history[this.currentIndex];
    
    this.onStateChange?.(this.cloneState(state.data), 'jump');
    this.notifyHistoryChange();
    
    return this.cloneState(state.data);
  }

  private cloneState(state: T): T {
    return JSON.parse(JSON.stringify(state));
  }

  private notifyHistoryChange(): void {
    this.onHistoryChange?.(this.canUndo(), this.canRedo());
  }
}

// Action types for scene editing
export const EDIT_ACTIONS = {
  // Character actions
  MOVE_CHARACTER: 'move_character',
  SCALE_CHARACTER: 'scale_character',
  FLIP_CHARACTER: 'flip_character',
  CHANGE_ANIMATION: 'change_animation',
  CHANGE_EXPRESSION: 'change_expression',
  ADD_CHARACTER: 'add_character',
  REMOVE_CHARACTER: 'remove_character',
  
  // Scene actions
  CHANGE_BACKGROUND: 'change_background',
  CHANGE_NARRATION: 'change_narration',
  CHANGE_DURATION: 'change_duration',
  ADD_SCENE: 'add_scene',
  REMOVE_SCENE: 'remove_scene',
  REORDER_SCENES: 'reorder_scenes',
  
  // Camera actions
  CHANGE_CAMERA_ZOOM: 'change_camera_zoom',
  CHANGE_CAMERA_PAN: 'change_camera_pan',
  APPLY_CAMERA_PRESET: 'apply_camera_preset',
  
  // Prop actions
  ADD_PROP: 'add_prop',
  REMOVE_PROP: 'remove_prop',
  MOVE_PROP: 'move_prop',
  
  // Bulk actions
  APPLY_TEMPLATE: 'apply_template',
  IMPORT_PROJECT: 'import_project',
  RESET_SCENE: 'reset_scene',
} as const;

export type EditAction = typeof EDIT_ACTIONS[keyof typeof EDIT_ACTIONS];

/**
 * Get human-readable description for action
 */
export function getActionDescription(action: EditAction, details?: Record<string, any>): string {
  const descriptions: Record<EditAction, string> = {
    move_character: details?.name ? `Move ${details.name}` : 'Move character',
    scale_character: details?.name ? `Resize ${details.name}` : 'Resize character',
    flip_character: details?.name ? `Flip ${details.name}` : 'Flip character',
    change_animation: details?.animation ? `Set animation to ${details.animation}` : 'Change animation',
    change_expression: details?.expression ? `Set expression to ${details.expression}` : 'Change expression',
    add_character: details?.name ? `Add ${details.name}` : 'Add character',
    remove_character: details?.name ? `Remove ${details.name}` : 'Remove character',
    change_background: details?.background ? `Change background to ${details.background}` : 'Change background',
    change_narration: 'Edit narration',
    change_duration: details?.duration ? `Set duration to ${details.duration}s` : 'Change duration',
    add_scene: 'Add scene',
    remove_scene: 'Remove scene',
    reorder_scenes: 'Reorder scenes',
    change_camera_zoom: details?.zoom ? `Set zoom to ${details.zoom}x` : 'Change camera zoom',
    change_camera_pan: 'Pan camera',
    apply_camera_preset: details?.preset ? `Apply ${details.preset} shot` : 'Apply camera preset',
    add_prop: details?.prop ? `Add ${details.prop}` : 'Add prop',
    remove_prop: details?.prop ? `Remove ${details.prop}` : 'Remove prop',
    move_prop: 'Move prop',
    apply_template: details?.template ? `Apply ${details.template} template` : 'Apply template',
    import_project: 'Import project',
    reset_scene: 'Reset scene',
  };

  return descriptions[action] || action;
}

// React hook for undo/redo
import { useState, useCallback, useRef, useEffect } from 'react';

export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions = {}
) {
  const managerRef = useRef<UndoRedoManager<T> | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentState, setCurrentState] = useState<T>(initialState);

  // Initialize manager
  useEffect(() => {
    managerRef.current = new UndoRedoManager(initialState, options);
    
    managerRef.current.onStateChange = (state) => {
      setCurrentState(state);
    };
    
    managerRef.current.onHistoryChange = (undo, redo) => {
      setCanUndo(undo);
      setCanRedo(redo);
    };

    return () => {
      managerRef.current = null;
    };
  }, []);

  const pushState = useCallback((state: T, action: EditAction, details?: Record<string, any>) => {
    if (managerRef.current) {
      managerRef.current.pushState(state, action, getActionDescription(action, details));
      setCurrentState(state);
    }
  }, []);

  const undo = useCallback(() => {
    const state = managerRef.current?.undo();
    if (state) setCurrentState(state);
    return state;
  }, []);

  const redo = useCallback(() => {
    const state = managerRef.current?.redo();
    if (state) setCurrentState(state);
    return state;
  }, []);

  const getHistory = useCallback(() => {
    return managerRef.current?.getRecentActions(10) || [];
  }, []);

  return {
    state: currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistory,
  };
}
