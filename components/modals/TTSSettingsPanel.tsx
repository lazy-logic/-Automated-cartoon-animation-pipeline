'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Settings,
  X,
  Check,
  AlertCircle,
  Loader2,
  Play,
  RefreshCw,
} from 'lucide-react';
import {
  TTSProvider,
  TTS_VOICES,
  getCloudTTSService,
} from '@/lib/audio/cloud-tts';

// Filter voices by provider
const ELEVENLABS_VOICES = TTS_VOICES.filter(v => v.provider === 'elevenlabs');
const GOOGLE_VOICES = TTS_VOICES.filter(v => v.provider === 'google');

// Config type
interface TTSConfig {
  provider: TTSProvider;
  apiKey?: string;
  voiceId?: string;
}

interface TTSSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange?: (config: TTSConfig) => void;
}

export default function TTSSettingsPanel({
  isOpen,
  onClose,
  onConfigChange,
}: TTSSettingsPanelProps) {
  const [provider, setProvider] = useState<TTSProvider>('browser');
  const [apiKey, setApiKey] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [testText, setTestText] = useState('Hello! This is a test of the text-to-speech system.');
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setBrowserVoices(voices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Load saved config
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tts-config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          setProvider(config.provider || 'browser');
          setApiKey(config.apiKey || '');
          setSelectedVoice(config.voiceId || '');
        } catch {
          // Invalid saved config
        }
      }
    }
  }, []);

  // Get voices for current provider
  const getVoicesForProvider = (): { id: string; name: string; language?: string }[] => {
    switch (provider) {
      case 'elevenlabs':
        return ELEVENLABS_VOICES.map(v => ({ id: v.id, name: v.name, language: v.language }));
      case 'google':
        return GOOGLE_VOICES.map(v => ({ id: v.id, name: v.name, language: v.language }));
      case 'browser':
        return browserVoices.map(v => ({
          id: v.name,
          name: v.name,
          language: v.lang,
        }));
      default:
        return [];
    }
  };

  // Test TTS
  const handleTest = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    setErrorMessage('');

    try {
      if (provider === 'browser') {
        // Test browser TTS
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(testText);
        if (selectedVoice) {
          const voice = browserVoices.find(v => v.name === selectedVoice);
          if (voice) utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
        setTestStatus('success');
      } else {
        // Test cloud TTS
        const service = getCloudTTSService();
        // Set API keys based on provider
        if (provider === 'elevenlabs') {
          service.setApiKeys(apiKey, undefined);
        } else if (provider === 'google') {
          service.setApiKeys(undefined, apiKey);
        }

        const result = await service.synthesize(testText, { voice: selectedVoice });
        const audio = new Audio(result.audioUrl);
        await audio.play();
        setTestStatus('success');
      }
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setIsTesting(false);
    }
  };

  // Save config
  const handleSave = () => {
    const config: TTSConfig = {
      provider,
      apiKey: provider !== 'browser' ? apiKey : undefined,
      voiceId: selectedVoice || undefined,
    };

    // Save to localStorage
    localStorage.setItem('tts-config', JSON.stringify(config));

    // Configure service with API keys
    const service = getCloudTTSService();
    if (provider === 'elevenlabs') {
      service.setApiKeys(apiKey, undefined);
    } else if (provider === 'google') {
      service.setApiKeys(undefined, apiKey);
    }

    onConfigChange?.(config);
    onClose();
  };

  const voices = getVoicesForProvider() || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-400" />
                Text-to-Speech Settings
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="text-white font-medium mb-2 block">TTS Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'browser', name: 'Browser', desc: 'Free, offline' },
                    { id: 'elevenlabs', name: 'ElevenLabs', desc: 'High quality' },
                    { id: 'google', name: 'Google Cloud', desc: 'Many voices' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProvider(p.id as TTSProvider);
                        setSelectedVoice('');
                      }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        provider === p.id
                          ? 'bg-purple-500/30 ring-2 ring-purple-500'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-white font-medium text-sm">{p.name}</div>
                      <div className="text-gray-400 text-xs">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key (for cloud providers) */}
              {provider !== 'browser' && (
                <div>
                  <label className="text-white font-medium mb-2 block">
                    API Key
                    <span className="text-gray-400 text-xs ml-2">
                      ({provider === 'elevenlabs' ? 'elevenlabs.io' : 'Google Cloud Console'})
                    </span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${provider === 'elevenlabs' ? 'ElevenLabs' : 'Google Cloud'} API key`}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {provider === 'elevenlabs' 
                      ? 'Get your API key from elevenlabs.io/settings'
                      : 'Enable Text-to-Speech API in Google Cloud Console'}
                  </p>
                </div>
              )}

              {/* Voice Selection */}
              <div>
                <label className="text-white font-medium mb-2 block">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Default Voice</option>
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name} {voice.language ? `(${voice.language})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Section */}
              <div className="p-4 bg-gray-800 rounded-xl">
                <label className="text-white font-medium mb-2 block">Test Voice</label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={handleTest}
                    disabled={isTesting || (provider !== 'browser' && !apiKey)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    {isTesting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Test
                  </button>
                  
                  {testStatus === 'success' && (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Working!
                    </span>
                  )}
                  
                  {testStatus === 'error' && (
                    <span className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errorMessage || 'Failed'}
                    </span>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Tip:</strong> Browser TTS is free but quality varies. 
                  ElevenLabs offers the most natural voices. Google Cloud has the widest language support.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
