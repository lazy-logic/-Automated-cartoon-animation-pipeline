'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Volume2,
  Play,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface TTSLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceName?: string;
}

// Supported languages for TTS
export const TTS_LANGUAGES: TTSLanguage[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文', flag: '🇹🇼' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  isCompact?: boolean;
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange,
  isCompact = false 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const currentLang = TTS_LANGUAGES.find(l => l.code === selectedLanguage) || TTS_LANGUAGES[0];

  // Get available voices from browser
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };
    
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Check if a language is available
  const isLanguageAvailable = (langCode: string) => {
    return availableVoices.some(v => v.lang.startsWith(langCode.split('-')[0]));
  };

  // Preview the voice
  const previewVoice = (langCode: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const lang = TTS_LANGUAGES.find(l => l.code === langCode);
    const utterance = new SpeechSynthesisUtterance(
      lang?.code.startsWith('en') ? 'Hello! This is how I sound.' :
      lang?.code.startsWith('es') ? '¡Hola! Así es como sueno.' :
      lang?.code.startsWith('fr') ? 'Bonjour! Voici comment je sonne.' :
      lang?.code.startsWith('de') ? 'Hallo! So klinge ich.' :
      lang?.code.startsWith('it') ? 'Ciao! Ecco come suono.' :
      lang?.code.startsWith('pt') ? 'Olá! É assim que eu soo.' :
      lang?.code.startsWith('zh') ? '你好！这是我的声音。' :
      lang?.code.startsWith('ja') ? 'こんにちは！これが私の声です。' :
      lang?.code.startsWith('ko') ? '안녕하세요! 이것이 제 목소리입니다.' :
      'Hello! This is how I sound.'
    );
    
    utterance.lang = langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    // Try to find a matching voice
    const matchingVoice = availableVoices.find(v => v.lang === langCode) ||
                          availableVoices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  if (isCompact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 bg-black/40 hover:bg-black/60 rounded-lg transition-colors text-xs"
        >
          <span>{currentLang.flag}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full mt-1 right-0 z-50 w-48 bg-zinc-900 rounded-lg shadow-xl border border-white/10 overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto py-1">
                {TTS_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsOpen(false);
                    }}
                    disabled={!isLanguageAvailable(lang.code)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs transition-colors ${
                      selectedLanguage === lang.code
                        ? 'bg-violet-500/30 text-white'
                        : isLanguageAvailable(lang.code)
                          ? 'hover:bg-white/10 text-gray-300'
                          : 'opacity-40 cursor-not-allowed text-gray-500'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="flex-1 text-left truncate">{lang.name.split('(')[0].trim()}</span>
                    {selectedLanguage === lang.code && (
                      <Check className="w-3 h-3 text-violet-400" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Globe className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-medium">Narration Language</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TTS_LANGUAGES.slice(0, 12).map(lang => {
          const available = isLanguageAvailable(lang.code);
          const isSelected = selectedLanguage === lang.code;
          
          return (
            <button
              key={lang.code}
              onClick={() => available && onLanguageChange(lang.code)}
              disabled={!available}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isSelected
                  ? 'bg-purple-500 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900'
                  : available
                    ? 'bg-white/10 hover:bg-white/20 text-gray-300'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm truncate">{lang.name.split(' ')[0]}</span>
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewVoice(lang.code);
                  }}
                  className="ml-auto p-1 hover:bg-white/20 rounded-full"
                  title="Preview voice"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500">
        * Language availability depends on your browser and system settings
      </p>
    </div>
  );
}

// Hook for using TTS with selected language
export function useMultiLanguageTTS(language: string = 'en-US') {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };
    
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = (text: string, options?: { rate?: number; pitch?: number }) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1.0;
    
    // Find best matching voice
    const matchingVoice = availableVoices.find(v => v.lang === language) ||
                          availableVoices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking, availableVoices };
}

export default LanguageSelector;
