'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem } from '@/types';

interface VisionBoardProps {
  visions: ExtractedItem[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

// Gradient patterns for vision cards
const CARD_GRADIENTS = [
  'from-blue-500/20 to-indigo-500/20 dark:from-blue-600/30 dark:to-indigo-600/30',
  'from-purple-500/20 to-pink-500/20 dark:from-purple-600/30 dark:to-pink-600/30',
  'from-cyan-500/20 to-blue-500/20 dark:from-cyan-600/30 dark:to-blue-600/30',
  'from-emerald-500/20 to-teal-500/20 dark:from-emerald-600/30 dark:to-teal-600/30',
  'from-orange-500/20 to-amber-500/20 dark:from-orange-600/30 dark:to-amber-600/30',
];

export default function VisionBoard({ visions, onAdd, onDelete, onEdit }: VisionBoardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newVision, setNewVision] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (newVision.trim()) {
      onAdd(newVision.trim());
      setNewVision('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAdd();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewVision('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔭</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Vision Board</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Who you are becoming
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400
                     hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
        >
          + Add Vision
        </motion.button>
      </div>

      {/* Empty State */}
      {visions.length === 0 && !isAdding ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">🔭</div>
          <h3 className="empty-state-title">What does your future self look like?</h3>
          <p className="empty-state-description">
            Describe who you are becoming, not what you want to have.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Paint your vision
          </motion.button>
        </motion.div>
      ) : (
        /* Vision Cards Grid - Masonry Style */
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {visions.map((vision, index) => (
              <motion.div
                key={vision.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="break-inside-avoid"
              >
                <div
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}
                             backdrop-blur-sm border border-white/20 dark:border-white/10
                             hover:shadow-xl transition-all duration-300`}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === vision.id ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (editContent.trim()) {
                              onEdit(vision.id, editContent.trim());
                              setEditingId(null);
                            }
                          }}
                          className="p-1.5 bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-emerald-500 rounded-full shadow-sm transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 rounded-full shadow-sm transition-all"
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
                          onClick={() => {
                            setEditingId(vision.id);
                            setEditContent(vision.content);
                          }}
                          className="p-1.5 bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-blue-500 rounded-full shadow-sm transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(vision.id)}
                          className="p-1.5 bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-red-500 rounded-full shadow-sm transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Vision Image */}
                  {vision.metadata?.imageUrl && (
                    <div className="mb-4 -mx-2 -mt-2 rounded-xl overflow-hidden">
                      <img
                        src={vision.metadata.imageUrl}
                        alt="Vision"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}

                  {/* Vision Content */}
                  {editingId === vision.id ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && editContent.trim()) {
                          onEdit(vision.id, editContent.trim());
                          setEditingId(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      autoFocus
                      className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600
                                 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed text-lg">
                      {vision.content}
                    </p>
                  )}

                  {/* Decorative Element */}
                  <div className="absolute bottom-3 right-3 text-2xl opacity-20">
                    ✨
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add New Vision Card */}
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="break-inside-avoid"
              >
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30
                               border-2 border-dashed border-blue-300 dark:border-blue-600">
                  <textarea
                    value={newVision}
                    onChange={(e) => setNewVision(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="I am someone who..."
                    autoFocus
                    className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                               text-gray-900 dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setIsAdding(false);
                        setNewVision('');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAdd}
                      disabled={!newVision.trim()}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl
                                 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Vision
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Add Button (when not adding and has items) */}
      {visions.length > 0 && !isAdding && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAdding(true)}
          className="fixed bottom-24 md:bottom-8 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
