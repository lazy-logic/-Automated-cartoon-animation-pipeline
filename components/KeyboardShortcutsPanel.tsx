'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    category: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
      { keys: ['Ctrl', 'Y'], description: 'Redo last action' },
      { keys: ['Ctrl', 'S'], description: 'Save project' },
      { keys: ['Ctrl', 'O'], description: 'Open project' },
      { keys: ['Ctrl', 'N'], description: 'New project' },
      { keys: ['Esc'], description: 'Close modal/panel' },
    ],
  },
  {
    category: 'Playback',
    shortcuts: [
      { keys: ['Space'], description: 'Play/Pause' },
      { keys: ['←'], description: 'Previous scene' },
      { keys: ['→'], description: 'Next scene' },
      { keys: ['Home'], description: 'Go to first scene' },
      { keys: ['End'], description: 'Go to last scene' },
      { keys: ['M'], description: 'Toggle mute' },
    ],
  },
  {
    category: 'Scene Editor',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected character' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected' },
      { keys: ['Ctrl', 'A'], description: 'Select all characters' },
      { keys: ['+'], description: 'Zoom in camera' },
      { keys: ['-'], description: 'Zoom out camera' },
      { keys: ['0'], description: 'Reset camera' },
    ],
  },
  {
    category: 'Timeline',
    shortcuts: [
      { keys: ['Ctrl', 'Shift', 'D'], description: 'Duplicate scene' },
      { keys: ['Ctrl', 'Shift', '←'], description: 'Move scene left' },
      { keys: ['Ctrl', 'Shift', '→'], description: 'Move scene right' },
      { keys: ['1-9'], description: 'Jump to scene 1-9' },
    ],
  },
];

export default function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Keyboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
                <p className="text-sm text-gray-400">Quick reference for all shortcuts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SHORTCUTS.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Command className="w-4 h-4 text-purple-400" />
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.shortcuts.map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                      >
                        <span className="text-gray-300 text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              <kbd className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white font-mono">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-gray-500 text-xs">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <p className="text-purple-300 text-sm">
                💡 <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">?</kbd> anywhere to open this panel.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
