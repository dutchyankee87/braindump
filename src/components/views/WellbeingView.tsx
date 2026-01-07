'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem, WellbeingDimension } from '@/types';

interface WellbeingViewProps {
  entries: ExtractedItem[];
  onAdd: (content: string, dimension: WellbeingDimension) => void;
  onDelete: (id: string) => void;
}

const DIMENSIONS: { id: WellbeingDimension; label: string; icon: string; color: string; description: string }[] = [
  {
    id: 'physical',
    label: 'Body',
    icon: '💪',
    color: 'emerald',
    description: 'Movement, sleep, nutrition',
  },
  {
    id: 'mental',
    label: 'Mind',
    icon: '🧠',
    color: 'blue',
    description: 'Focus, learning, clarity',
  },
  {
    id: 'spiritual',
    label: 'Spirit',
    icon: '✨',
    color: 'purple',
    description: 'Connection, meaning, peace',
  },
];

export default function WellbeingView({ entries, onAdd, onDelete }: WellbeingViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<WellbeingDimension>('physical');
  const [newEntry, setNewEntry] = useState('');

  const handleAdd = () => {
    if (newEntry.trim()) {
      onAdd(newEntry.trim(), selectedDimension);
      setNewEntry('');
      setIsAdding(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysEntries = entries.filter((e) => {
    const entryDate = new Date(e.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });

  const entriesByDimension = (dimension: WellbeingDimension) =>
    entries.filter((e) => e.metadata?.wellbeingDimension === dimension);

  const todaysByDimension = (dimension: WellbeingDimension) =>
    todaysEntries.filter((e) => e.metadata?.wellbeingDimension === dimension);

  const getDimensionStyles = (dimension: WellbeingDimension) => {
    const styles: Record<WellbeingDimension, { bg: string; border: string; badge: string; ring: string }> = {
      physical: {
        bg: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30',
        border: 'border-emerald-200 dark:border-emerald-700',
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
        ring: 'ring-emerald-500',
      },
      mental: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30',
        border: 'border-blue-200 dark:border-blue-700',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
        ring: 'ring-blue-500',
      },
      spiritual: {
        bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30',
        border: 'border-purple-200 dark:border-purple-700',
        badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
        ring: 'ring-purple-500',
      },
    };
    return styles[dimension];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧘</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Wellbeing</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mind, body, spirit
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400
                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
        >
          + Check In
        </motion.button>
      </div>

      {/* Balance Visualization */}
      <div className="relative flex justify-center py-6">
        <div className="relative flex items-center gap-3">
          {DIMENSIONS.map((dim, index) => {
            const todayCount = todaysByDimension(dim.id).length;
            const totalCount = entriesByDimension(dim.id).length;
            const styles = getDimensionStyles(dim.id);

            // Calculate visual "fullness" based on today's entries (max 5 for full circle)
            const fillPercent = Math.min(todayCount / 3, 1) * 100;

            return (
              <motion.button
                key={dim.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDimension(dim.id);
                  setIsAdding(true);
                }}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl ${styles.bg} ${styles.border} border shadow-sm hover:shadow-lg transition-shadow`}
              >
                {/* Progress ring */}
                <div className="relative">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      className="stroke-gray-200 dark:stroke-gray-700"
                      strokeWidth="3"
                    />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      className={`stroke-current ${dim.id === 'physical' ? 'text-emerald-500' : dim.id === 'mental' ? 'text-blue-500' : 'text-purple-500'}`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${fillPercent} 100`}
                      initial={{ strokeDasharray: '0 100' }}
                      animate={{ strokeDasharray: `${fillPercent} 100` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">
                    {dim.icon}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{dim.label}</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                    {todayCount}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">today</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Dimension Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DIMENSIONS.map((dim) => {
          const todayCount = todaysByDimension(dim.id).length;
          const totalCount = entriesByDimension(dim.id).length;
          const styles = getDimensionStyles(dim.id);

          return (
            <motion.button
              key={dim.id}
              whileHover={{ y: -4 }}
              onClick={() => {
                setSelectedDimension(dim.id);
                setIsAdding(true);
              }}
              className={`p-5 rounded-2xl ${styles.bg} ${styles.border} border text-left transition-all hover:shadow-lg`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{dim.icon}</span>
                <h3 className="font-medium text-gray-900 dark:text-white">{dim.label}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{dim.description}</p>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2.5 py-1 rounded-full font-medium ${styles.badge}`}>
                  {todayCount} today
                </span>
                <span className="text-gray-400 dark:text-gray-500">{totalCount} total</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-2xl ${getDimensionStyles(selectedDimension).bg} ${getDimensionStyles(selectedDimension).border} border`}
          >
            {/* Dimension Selector */}
            <div className="flex gap-2 mb-4">
              {DIMENSIONS.map((dim) => {
                const styles = getDimensionStyles(dim.id);
                return (
                  <motion.button
                    key={dim.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDimension(dim.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all
                               ${selectedDimension === dim.id
                                 ? `bg-white dark:bg-gray-800 shadow-md font-medium ring-2 ${styles.ring}`
                                 : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                               }`}
                  >
                    <span>{dim.icon}</span>
                    <span>{dim.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <input
              type="text"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewEntry('');
                }
              }}
              placeholder={`What did you do for your ${DIMENSIONS.find(d => d.id === selectedDimension)?.label.toLowerCase()}?`}
              autoFocus
              className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewEntry('');
                }}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newEntry.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl
                           hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log Activity
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Log */}
      {todaysEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
            <span>📋</span>
            <span>Today's Log ({todaysEntries.length})</span>
          </h3>
          <div className="space-y-2">
            <AnimatePresence>
              {todaysEntries.map((entry, index) => {
                const dim = DIMENSIONS.find((d) => d.id === entry.metadata?.wellbeingDimension);
                const styles = getDimensionStyles(entry.metadata?.wellbeingDimension || 'physical');

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group flex items-center gap-3 p-4 rounded-xl ${styles.bg} ${styles.border} border`}
                  >
                    <span className="text-xl">{dim?.icon || '🧘'}</span>
                    <span className="flex-1 text-gray-800 dark:text-gray-200">{entry.content}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {entries.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">🧘</div>
          <h3 className="empty-state-title">Mind, body, spirit</h3>
          <p className="empty-state-description">
            Track activities that nourish your whole being.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Check in
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
