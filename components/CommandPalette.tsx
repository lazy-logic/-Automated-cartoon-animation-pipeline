'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  Play,
  Pause,
  Save,
  FolderOpen,
  Download,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Settings,
  Keyboard,
  Users,
  Mic,
  Film,
  Image,
  Music,
  Volume2,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Maximize,
  Grid,
  Sparkles,
  Wand2,
  ChevronRight,
} from 'lucide-react';

export interface CommandAction {
  id: string;
  name: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'playback' | 'file' | 'edit' | 'scene' | 'view' | 'tools' | 'ai';
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandAction[];
}

const CATEGORY_LABELS: Record<string, string> = {
  playback: 'Playback',
  file: 'File',
  edit: 'Edit',
  scene: 'Scene',
  view: 'View',
  tools: 'Tools',
  ai: 'AI',
};

const CATEGORY_ORDER = ['playback', 'file', 'edit', 'scene', 'view', 'tools', 'ai'];

export default function CommandPalette({
  isOpen,
  onClose,
  actions,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;

    const lowerQuery = query.toLowerCase();
    return actions.filter((action) => {
      const nameMatch = action.name.toLowerCase().includes(lowerQuery);
      const descMatch = action.description?.toLowerCase().includes(lowerQuery);
      const keywordMatch = action.keywords?.some((k) => k.toLowerCase().includes(lowerQuery));
      return nameMatch || descMatch || keywordMatch;
    });
  }, [actions, query]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandAction[]> = {};
    
    for (const action of filteredActions) {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    }
    
    return groups;
  }, [filteredActions]);

  // Flat list for keyboard navigation
  const flatActions = useMemo(() => {
    const result: CommandAction[] = [];
    for (const category of CATEGORY_ORDER) {
      if (groupedActions[category]) {
        result.push(...groupedActions[category]);
      }
    }
    return result;
  }, [groupedActions]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatActions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatActions[selectedIndex]) {
            flatActions[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatActions, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatActions[selectedIndex]) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, flatActions]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
            />
            <kbd className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
            {flatActions.length === 0 ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No commands found</p>
                <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="py-2">
                {CATEGORY_ORDER.map((category) => {
                  const categoryActions = groupedActions[category];
                  if (!categoryActions || categoryActions.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="px-4 py-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {CATEGORY_LABELS[category]}
                        </span>
                      </div>
                      {categoryActions.map((action) => {
                        const globalIndex = flatActions.indexOf(action);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={action.id}
                            data-index={globalIndex}
                            onClick={() => {
                              action.action();
                              onClose();
                            }}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors ${
                              isSelected
                                ? 'bg-purple-500/20 text-white'
                                : 'text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            <span className={`${isSelected ? 'text-purple-400' : 'text-gray-500'}`}>
                              {action.icon}
                            </span>
                            <div className="flex-1 text-left">
                              <div className="font-medium">{action.name}</div>
                              {action.description && (
                                <div className="text-sm text-gray-500">{action.description}</div>
                              )}
                            </div>
                            {action.shortcut && (
                              <kbd className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                                {action.shortcut}
                              </kbd>
                            )}
                            <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-gray-600'}`} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-800 rounded border border-gray-700">↵</kbd>
                Select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span>K to open</span>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Default command actions factory
export function createDefaultCommands(handlers: {
  onPlay?: () => void;
  onPause?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onAddScene?: () => void;
  onDuplicateScene?: () => void;
  onDeleteScene?: () => void;
  onEditScene?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSettings?: () => void;
  onKeyboardShortcuts?: () => void;
  onCollaboration?: () => void;
  onTTSSettings?: () => void;
  onStoryboard?: () => void;
  onFullscreen?: () => void;
  onToggleMute?: () => void;
  onAIRegenerate?: () => void;
  onAISuggest?: () => void;
}): CommandAction[] {
  return [
    // Playback
    {
      id: 'play',
      name: 'Play',
      description: 'Start playback',
      icon: <Play className="w-4 h-4" />,
      shortcut: 'Space',
      category: 'playback',
      action: handlers.onPlay || (() => {}),
      keywords: ['start', 'preview'],
    },
    {
      id: 'pause',
      name: 'Pause',
      description: 'Pause playback',
      icon: <Pause className="w-4 h-4" />,
      shortcut: 'Space',
      category: 'playback',
      action: handlers.onPause || (() => {}),
      keywords: ['stop'],
    },
    {
      id: 'toggle-mute',
      name: 'Toggle Mute',
      description: 'Mute or unmute audio',
      icon: <Volume2 className="w-4 h-4" />,
      shortcut: 'M',
      category: 'playback',
      action: handlers.onToggleMute || (() => {}),
      keywords: ['sound', 'audio'],
    },

    // File
    {
      id: 'save',
      name: 'Save Project',
      description: 'Save current project',
      icon: <Save className="w-4 h-4" />,
      shortcut: 'Ctrl+S',
      category: 'file',
      action: handlers.onSave || (() => {}),
      keywords: ['store', 'persist'],
    },
    {
      id: 'load',
      name: 'Load Project',
      description: 'Open an existing project',
      icon: <FolderOpen className="w-4 h-4" />,
      shortcut: 'Ctrl+O',
      category: 'file',
      action: handlers.onLoad || (() => {}),
      keywords: ['open', 'import'],
    },
    {
      id: 'export',
      name: 'Export Video',
      description: 'Export as video file',
      icon: <Download className="w-4 h-4" />,
      shortcut: 'Ctrl+E',
      category: 'file',
      action: handlers.onExport || (() => {}),
      keywords: ['download', 'render'],
    },

    // Edit
    {
      id: 'undo',
      name: 'Undo',
      description: 'Undo last action',
      icon: <Undo className="w-4 h-4" />,
      shortcut: 'Ctrl+Z',
      category: 'edit',
      action: handlers.onUndo || (() => {}),
      keywords: ['revert', 'back'],
    },
    {
      id: 'redo',
      name: 'Redo',
      description: 'Redo last undone action',
      icon: <Redo className="w-4 h-4" />,
      shortcut: 'Ctrl+Y',
      category: 'edit',
      action: handlers.onRedo || (() => {}),
      keywords: ['forward'],
    },

    // Scene
    {
      id: 'add-scene',
      name: 'Add Scene',
      description: 'Add a new scene',
      icon: <Plus className="w-4 h-4" />,
      shortcut: 'Ctrl+N',
      category: 'scene',
      action: handlers.onAddScene || (() => {}),
      keywords: ['new', 'create'],
    },
    {
      id: 'duplicate-scene',
      name: 'Duplicate Scene',
      description: 'Duplicate current scene',
      icon: <Copy className="w-4 h-4" />,
      shortcut: 'Ctrl+D',
      category: 'scene',
      action: handlers.onDuplicateScene || (() => {}),
      keywords: ['copy', 'clone'],
    },
    {
      id: 'delete-scene',
      name: 'Delete Scene',
      description: 'Delete current scene',
      icon: <Trash2 className="w-4 h-4" />,
      shortcut: 'Del',
      category: 'scene',
      action: handlers.onDeleteScene || (() => {}),
      keywords: ['remove'],
    },
    {
      id: 'edit-scene',
      name: 'Edit Scene',
      description: 'Open scene editor',
      icon: <Edit3 className="w-4 h-4" />,
      shortcut: 'E',
      category: 'scene',
      action: handlers.onEditScene || (() => {}),
      keywords: ['modify', 'change'],
    },

    // View
    {
      id: 'storyboard',
      name: 'Storyboard View',
      description: 'Open storyboard overview',
      icon: <Grid className="w-4 h-4" />,
      category: 'view',
      action: handlers.onStoryboard || (() => {}),
      keywords: ['overview', 'grid'],
    },
    {
      id: 'fullscreen',
      name: 'Fullscreen',
      description: 'Toggle fullscreen mode',
      icon: <Maximize className="w-4 h-4" />,
      shortcut: 'F',
      category: 'view',
      action: handlers.onFullscreen || (() => {}),
      keywords: ['maximize'],
    },

    // Tools
    {
      id: 'settings',
      name: 'Settings',
      description: 'Open settings panel',
      icon: <Settings className="w-4 h-4" />,
      shortcut: 'Ctrl+,',
      category: 'tools',
      action: handlers.onSettings || (() => {}),
      keywords: ['preferences', 'options'],
    },
    {
      id: 'keyboard-shortcuts',
      name: 'Keyboard Shortcuts',
      description: 'View all shortcuts',
      icon: <Keyboard className="w-4 h-4" />,
      shortcut: '?',
      category: 'tools',
      action: handlers.onKeyboardShortcuts || (() => {}),
      keywords: ['hotkeys', 'keys'],
    },
    {
      id: 'collaboration',
      name: 'Collaboration',
      description: 'Open collaboration panel',
      icon: <Users className="w-4 h-4" />,
      category: 'tools',
      action: handlers.onCollaboration || (() => {}),
      keywords: ['team', 'share'],
    },
    {
      id: 'tts-settings',
      name: 'Voice Settings',
      description: 'Configure text-to-speech',
      icon: <Mic className="w-4 h-4" />,
      category: 'tools',
      action: handlers.onTTSSettings || (() => {}),
      keywords: ['speech', 'narration'],
    },

    // AI
    {
      id: 'ai-regenerate',
      name: 'Regenerate with AI',
      description: 'Regenerate current scene with AI',
      icon: <Sparkles className="w-4 h-4" />,
      category: 'ai',
      action: handlers.onAIRegenerate || (() => {}),
      keywords: ['generate', 'create'],
    },
    {
      id: 'ai-suggest',
      name: 'AI Suggestions',
      description: 'Get AI suggestions for scene',
      icon: <Wand2 className="w-4 h-4" />,
      category: 'ai',
      action: handlers.onAISuggest || (() => {}),
      keywords: ['recommend', 'help'],
    },
  ];
}
