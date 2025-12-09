'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Plus,
  Trash2,
  ArrowRight,
  Edit3,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export interface StoryChoice {
  id: string;
  text: string;
  targetSceneId: string;
  condition?: string;
  isDefault?: boolean;
}

export interface BranchPoint {
  id: string;
  sceneId: string;
  prompt: string;
  choices: StoryChoice[];
  timeToShow: number; // ms from scene start
  duration: number; // how long choices are visible
}

interface StoryBranchingUIProps {
  branchPoints: BranchPoint[];
  currentSceneId: string;
  currentTime: number;
  isPlaying: boolean;
  onChoiceSelect: (choice: StoryChoice) => void;
  onBranchPointsChange: (branchPoints: BranchPoint[]) => void;
  scenes: { id: string; title: string }[];
}

// Playback overlay for showing choices during playback
export function BranchingChoiceOverlay({
  branchPoint,
  currentTime,
  onChoiceSelect,
}: {
  branchPoint: BranchPoint | null;
  currentTime: number;
  onChoiceSelect: (choice: StoryChoice) => void;
}) {
  if (!branchPoint) return null;

  const isVisible =
    currentTime >= branchPoint.timeToShow &&
    currentTime <= branchPoint.timeToShow + branchPoint.duration;

  if (!isVisible) return null;

  const progress =
    (currentTime - branchPoint.timeToShow) / branchPoint.duration;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4"
      >
        {/* Prompt */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block px-6 py-3 bg-black/80 backdrop-blur-sm rounded-2xl"
          >
            <p className="text-white text-lg font-medium">{branchPoint.prompt}</p>
          </motion.div>
        </div>

        {/* Choices */}
        <div className="flex flex-wrap justify-center gap-3">
          {branchPoint.choices.map((choice, index) => (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChoiceSelect(choice)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <span>{choice.text}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ))}
        </div>

        {/* Timer bar */}
        <div className="mt-4 mx-auto w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '100%' }}
            animate={{ width: `${(1 - progress) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Editor panel for managing branch points
export default function StoryBranchingUI({
  branchPoints,
  currentSceneId,
  currentTime,
  isPlaying,
  onChoiceSelect,
  onBranchPointsChange,
  scenes,
}: StoryBranchingUIProps) {
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [editingChoiceId, setEditingChoiceId] = useState<string | null>(null);

  const currentSceneBranches = branchPoints.filter(
    (bp) => bp.sceneId === currentSceneId
  );

  const addBranchPoint = () => {
    const newBranch: BranchPoint = {
      id: `branch-${Date.now()}`,
      sceneId: currentSceneId,
      prompt: 'What should happen next?',
      choices: [
        {
          id: `choice-${Date.now()}-1`,
          text: 'Option A',
          targetSceneId: scenes[0]?.id || '',
        },
        {
          id: `choice-${Date.now()}-2`,
          text: 'Option B',
          targetSceneId: scenes[1]?.id || scenes[0]?.id || '',
        },
      ],
      timeToShow: Math.max(0, currentTime),
      duration: 5000,
    };
    onBranchPointsChange([...branchPoints, newBranch]);
    setEditingBranchId(newBranch.id);
  };

  const updateBranchPoint = (id: string, updates: Partial<BranchPoint>) => {
    onBranchPointsChange(
      branchPoints.map((bp) => (bp.id === id ? { ...bp, ...updates } : bp))
    );
  };

  const deleteBranchPoint = (id: string) => {
    onBranchPointsChange(branchPoints.filter((bp) => bp.id !== id));
    if (editingBranchId === id) setEditingBranchId(null);
  };

  const addChoice = (branchId: string) => {
    const branch = branchPoints.find((bp) => bp.id === branchId);
    if (!branch) return;

    const newChoice: StoryChoice = {
      id: `choice-${Date.now()}`,
      text: `Option ${branch.choices.length + 1}`,
      targetSceneId: scenes[0]?.id || '',
    };

    updateBranchPoint(branchId, {
      choices: [...branch.choices, newChoice],
    });
  };

  const updateChoice = (
    branchId: string,
    choiceId: string,
    updates: Partial<StoryChoice>
  ) => {
    const branch = branchPoints.find((bp) => bp.id === branchId);
    if (!branch) return;

    updateBranchPoint(branchId, {
      choices: branch.choices.map((c) =>
        c.id === choiceId ? { ...c, ...updates } : c
      ),
    });
  };

  const deleteChoice = (branchId: string, choiceId: string) => {
    const branch = branchPoints.find((bp) => bp.id === branchId);
    if (!branch || branch.choices.length <= 2) return;

    updateBranchPoint(branchId, {
      choices: branch.choices.filter((c) => c.id !== choiceId),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          Story Branches
        </h3>
        <button
          onClick={addBranchPoint}
          className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Branch
        </button>
      </div>

      {currentSceneBranches.length === 0 ? (
        <div className="p-4 bg-gray-800 rounded-xl text-center">
          <GitBranch className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No branch points in this scene</p>
          <p className="text-gray-500 text-xs mt-1">
            Add a branch to create interactive choices
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentSceneBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-gray-800 rounded-xl overflow-hidden"
            >
              {/* Branch Header */}
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  {editingBranchId === branch.id ? (
                    <input
                      type="text"
                      value={branch.prompt}
                      onChange={(e) =>
                        updateBranchPoint(branch.id, { prompt: e.target.value })
                      }
                      className="bg-gray-700 px-2 py-1 rounded text-white text-sm flex-1"
                      autoFocus
                    />
                  ) : (
                    <span className="text-white text-sm font-medium">
                      {branch.prompt}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setEditingBranchId(
                        editingBranchId === branch.id ? null : branch.id
                      )
                    }
                    className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {editingBranchId === branch.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteBranchPoint(branch.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Timing */}
              <div className="px-3 py-2 bg-gray-750 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Show at:</span>
                  <input
                    type="number"
                    value={branch.timeToShow / 1000}
                    onChange={(e) =>
                      updateBranchPoint(branch.id, {
                        timeToShow: Number(e.target.value) * 1000,
                      })
                    }
                    className="w-16 px-2 py-1 bg-gray-700 rounded text-white text-center"
                    step={0.5}
                    min={0}
                  />
                  <span className="text-gray-500">sec</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Duration:</span>
                  <input
                    type="number"
                    value={branch.duration / 1000}
                    onChange={(e) =>
                      updateBranchPoint(branch.id, {
                        duration: Number(e.target.value) * 1000,
                      })
                    }
                    className="w-16 px-2 py-1 bg-gray-700 rounded text-white text-center"
                    step={0.5}
                    min={1}
                  />
                  <span className="text-gray-500">sec</span>
                </div>
              </div>

              {/* Choices */}
              <div className="p-3 space-y-2">
                {branch.choices.map((choice, index) => (
                  <div
                    key={choice.id}
                    className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) =>
                        updateChoice(branch.id, choice.id, {
                          text: e.target.value,
                        })
                      }
                      className="flex-1 bg-gray-600 px-2 py-1 rounded text-white text-sm"
                      placeholder="Choice text"
                    />
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <select
                      value={choice.targetSceneId}
                      onChange={(e) =>
                        updateChoice(branch.id, choice.id, {
                          targetSceneId: e.target.value,
                        })
                      }
                      className="bg-gray-600 px-2 py-1 rounded text-white text-sm"
                    >
                      {scenes.map((scene) => (
                        <option key={scene.id} value={scene.id}>
                          {scene.title}
                        </option>
                      ))}
                    </select>
                    {branch.choices.length > 2 && (
                      <button
                        onClick={() => deleteChoice(branch.id, choice.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addChoice(branch.id)}
                  className="w-full p-2 border border-dashed border-gray-600 hover:border-purple-500 rounded-lg text-gray-400 hover:text-purple-400 text-sm transition-colors"
                >
                  + Add Choice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview tip */}
      <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <p className="text-purple-300 text-xs">
          💡 Branch choices will appear during playback at the specified time.
          Viewers can click to jump to different scenes.
        </p>
      </div>
    </div>
  );
}
