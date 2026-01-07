'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem } from '@/types';

interface AffirmationsViewProps {
  affirmations: ExtractedItem[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

export default function AffirmationsView({ affirmations, onAdd, onDelete, onEdit }: AffirmationsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMeditationMode, setIsMeditationMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Auto-rotate through affirmations
  useEffect(() => {
    if (affirmations.length <= 1 || isMeditationMode) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % affirmations.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [affirmations.length, isMeditationMode]);

  const handleAdd = () => {
    if (newAffirmation.trim()) {
      let content = newAffirmation.trim();
      if (!content.toLowerCase().startsWith('i am')) {
        content = `I am ${content}`;
      }
      onAdd(content);
      setNewAffirmation('');
      setIsAdding(false);
    }
  };

  const currentAffirmation = affirmations[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + affirmations.length) % affirmations.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Affirmations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Speak your truth into being
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {affirmations.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMeditationMode(true)}
              className="px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400
                         bg-amber-50 dark:bg-amber-900/20 rounded-xl transition-colors"
            >
              🧘 Meditate
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 text-sm font-medium text-amber-600 dark:text-amber-400
                       hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
          >
            + Add
          </motion.button>
        </div>
      </div>

      {/* Empty State */}
      {affirmations.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">✨</div>
          <h3 className="empty-state-title">I am...</h3>
          <p className="empty-state-description">
            Add identity statements that elevate who you are.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors"
          >
            Speak your truth
          </motion.button>
        </motion.div>
      )}

      {/* Featured Affirmation Card */}
      {currentAffirmation && !isMeditationMode && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-8 md:p-10 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50
                     dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/30
                     border border-amber-200 dark:border-amber-700 text-center overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/30 dark:bg-orange-500/10 rounded-full blur-2xl" />

          <motion.p
            key={currentAffirmation.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-2xl md:text-3xl font-medium text-gray-800 dark:text-white leading-relaxed"
          >
            "{currentAffirmation.content}"
          </motion.p>

          {/* Navigation */}
          {affirmations.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPrev}
                className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <div className="flex gap-2">
                {affirmations.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? 'bg-amber-500 scale-125'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-amber-300'
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNext}
                className="p-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* All Affirmations Grid */}
      {affirmations.length > 0 && !isMeditationMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {affirmations.map((affirmation, idx) => (
              <motion.div
                key={affirmation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => editingId !== affirmation.id && setCurrentIndex(idx)}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all
                           ${idx === currentIndex
                             ? 'bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-400 dark:border-amber-500 shadow-md'
                             : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600'
                           }`}
              >
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingId === affirmation.id ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (editContent.trim()) {
                            onEdit(affirmation.id, editContent.trim());
                            setEditingId(null);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-emerald-500 transition-all"
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
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-all"
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
                          setEditingId(affirmation.id);
                          setEditContent(affirmation.content);
                        }}
                        className="p-1.5 text-gray-400 hover:text-amber-500 transition-all"
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
                          onDelete(affirmation.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </>
                  )}
                </div>
                {editingId === affirmation.id ? (
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && editContent.trim()) {
                        e.stopPropagation();
                        onEdit(affirmation.id, editContent.trim());
                        setEditingId(null);
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setEditingId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-amber-300 dark:border-amber-600
                               text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 pr-6">{affirmation.content}</p>
                )}
              </motion.div>
            ))}
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
            className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700"
          >
            <input
              type="text"
              value={newAffirmation}
              onChange={(e) => setNewAffirmation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewAffirmation('');
                }
              }}
              placeholder="I am worthy of love and abundance..."
              autoFocus
              className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewAffirmation('');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newAffirmation.trim()}
                className="px-5 py-2 text-sm font-medium bg-amber-600 text-white rounded-xl
                           hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Affirmation
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meditation Mode Modal */}
      <AnimatePresence>
        {isMeditationMode && currentAffirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-900/95 via-orange-900/95 to-yellow-900/95 backdrop-blur-md"
            onClick={() => setIsMeditationMode(false)}
          >
            <div className="text-center p-8 max-w-2xl" onClick={(e) => e.stopPropagation()}>
              {/* Breathing Circle */}
              <motion.div
                className="mx-auto mb-12 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/30 flex items-center justify-center meditation-circle"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-300/50 flex items-center justify-center">
                  <span className="text-4xl">✨</span>
                </div>
              </motion.div>

              {/* Affirmation Text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-3xl md:text-4xl font-medium text-white leading-relaxed mb-12"
                >
                  {currentAffirmation.content}
                </motion.p>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPrev}
                  className="p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <div className="flex gap-2">
                  {affirmations.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNext}
                  className="p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMeditationMode(false)}
                className="mt-12 px-6 py-3 text-sm font-medium text-white/80 hover:text-white border border-white/20 rounded-xl hover:bg-white/10"
              >
                Exit Meditation
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
