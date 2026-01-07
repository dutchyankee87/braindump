'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExtractedItem, JournalType } from '@/types';

interface JournalViewProps {
  entries: ExtractedItem[];
  onAdd: (content: string, journalType: JournalType) => void;
  onDelete: (id: string) => void;
}

const JOURNAL_TYPES: { id: JournalType; label: string; icon: string; prompt: string; color: string }[] = [
  { id: 'gratitude', label: 'Gratitude', icon: '🙏', prompt: "I'm grateful for...", color: 'emerald' },
  { id: 'reflection', label: 'Reflection', icon: '🪞', prompt: 'Today I noticed...', color: 'indigo' },
  { id: 'emotion', label: 'Emotion', icon: '💭', prompt: "I'm feeling...", color: 'rose' },
  { id: 'insight', label: 'Insight', icon: '💫', prompt: 'I realized...', color: 'amber' },
];

const MOOD_EMOJIS = ['😊', '😌', '🥰', '😔', '😤', '😰', '🤔', '💪', '✨'];

export default function JournalView({ entries, onAdd, onDelete }: JournalViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<JournalType>('reflection');
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleAdd = () => {
    if (newEntry.trim()) {
      const content = selectedMood ? `${selectedMood} ${newEntry.trim()}` : newEntry.trim();
      onAdd(content, selectedType);
      setNewEntry('');
      setSelectedMood(null);
      setIsAdding(false);
    }
  };

  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, ExtractedItem[]>);

  const getTypeConfig = (type: JournalType | undefined) => {
    return JOURNAL_TYPES.find((t) => t.id === type) || JOURNAL_TYPES[1];
  };

  const getTypeStyles = (type: JournalType | undefined) => {
    const styles: Record<JournalType, { bg: string; border: string }> = {
      gratitude: {
        bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
        border: 'border-emerald-200 dark:border-emerald-700',
      },
      reflection: {
        bg: 'bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20',
        border: 'border-indigo-200 dark:border-indigo-700',
      },
      emotion: {
        bg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20',
        border: 'border-rose-200 dark:border-rose-700',
      },
      insight: {
        bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
        border: 'border-amber-200 dark:border-amber-700',
      },
    };
    return styles[type || 'reflection'];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📔</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Journal</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400
                     hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
        >
          + New Entry
        </motion.button>
      </div>

      {/* Quick Entry Type Selector */}
      {!isAdding && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {JOURNAL_TYPES.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedType(type.id);
                setIsAdding(true);
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl ${getTypeStyles(type.id).bg} ${getTypeStyles(type.id).border}
                         border transition-all hover:shadow-md whitespace-nowrap`}
            >
              <span className="text-xl">{type.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-2xl ${getTypeStyles(selectedType).bg} ${getTypeStyles(selectedType).border} border`}
          >
            {/* Type Selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
              {JOURNAL_TYPES.map((type) => (
                <motion.button
                  key={type.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all whitespace-nowrap
                             ${selectedType === type.id
                               ? 'bg-white dark:bg-gray-800 shadow-md font-medium'
                               : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
                             }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Mood Picker */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">How are you feeling?</p>
              <div className="flex gap-1 flex-wrap">
                {MOOD_EMOJIS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMood(selectedMood === emoji ? null : emoji)}
                    className={`mood-emoji ${selectedMood === emoji ? 'selected' : ''}`}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <textarea
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewEntry('');
                  setSelectedMood(null);
                }
              }}
              placeholder={getTypeConfig(selectedType).prompt}
              autoFocus
              className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-gray-400 mt-2">Cmd/Ctrl + Enter to save</p>

            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewEntry('');
                  setSelectedMood(null);
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
                className="px-5 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl
                           hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Entry
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {entries.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">📔</div>
          <h3 className="empty-state-title">Unwritten pages await</h3>
          <p className="empty-state-description">
            Capture gratitude, reflections, emotions, and insights.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Begin writing
          </motion.button>
        </motion.div>
      )}

      {/* Journal Entries - Timeline */}
      {Object.entries(groupedEntries).length > 0 && (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 sticky top-14 bg-gray-50 dark:bg-[#0F172A] py-2 z-10">
                {date}
              </h3>
              <div className="space-y-4">
                <AnimatePresence>
                  {dateEntries.map((entry, index) => {
                    const typeConfig = getTypeConfig(entry.metadata?.journalType);
                    const styles = getTypeStyles(entry.metadata?.journalType);

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03 }}
                        className={`group relative p-5 rounded-2xl ${styles.bg} ${styles.border} border hover:shadow-md transition-all`}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(entry.id)}
                          className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100
                                     text-gray-400 hover:text-red-500 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{typeConfig.icon}</span>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {typeConfig.label}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap pr-8 leading-relaxed">
                          {entry.content}
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
