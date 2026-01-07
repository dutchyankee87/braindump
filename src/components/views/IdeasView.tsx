'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem } from '@/types';

interface IdeasViewProps {
  ideas: ExtractedItem[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onPromoteToProject: (id: string) => void;
  onPromoteToTask: (id: string) => void;
}

// Card colors that rotate
const CARD_GRADIENTS = [
  'from-pink-100/80 to-rose-100/80 dark:from-pink-900/30 dark:to-rose-900/30 border-pink-200 dark:border-pink-700',
  'from-purple-100/80 to-violet-100/80 dark:from-purple-900/30 dark:to-violet-900/30 border-purple-200 dark:border-purple-700',
  'from-blue-100/80 to-cyan-100/80 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-200 dark:border-blue-700',
  'from-emerald-100/80 to-teal-100/80 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200 dark:border-emerald-700',
  'from-amber-100/80 to-yellow-100/80 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200 dark:border-amber-700',
];

export default function IdeasView({
  ideas,
  onAdd,
  onDelete,
  onEdit,
  onPromoteToProject,
  onPromoteToTask,
}: IdeasViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newIdea, setNewIdea] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (newIdea.trim()) {
      onAdd(newIdea.trim());
      setNewIdea('');
      setIsAdding(false);
      // Track recently added for spark animation
      setTimeout(() => {
        const newId = ideas[0]?.id;
        if (newId) {
          setRecentlyAdded(newId);
          setTimeout(() => setRecentlyAdded(null), 1000);
        }
      }, 100);
    }
  };

  // Get heat color based on age (newer = warmer)
  const getHeatIndicator = (createdAt: Date) => {
    const now = new Date();
    const hoursDiff = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 24) return { label: 'Hot', color: 'bg-red-500', glow: 'shadow-red-500/30' };
    if (hoursDiff < 72) return { label: 'Warm', color: 'bg-orange-500', glow: 'shadow-orange-500/30' };
    if (hoursDiff < 168) return { label: 'Cool', color: 'bg-blue-500', glow: 'shadow-blue-500/30' };
    return { label: 'Cold', color: 'bg-gray-400', glow: '' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ideas</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {ideas.length} seed{ideas.length !== 1 ? 's' : ''} planted
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-pink-600 dark:text-pink-400
                     hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-colors"
        >
          + Capture Idea
        </motion.button>
      </div>

      {/* Empty State */}
      {ideas.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">💡</div>
          <h3 className="empty-state-title">Your mind is a garden</h3>
          <p className="empty-state-description">
            Capture creative downloads and inspiration as they come.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 transition-colors"
          >
            Plant a seed
          </motion.button>
        </motion.div>
      )}

      {/* Ideas Masonry Grid */}
      {ideas.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {ideas.map((idea, index) => {
              const heat = getHeatIndicator(idea.createdAt);
              const isExpanded = expandedId === idea.id;
              const isNew = recentlyAdded === idea.id;

              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.03 }}
                  className={`break-inside-avoid ${isNew ? 'spark-in' : ''}`}
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                    className={`group relative p-5 rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}
                               border cursor-pointer transition-all duration-300 hover:shadow-xl ${heat.glow}`}
                  >
                    {/* Heat Indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${heat.color}`} />
                    </div>

                    {/* Content */}
                    {editingId === idea.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.stopPropagation();
                            if (editContent.trim()) {
                              onEdit(idea.id, editContent.trim());
                              setEditingId(null);
                            }
                          }
                          if (e.key === 'Escape') {
                            e.stopPropagation();
                            setEditingId(null);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                                   text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed pr-6">
                        {idea.content}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </span>

                      {/* Action Buttons */}
                      <div className={`flex gap-1 transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {editingId === idea.id ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (editContent.trim()) {
                                  onEdit(idea.id, editContent.trim());
                                  setEditingId(null);
                                }
                              }}
                              title="Save"
                              className="p-2 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                              title="Cancel"
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(idea.id);
                                setEditContent(idea.content);
                              }}
                              title="Edit"
                              className="p-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onPromoteToTask(idea.id);
                              }}
                              title="Make it a task"
                              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onPromoteToProject(idea.id);
                              }}
                              title="Make it a project"
                              className="p-2 text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                              </svg>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(idea.id);
                              }}
                              title="Delete"
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/70 dark:hover:bg-gray-800/70 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-700"
          >
            <textarea
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewIdea('');
                }
              }}
              placeholder="What's sparking in your mind?"
              autoFocus
              className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-2">Cmd/Ctrl + Enter to save</p>

            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewIdea('');
                }}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newIdea.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-pink-600 text-white rounded-xl
                           hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Capture
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Button */}
      {ideas.length > 0 && !isAdding && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAdding(true)}
          className="fixed bottom-24 md:bottom-8 right-6 p-4 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-colors z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
