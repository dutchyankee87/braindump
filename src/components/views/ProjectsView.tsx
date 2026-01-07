'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem } from '@/types';

interface ProjectsViewProps {
  projects: ExtractedItem[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
}

// Radial Progress Ring Component
function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (progress: number) => {
    if (progress >= 100) return '#10B981'; // Green
    if (progress >= 75) return '#8B5CF6'; // Purple
    if (progress >= 50) return '#3B82F6'; // Blue
    if (progress >= 25) return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="progress-ring-circle"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={getColor(progress)}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
      </div>
    </div>
  );
}

export default function ProjectsView({ projects, onAdd, onDelete, onUpdateProgress }: ProjectsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (newProject.trim()) {
      onAdd(newProject.trim());
      setNewProject('');
      setIsAdding(false);
    }
  };

  const activeProjects = projects.filter((p) => p.status !== 'done');
  const completedProjects = projects.filter((p) => p.status === 'done');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📁</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Work aligned with your vision
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400
                     hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
        >
          + New Project
        </motion.button>
      </div>

      {/* Empty State */}
      {activeProjects.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">📁</div>
          <h3 className="empty-state-title">What are you building?</h3>
          <p className="empty-state-description">
            Start a project aligned with who you're becoming.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
          >
            Start a project
          </motion.button>
        </motion.div>
      )}

      {/* Active Projects Grid */}
      {activeProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {activeProjects.map((project, index) => {
              const progress = project.metadata?.progress || 0;
              const isExpanded = expandedId === project.id;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="group p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                             hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Progress Ring */}
                    <ProgressRing progress={progress} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900 dark:text-white pr-2">
                          {project.content}
                        </h3>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(project.id)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>

                      {project.metadata?.linkedVision && (
                        <p className="text-sm text-violet-600 dark:text-violet-400 mt-1 truncate">
                          🔗 {project.metadata.linkedVision}
                        </p>
                      )}

                      {/* Progress Slider */}
                      <motion.button
                        onClick={() => setExpandedId(isExpanded ? null : project.id)}
                        className="mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        {isExpanded ? 'Hide slider' : 'Update progress'}
                      </motion.button>
                    </div>
                  </div>

                  {/* Expanded Progress Slider */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                      >
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) => onUpdateProgress(project.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer
                                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500
                                     [&::-webkit-slider-thumb]:hover:bg-violet-600 [&::-webkit-slider-thumb]:cursor-pointer
                                     [&::-webkit-slider-thumb]:shadow-md"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <span>🎉</span>
            <span>Completed ({completedProjects.length})</span>
          </h3>
          <div className="space-y-2">
            {completedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20
                           border border-green-200 dark:border-green-800"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-700 dark:text-green-400 font-medium">{project.content}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-700"
          >
            <input
              type="text"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewProject('');
                }
              }}
              placeholder="What project are you starting?"
              autoFocus
              className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewProject('');
                }}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newProject.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-violet-600 text-white rounded-xl
                           hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
