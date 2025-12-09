'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Volume1,
  Mic,
  Music,
  AudioWaveform,
  Sliders,
} from 'lucide-react';

export interface VolumeChannel {
  id: string;
  name: string;
  type: 'master' | 'narration' | 'music' | 'sfx' | 'ambient';
  volume: number; // 0-100
  muted: boolean;
  solo?: boolean;
}

interface VolumeMixerProps {
  channels: VolumeChannel[];
  onChange: (channels: VolumeChannel[]) => void;
  compact?: boolean;
}

const CHANNEL_ICONS = {
  master: Sliders,
  narration: Mic,
  music: Music,
  sfx: AudioWaveform,
  ambient: Volume2,
};

const CHANNEL_COLORS = {
  master: '#8B5CF6',
  narration: '#3B82F6',
  music: '#EC4899',
  sfx: '#F59E0B',
  ambient: '#10B981',
};

export default function VolumeMixer({
  channels,
  onChange,
  compact = false,
}: VolumeMixerProps) {
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  const updateChannel = (id: string, updates: Partial<VolumeChannel>) => {
    onChange(
      channels.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch))
    );
  };

  const toggleMute = (id: string) => {
    const channel = channels.find((ch) => ch.id === id);
    if (channel) {
      updateChannel(id, { muted: !channel.muted });
    }
  };

  const toggleSolo = (id: string) => {
    const channel = channels.find((ch) => ch.id === id);
    if (channel) {
      // If soloing, mute all others
      if (!channel.solo) {
        onChange(
          channels.map((ch) => ({
            ...ch,
            solo: ch.id === id,
            muted: ch.id !== id && ch.type !== 'master',
          }))
        );
      } else {
        // If un-soloing, unmute all
        onChange(
          channels.map((ch) => ({
            ...ch,
            solo: false,
            muted: false,
          }))
        );
      }
    }
  };

  const getVolumeIcon = (volume: number, muted: boolean) => {
    if (muted || volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {channels.slice(0, 4).map((channel) => {
          const Icon = CHANNEL_ICONS[channel.type] || Volume2;
          const color = CHANNEL_COLORS[channel.type] || '#888';
          
          return (
            <button
              key={channel.id}
              onClick={() => toggleMute(channel.id)}
              className={`p-2 rounded-lg transition-colors ${
                channel.muted ? 'bg-gray-700 text-gray-500' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              style={{ color: channel.muted ? undefined : color }}
              title={`${channel.name}: ${channel.volume}%${channel.muted ? ' (muted)' : ''}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          Volume Mixer
        </h3>
      </div>

      <div className="space-y-3">
        {channels.map((channel) => {
          const Icon = CHANNEL_ICONS[channel.type] || Volume2;
          const VolumeIcon = getVolumeIcon(channel.volume, channel.muted);
          const color = CHANNEL_COLORS[channel.type] || '#888';
          const isExpanded = expandedChannel === channel.id;

          return (
            <div
              key={channel.id}
              className={`bg-gray-800 rounded-xl overflow-hidden transition-all ${
                channel.type === 'master' ? 'border border-purple-500/30' : ''
              }`}
            >
              <div
                className="p-3 flex items-center gap-3 cursor-pointer"
                onClick={() => setExpandedChannel(isExpanded ? null : channel.id)}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color + '20' }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>

                {/* Name & Volume */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{channel.name}</span>
                    <span className="text-gray-400 text-xs font-mono">
                      {channel.muted ? 'MUTED' : `${channel.volume}%`}
                    </span>
                  </div>
                  
                  {/* Mini volume bar */}
                  <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: channel.muted ? '#6b7280' : color }}
                      initial={false}
                      animate={{ width: `${channel.muted ? 0 : channel.volume}%` }}
                    />
                  </div>
                </div>

                {/* Mute button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute(channel.id);
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    channel.muted
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                  }`}
                >
                  <VolumeIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded controls */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 pb-3 border-t border-gray-700"
                >
                  <div className="pt-3 space-y-3">
                    {/* Volume slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">Volume</span>
                        <span className="text-gray-300 text-xs font-mono">{channel.volume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={channel.volume}
                        onChange={(e) => updateChannel(channel.id, { volume: Number(e.target.value) })}
                        className="w-full accent-purple-500"
                        style={{ accentColor: color }}
                      />
                    </div>

                    {/* Solo button (not for master) */}
                    {channel.type !== 'master' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleSolo(channel.id)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                            channel.solo
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-700 text-gray-400 hover:text-white'
                          }`}
                        >
                          {channel.solo ? 'SOLO ON' : 'Solo'}
                        </button>
                        <button
                          onClick={() => updateChannel(channel.id, { volume: 80 })}
                          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-400 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onChange(channels.map((ch) => ({ ...ch, muted: false })))}
          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 transition-colors"
        >
          Unmute All
        </button>
        <button
          onClick={() => onChange(channels.map((ch) => ({ ...ch, volume: 80, muted: false, solo: false })))}
          className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 transition-colors"
        >
          Reset All
        </button>
      </div>
    </div>
  );
}

// Default channels
export function createDefaultChannels(): VolumeChannel[] {
  return [
    { id: 'master', name: 'Master', type: 'master', volume: 80, muted: false },
    { id: 'narration', name: 'Narration', type: 'narration', volume: 100, muted: false },
    { id: 'music', name: 'Music', type: 'music', volume: 60, muted: false },
    { id: 'sfx', name: 'Sound Effects', type: 'sfx', volume: 80, muted: false },
    { id: 'ambient', name: 'Ambient', type: 'ambient', volume: 40, muted: false },
  ];
}
