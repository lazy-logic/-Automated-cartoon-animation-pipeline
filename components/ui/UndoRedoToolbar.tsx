'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo2,
  Redo2,
  History,
  X,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { UndoRedoManager, EDIT_ACTIONS, getActionDescription } from '@/lib/utils/undo-redo';

interface HistoryEntry {
  timestamp: number;
  action: string;
  description?: string;
}

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  history?: HistoryEntry[];
  currentIndex?: number;
  onJumpToState?: (index: number) => void;
  isCompact?: boolean;
}

export default function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  history = [],
  currentIndex = -1,
  onJumpToState,
  isCompact = false,
}: UndoRedoToolbarProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            if (canRedo) onRedo();
          } else {
            e.preventDefault();
            if (canUndo) onUndo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          if (canRedo) onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case EDIT_ACTIONS.MOVE_CHARACTER:
        return '🚶';
      case EDIT_ACTIONS.SCALE_CHARACTER:
        return '📏';
      case EDIT_ACTIONS.CHANGE_EXPRESSION:
        return '😀';
      case EDIT_ACTIONS.CHANGE_ANIMATION:
        return '🎬';
      case EDIT_ACTIONS.CHANGE_NARRATION:
        return '📝';
      case EDIT_ACTIONS.CHANGE_BACKGROUND:
        return '🖼️';
      case EDIT_ACTIONS.CHANGE_CAMERA_ZOOM:
      case EDIT_ACTIONS.CHANGE_CAMERA_PAN:
        return '📷';
      case EDIT_ACTIONS.ADD_CHARACTER:
        return '➕';
      case EDIT_ACTIONS.REMOVE_CHARACTER:
        return '➖';
      case EDIT_ACTIONS.REORDER_SCENES:
        return '🔀';
      case EDIT_ACTIONS.ADD_SCENE:
        return '📋';
      default:
        return '✏️';
    }
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-lg transition-colors ${
            canUndo 
              ? 'hover:bg-white/10 text-gray-300' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className={`p-2 rounded-lg transition-colors ${
            canRedo 
              ? 'hover:bg-white/10 text-gray-300' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-white/10">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-2 rounded-lg transition-all ${
            canUndo 
              ? 'hover:bg-white/10 text-white active:scale-95' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-5 h-5" />
        </button>
        
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
          className={`p-2 rounded-lg transition-all ${
            canRedo 
              ? 'hover:bg-white/10 text-white active:scale-95' 
              : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-white/20" />

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
        >
          <History className="w-4 h-4" />
          <span className="text-sm">History</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 z-50 w-80 bg-slate-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-white font-medium">Edit History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No edit history yet
                </div>
              ) : (
                <div className="p-2">
                  {history.map((entry, index) => (
                    <button
                      key={index}
                      onClick={() => onJumpToState?.(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        index === currentIndex
                          ? 'bg-purple-500/30 text-white'
                          : index > currentIndex
                            ? 'text-gray-500 hover:bg-white/5'
                            : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{getActionIcon(entry.action)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.description || getActionDescription(entry.action as any)}
                        </p>
                        <p className="text-xs text-gray-500">{formatTime(entry.timestamp)}</p>
                      </div>
                      {index === currentIndex && (
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing undo/redo state
export function useUndoRedo<T>(initialState: T, maxHistory = 50) {
  const [history, setHistory] = useState<{ state: T; action: string; timestamp: number; description?: string }[]>([
    { state: initialState, action: 'initial', timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex]?.state || initialState;

  const pushState = useCallback((newState: T, action: string, description?: string) => {
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add new state
      newHistory.push({
        state: JSON.parse(JSON.stringify(newState)), // Deep clone
        action,
        timestamp: Date.now(),
        description,
      });
      
      // Trim if needed
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory);
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1]?.state;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1]?.state;
    }
    return null;
  }, [currentIndex, history]);

  const jumpToState = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      setCurrentIndex(index);
      return history[index]?.state;
    }
    return null;
  }, [history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const historyEntries = history.map(h => ({
    timestamp: h.timestamp,
    action: h.action,
    description: h.description,
  }));

  return {
    currentState,
    pushState,
    undo,
    redo,
    jumpToState,
    canUndo,
    canRedo,
    history: historyEntries,
    currentIndex,
  };
}
