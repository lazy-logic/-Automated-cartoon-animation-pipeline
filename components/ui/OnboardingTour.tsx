'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wand2,
  Film,
  Play,
  Download,
  Settings,
  Check,
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Cartoon Studio! 🎬',
    description: 'Create magical animated stories with AI-powered tools. Let me show you around!',
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    position: 'center',
  },
  {
    id: 'create-story',
    title: 'Create Your Story',
    description: 'Click "Create a Story" to start. Choose a theme, pick characters, and let AI generate an animated story for you!',
    icon: <Wand2 className="w-8 h-8 text-pink-400" />,
    target: '[data-tour="create-story"]',
    position: 'bottom',
  },
  {
    id: 'timeline',
    title: 'Scene Timeline',
    description: 'Your story is made up of scenes. Drag to reorder, click to edit, and use Ctrl+D to duplicate scenes.',
    icon: <Film className="w-8 h-8 text-blue-400" />,
    target: '[data-tour="timeline"]',
    position: 'top',
  },
  {
    id: 'preview',
    title: 'Preview Your Animation',
    description: 'Watch your story come to life! Click the play button or press Space to start/stop playback.',
    icon: <Play className="w-8 h-8 text-green-400" />,
    target: '[data-tour="preview"]',
    position: 'bottom',
  },
  {
    id: 'export',
    title: 'Export & Share',
    description: 'When you\'re happy with your story, export it as a video (MP4/WebM) or GIF to share with friends!',
    icon: <Download className="w-8 h-8 text-orange-400" />,
    target: '[data-tour="export"]',
    position: 'bottom',
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Access settings for theme preferences, auto-save options, and keyboard shortcuts. Press "?" anytime to see shortcuts!',
    icon: <Settings className="w-8 h-8 text-gray-400" />,
    target: '[data-tour="settings"]',
    position: 'bottom',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    description: 'Start creating amazing animated stories. Have fun and let your imagination run wild!',
    icon: <Check className="w-8 h-8 text-emerald-400" />,
    position: 'center',
  },
];

const STORAGE_KEY = 'cartoon-studio-onboarding-completed';

interface OnboardingTourProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export default function OnboardingTour({ onComplete, forceShow = false }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Check if tour was already completed
  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        // Small delay to let the page render
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [forceShow]);

  // Update highlight position when step changes
  useEffect(() => {
    const step = TOUR_STEPS[currentStep];
    if (step?.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsOpen(false);
    onComplete?.();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleSkip]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isCentered = step.position === 'center' || !highlightRect;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Backdrop with spotlight */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm">
          {highlightRect && (
            <div
              className="absolute bg-transparent border-2 border-purple-500 rounded-xl pointer-events-none"
              style={{
                left: highlightRect.left - 8,
                top: highlightRect.top - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.75), 0 0 30px rgba(139, 92, 246, 0.5)',
              }}
            />
          )}
        </div>

        {/* Tour dialog */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`absolute ${
            isCentered
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
              : step.position === 'top'
              ? 'bottom-8 left-1/2 -translate-x-1/2'
              : step.position === 'bottom'
              ? 'top-8 left-1/2 -translate-x-1/2'
              : ''
          }`}
        >
          <div className="w-[420px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-gray-400">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-300 leading-relaxed">{step.description}</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-4">
              {TOUR_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-6 bg-purple-500'
                      : index < currentStep
                      ? 'bg-purple-500/50'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/20 border-t border-white/10">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-1 shadow-lg shadow-purple-500/25"
                >
                  {isLastStep ? 'Get Started' : 'Next'}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to reset tour for testing
export function useOnboardingTour() {
  const resetTour = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isTourCompleted = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  };

  return { resetTour, isTourCompleted };
}
