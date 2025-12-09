'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/lib/utils/store';
import {
  FolderOpen,
  Save,
  FilePlus,
  Trash2,
  Clock,
  Film,
  X,
  Download,
  Upload,
} from 'lucide-react';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectManager({ isOpen, onClose }: ProjectManagerProps) {
  const {
    project,
    savedProjects,
    saveProject,
    loadProject,
    deleteProject,
    newProject,
    updateProject,
  } = useStudioStore();

  const [showExportModal, setShowExportModal] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.scenes && imported.title) {
          updateProject(imported);
          onClose();
        } else {
          alert('Invalid project file');
        }
      } catch (err) {
        alert('Failed to parse project file');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-500" />
            Project Manager
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Current Project */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Current Project</h3>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject({ title: e.target.value })}
                  className="text-lg font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {project.scenes.length} scenes • Last updated{' '}
                  {formatDate(project.updatedAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveProject}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                if (confirm('Create a new project? Unsaved changes will be lost.')) {
                  newProject();
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              New Project
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Saved Projects */}
        <div className="p-6 overflow-y-auto max-h-[40vh]">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Saved Projects ({savedProjects.length})
          </h3>

          {savedProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No saved projects yet</p>
              <p className="text-sm">Click "Save" to save your current project</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    proj.id === project.id
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{proj.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(proj.updatedAt)}
                        <span>•</span>
                        {proj.scenes.length} scenes
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {proj.id !== project.id && (
                      <button
                        onClick={() => {
                          loadProject(proj.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        Load
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Delete this project?')) {
                          deleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
