'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem } from '@/types';

interface IntentionsViewProps {
  intentions: ExtractedItem[];
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export default function IntentionsView({ intentions, onAdd, onDelete, onComplete }: IntentionsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newIntention, setNewIntention] = useState('');

  // Filter today's intentions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysIntentions = intentions.filter((i) => {
    const itemDate = new Date(i.createdAt);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime() && i.status !== 'done';
  });

  const completedToday = intentions.filter((i) => {
    const itemDate = new Date(i.createdAt);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate.getTime() === today.getTime() && i.status === 'done';
  });

  const handleAdd = () => {
    if (newIntention.trim()) {
      onAdd(newIntention.trim());
      setNewIntention('');
      setIsAdding(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { time: 'morning', emoji: '🌅', color: 'from-orange-400 to-amber-500' };
    if (hour < 17) return { time: 'afternoon', emoji: '☀️', color: 'from-yellow-400 to-orange-500' };
    return { time: 'evening', emoji: '🌙', color: 'from-indigo-400 to-purple-500' };
  };

  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌅</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Today's Intentions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              How do you want to feel today?
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400
                     hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
        >
          + Set Intention
        </motion.button>
      </div>

      {/* Greeting Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50
                   dark:from-orange-900/30 dark:via-amber-900/20 dark:to-yellow-900/30
                   border border-orange-200 dark:border-orange-700 overflow-hidden"
      >
        {/* Decorative gradient circle */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${greeting.color} rounded-full blur-3xl opacity-20`} />

        {/* Time & Greeting */}
        <div className="relative flex items-center gap-3 mb-6">
          <span className="text-4xl">{greeting.emoji}</span>
          <div>
            <p className="text-xl font-medium text-gray-800 dark:text-gray-100">
              Good {greeting.time}!
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-0.5">
              How do you want to <span className="font-medium text-orange-600 dark:text-orange-400">feel</span> today?
            </p>
          </div>
        </div>

        {/* Intentions List */}
        {todaysIntentions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No intentions set yet. What state of being do you want to embody?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors"
            >
              Set your first intention
            </motion.button>
          </motion.div>
        ) : (
          <div className="relative space-y-3">
            <AnimatePresence>
              {todaysIntentions.map((intention, index) => (
                <motion.div
                  key={intention.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/70 dark:bg-gray-800/70
                             backdrop-blur-sm border border-orange-100 dark:border-orange-800/50
                             hover:shadow-md transition-all"
                >
                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onComplete(intention.id)}
                    className="w-7 h-7 rounded-full border-2 border-orange-400 dark:border-orange-500
                               hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors
                               flex items-center justify-center"
                  >
                    <motion.svg
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </motion.button>

                  {/* Content */}
                  <span className="flex-1 text-gray-800 dark:text-gray-200 font-medium">
                    {intention.content}
                  </span>

                  {/* Delete */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(intention.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Completed Intentions */}
      {completedToday.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span>✨</span>
            <span>Embodied Today ({completedToday.length})</span>
          </h3>
          <AnimatePresence>
            {completedToday.map((intention) => (
              <motion.div
                key={intention.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50
                           dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
              >
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-700 dark:text-green-400 line-through opacity-70">
                  {intention.content}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700"
          >
            <input
              type="text"
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewIntention('');
                }
              }}
              placeholder="Today I move through the world with..."
              autoFocus
              className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewIntention('');
                }}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newIntention.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-orange-600 text-white rounded-xl
                           hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set Intention
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
