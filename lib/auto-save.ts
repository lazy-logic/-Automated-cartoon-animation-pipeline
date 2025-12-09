// Auto-save system for project persistence

import type { EditableScene } from '@/components/InteractiveSceneEditor';

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number; // How often to auto-save
  maxBackups: number; // How many backups to keep
  debounceMs: number; // Debounce rapid changes
}

export interface SavedProject {
  id: string;
  title: string;
  scenes: EditableScene[];
  characterRoleLabels: Record<string, string>;
  characterRoleDescriptions: Record<string, string>;
  coverImage?: string;
  lastSaved: number;
  version: number;
}

export interface AutoSaveState {
  lastSaveTime: number | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 30000, // 30 seconds
  maxBackups: 5,
  debounceMs: 2000,
};

const STORAGE_KEY = 'cartoon-studio-autosave';
const BACKUP_KEY_PREFIX = 'cartoon-studio-backup-';

// Get auto-save config from localStorage
export function getAutoSaveConfig(): AutoSaveConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  
  try {
    const stored = localStorage.getItem('cartoon-studio-autosave-config');
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load auto-save config:', error);
  }
  
  return DEFAULT_CONFIG;
}

// Save auto-save config
export function saveAutoSaveConfig(config: Partial<AutoSaveConfig>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getAutoSaveConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('cartoon-studio-autosave-config', JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save auto-save config:', error);
  }
}

// Save project to localStorage
export function saveProjectLocally(project: SavedProject): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const projectData = {
      ...project,
      lastSaved: Date.now(),
      version: (project.version || 0) + 1,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectData));
    
    // Create backup
    createBackup(projectData);
    
    return true;
  } catch (error) {
    console.error('Failed to save project:', error);
    return false;
  }
}

// Load project from localStorage
export function loadProjectLocally(): SavedProject | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load project:', error);
  }
  
  return null;
}

// Create a backup
function createBackup(project: SavedProject): void {
  if (typeof window === 'undefined') return;
  
  try {
    const config = getAutoSaveConfig();
    const backupKey = `${BACKUP_KEY_PREFIX}${Date.now()}`;
    
    // Save new backup
    localStorage.setItem(backupKey, JSON.stringify(project));
    
    // Clean up old backups
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(BACKUP_KEY_PREFIX))
      .sort()
      .reverse();
    
    // Remove excess backups
    while (backupKeys.length > config.maxBackups) {
      const oldKey = backupKeys.pop();
      if (oldKey) {
        localStorage.removeItem(oldKey);
      }
    }
  } catch (error) {
    console.warn('Failed to create backup:', error);
  }
}

// Get list of backups
export function getBackups(): { key: string; timestamp: number; project: SavedProject }[] {
  if (typeof window === 'undefined') return [];
  
  const backups: { key: string; timestamp: number; project: SavedProject }[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_KEY_PREFIX)) {
        const timestamp = parseInt(key.replace(BACKUP_KEY_PREFIX, ''), 10);
        const data = localStorage.getItem(key);
        if (data) {
          backups.push({
            key,
            timestamp,
            project: JSON.parse(data),
          });
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get backups:', error);
  }
  
  return backups.sort((a, b) => b.timestamp - a.timestamp);
}

// Restore from backup
export function restoreFromBackup(backupKey: string): SavedProject | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(backupKey);
    if (data) {
      const project = JSON.parse(data);
      // Save as current project
      saveProjectLocally(project);
      return project;
    }
  } catch (error) {
    console.warn('Failed to restore backup:', error);
  }
  
  return null;
}

// Clear all auto-save data
export function clearAutoSaveData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Remove all backups
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(BACKUP_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear auto-save data:', error);
  }
}

// Check if there's unsaved work
export function hasUnsavedWork(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return !!stored;
  } catch {
    return false;
  }
}

// Auto-save manager class
export class AutoSaveManager {
  private config: AutoSaveConfig & { onSave?: (timestamp: Date) => void };
  private data: {
    projectTitle: string;
    scenes: EditableScene[];
    projectId?: string;
    coverImage?: string;
    storyProvider?: string;
  };
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private lastSavedHash: string = '';
  private onSaveCallback: ((timestamp: Date) => void) | null = null;

  constructor(
    data: {
      projectTitle: string;
      scenes: EditableScene[];
      projectId?: string;
      coverImage?: string;
      storyProvider?: string;
    },
    config: Partial<AutoSaveConfig> & { onSave?: (timestamp: Date) => void } = {}
  ) {
    this.data = data;
    this.config = { ...getAutoSaveConfig(), ...config };
    this.onSaveCallback = config.onSave || null;
  }

  // Update data to save
  updateData(data: Partial<{
    projectTitle: string;
    scenes: EditableScene[];
    projectId?: string;
    coverImage?: string;
    storyProvider?: string;
  }>) {
    this.data = { ...this.data, ...data };
  }

  // Start auto-save interval
  start() {
    if (!this.config.enabled) return;
    
    // Clear existing interval
    this.stop();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.save();
    }, this.config.intervalMs);
  }

  // Stop auto-save
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }

  // Debounced save
  debouncedSave() {
    if (!this.config.enabled) return;
    
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.save();
    }, this.config.debounceMs);
  }

  // Immediate save
  save() {
    if (!this.config.enabled) return;
    if (!this.data.scenes || this.data.scenes.length === 0) return;

    // Check if data has changed using hash
    const currentHash = JSON.stringify(this.data);
    if (currentHash === this.lastSavedHash) {
      return; // No changes
    }
    
    const project: SavedProject = {
      id: this.data.projectId || `local-${Date.now()}`,
      title: this.data.projectTitle || 'Untitled Project',
      scenes: this.data.scenes,
      characterRoleLabels: {},
      characterRoleDescriptions: {},
      coverImage: this.data.coverImage,
      lastSaved: Date.now(),
      version: 1,
    };
    
    const success = saveProjectLocally(project);
    
    if (success) {
      this.lastSavedHash = currentHash;
      const timestamp = new Date();
      this.onSaveCallback?.(timestamp);
    }
  }

  // Update config
  updateConfig(config: Partial<AutoSaveConfig>) {
    this.config = { ...this.config, ...config };
    saveAutoSaveConfig(this.config);
  }

  // Get current config
  getConfig(): AutoSaveConfig {
    return { ...this.config };
  }
}

// Format time ago
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
