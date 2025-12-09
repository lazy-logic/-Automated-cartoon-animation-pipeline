'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ChevronDown } from 'lucide-react';
import { 
  TransitionType, 
  TransitionConfig, 
  TRANSITION_PRESETS, 
  getTransitionsByCategory,
  createDefaultTransition 
} from '@/lib/utils/scene-transitions';

interface TransitionPickerProps {
  value: TransitionConfig;
  onChange: (config: TransitionConfig) => void;
  compact?: boolean;
}

export default function TransitionPicker({
  value,
  onChange,
  compact = false,
}: TransitionPickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentPreset = TRANSITION_PRESETS.find(p => p.id === value.type);

  const handleTypeChange = (type: TransitionType) => {
    const preset = TRANSITION_PRESETS.find(p => p.id === type);
    onChange({
      ...value,
      type,
      duration: preset?.defaultDuration || value.duration,
    });
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentPreset?.icon || '⚡'}</span>
            <span className="text-white text-sm">{currentPreset?.name || 'None'}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-20 max-h-64 overflow-y-auto"
          >
            {TRANSITION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  handleTypeChange(preset.id);
                  setIsExpanded(false);
                }}
                className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors ${
                  value.type === preset.id ? 'bg-purple-500/20 text-purple-400' : 'text-gray-300'
                }`}
              >
                <span className="text-lg">{preset.icon}</span>
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Categories */}
      {(['basic', 'slide', 'zoom', 'creative'] as const).map((category) => {
        const presets = getTransitionsByCategory(category);
        
        return (
          <div key={category}>
            <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleTypeChange(preset.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    value.type === preset.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                  title={preset.description}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-xs text-gray-300">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Duration */}
      <div className="p-3 bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <label className="text-gray-300 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration
          </label>
          <span className="text-purple-400 font-mono text-sm">{value.duration}ms</span>
        </div>
        <input
          type="range"
          min={100}
          max={2000}
          step={100}
          value={value.duration}
          onChange={(e) => onChange({ ...value, duration: Number(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </div>

      {/* Easing */}
      <div className="p-3 bg-gray-800 rounded-xl">
        <label className="text-gray-300 text-sm flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          Easing
        </label>
        <div className="grid grid-cols-5 gap-1">
          {(['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring'] as const).map((easing) => (
            <button
              key={easing}
              onClick={() => onChange({ ...value, easing })}
              className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                value.easing === easing
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {easing.split('-').map(w => w.charAt(0).toUpperCase()).join('')}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-800 rounded-xl">
        <div className="text-gray-400 text-xs mb-2">Preview</div>
        <div className="relative h-16 bg-gray-900 rounded-lg overflow-hidden">
          <motion.div
            key={`${value.type}-${value.duration}`}
            initial={{ opacity: 0, x: value.type.includes('left') ? 100 : value.type.includes('right') ? -100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: value.duration / 1000 }}
            className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
          >
            <span className="text-white text-sm font-medium">{currentPreset?.name}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Inline transition indicator for scene timeline
export function TransitionIndicator({
  transition,
  onClick,
}: {
  transition: TransitionConfig;
  onClick?: () => void;
}) {
  const preset = TRANSITION_PRESETS.find(p => p.id === transition.type);
  
  if (transition.type === 'none') return null;

  return (
    <button
      onClick={onClick}
      className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      title={`${preset?.name} (${transition.duration}ms)`}
    >
      <span className="text-xs">{preset?.icon}</span>
    </button>
  );
}
