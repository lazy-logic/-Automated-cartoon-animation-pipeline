'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Moon,
  Sun,
  Monitor,
  Save,
  Clock,
  Keyboard,
  Volume2,
  Grid,
  Eye,
  Trash2,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { ThemeMode, getStoredThemeMode, saveThemeMode, resolveTheme, applyTheme } from '@/lib/utils/theme';
import { getAutoSaveConfig, saveAutoSaveConfig, AutoSaveConfig, getBackups, clearAutoSaveData } from '@/lib/utils/auto-save';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKeyboardShortcuts: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  onOpenKeyboardShortcuts,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'audio' | 'data'>('general');
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [autoSaveConfig, setAutoSaveConfig] = useState<AutoSaveConfig>({
    enabled: true,
    intervalMs: 30000,
    maxBackups: 5,
    debounceMs: 2000,
  });
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(10);
  const [masterVolume, setMasterVolume] = useState(80);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    setThemeMode(getStoredThemeMode());
    setAutoSaveConfig(getAutoSaveConfig());
    
    // Load other settings from localStorage
    if (typeof window !== 'undefined') {
      setShowGrid(localStorage.getItem('cartoon-studio-show-grid') === 'true');
      setSnapToGrid(localStorage.getItem('cartoon-studio-snap-grid') === 'true');
      setGridSize(parseInt(localStorage.getItem('cartoon-studio-grid-size') || '10', 10));
      setMasterVolume(parseInt(localStorage.getItem('cartoon-studio-master-volume') || '80', 10));
    }
  }, [isOpen]);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeMode(mode);
    const theme = resolveTheme(mode);
    applyTheme(theme);
  };

  const handleAutoSaveChange = (updates: Partial<AutoSaveConfig>) => {
    const newConfig = { ...autoSaveConfig, ...updates };
    setAutoSaveConfig(newConfig);
    saveAutoSaveConfig(newConfig);
  };

  const handleGridChange = (show: boolean, snap: boolean, size: number) => {
    setShowGrid(show);
    setSnapToGrid(snap);
    setGridSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartoon-studio-show-grid', String(show));
      localStorage.setItem('cartoon-studio-snap-grid', String(snap));
      localStorage.setItem('cartoon-studio-grid-size', String(size));
    }
  };

  const handleVolumeChange = (volume: number) => {
    setMasterVolume(volume);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartoon-studio-master-volume', String(volume));
    }
  };

  const handleClearData = () => {
    clearAutoSaveData();
    setShowConfirmClear(false);
  };

  const backups = getBackups();

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
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <p className="text-sm text-gray-400">Customize your experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex h-[calc(85vh-80px)]">
            {/* Sidebar */}
            <div className="w-48 border-r border-gray-700 p-2">
              {[
                { id: 'general', label: 'General', icon: Settings },
                { id: 'editor', label: 'Editor', icon: Grid },
                { id: 'audio', label: 'Audio', icon: Volume2 },
                { id: 'data', label: 'Data', icon: Save },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Theme */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Theme
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'system', label: 'System', icon: Monitor },
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleThemeChange(theme.id as ThemeMode)}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            themeMode === theme.id
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <theme.icon className="w-5 h-5" />
                          <span className="text-sm">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-save */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Auto-save
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                        <span className="text-gray-300">Enable auto-save</span>
                        <button
                          onClick={() => handleAutoSaveChange({ enabled: !autoSaveConfig.enabled })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            autoSaveConfig.enabled ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              autoSaveConfig.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </label>
                      
                      <div className="p-3 bg-gray-800 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Save interval</span>
                          <span className="text-purple-400 text-sm">{autoSaveConfig.intervalMs / 1000}s</span>
                        </div>
                        <input
                          type="range"
                          min={10000}
                          max={120000}
                          step={10000}
                          value={autoSaveConfig.intervalMs}
                          onChange={(e) => handleAutoSaveChange({ intervalMs: Number(e.target.value) })}
                          className="w-full accent-purple-500"
                          disabled={!autoSaveConfig.enabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Keyboard className="w-4 h-4" />
                      Keyboard Shortcuts
                    </h3>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenKeyboardShortcuts();
                      }}
                      className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors flex items-center justify-between"
                    >
                      <span className="text-gray-300">View all shortcuts</span>
                      <kbd className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">?</kbd>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="space-y-6">
                  {/* Grid */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Grid className="w-4 h-4" />
                      Grid & Snapping
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                        <span className="text-gray-300">Show grid</span>
                        <button
                          onClick={() => handleGridChange(!showGrid, snapToGrid, gridSize)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            showGrid ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              showGrid ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </label>
                      
                      <label className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                        <span className="text-gray-300">Snap to grid</span>
                        <button
                          onClick={() => handleGridChange(showGrid, !snapToGrid, gridSize)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            snapToGrid ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full transition-transform ${
                              snapToGrid ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </label>
                      
                      <div className="p-3 bg-gray-800 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300 text-sm">Grid size</span>
                          <span className="text-purple-400 text-sm">{gridSize}%</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={25}
                          step={5}
                          value={gridSize}
                          onChange={(e) => handleGridChange(showGrid, snapToGrid, Number(e.target.value))}
                          className="w-full accent-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </h3>
                    <div className="p-3 bg-gray-800 rounded-xl">
                      <p className="text-gray-400 text-sm">
                        Stage zoom and other preview settings are available in the scene editor.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-6">
                  {/* Master Volume */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Master Volume
                    </h3>
                    <div className="p-4 bg-gray-800 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Volume</span>
                        <span className="text-purple-400 font-mono">{masterVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={masterVolume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-300 text-sm">
                      💡 Individual track volumes can be adjusted in the Audio Timeline panel.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  {/* Backups */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Local Backups
                    </h3>
                    <div className="space-y-2">
                      {backups.length === 0 ? (
                        <div className="p-4 bg-gray-800 rounded-xl text-center">
                          <p className="text-gray-400 text-sm">No backups available</p>
                        </div>
                      ) : (
                        backups.slice(0, 5).map((backup) => (
                          <div
                            key={backup.key}
                            className="p-3 bg-gray-800 rounded-xl flex items-center justify-between"
                          >
                            <div>
                              <div className="text-white text-sm">{backup.project.title}</div>
                              <div className="text-gray-500 text-xs">
                                {new Date(backup.timestamp).toLocaleString()}
                              </div>
                            </div>
                            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300">
                              Restore
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Export/Import */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Export & Import</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">Export Settings</span>
                      </button>
                      <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-colors">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">Import Settings</span>
                      </button>
                    </div>
                  </div>

                  {/* Clear Data */}
                  <div>
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-400" />
                      Clear Data
                    </h3>
                    {showConfirmClear ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <p className="text-red-300 text-sm mb-3">
                          This will delete all local backups and auto-saved data. This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleClearData}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                          >
                            Yes, Clear All
                          </button>
                          <button
                            onClick={() => setShowConfirmClear(false)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmClear(true)}
                        className="w-full p-3 bg-gray-800 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 rounded-xl text-left transition-colors"
                      >
                        <span className="text-gray-300">Clear all local data</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
