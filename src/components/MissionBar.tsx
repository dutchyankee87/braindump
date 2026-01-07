'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';
import type { ExtractedItem } from '@/types';

interface MissionBarProps {
  mission: ExtractedItem | null;
  onSave: (content: string) => void;
  onRefresh: () => void;
}

export default function MissionBar({ mission, onSave, onRefresh }: MissionBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(mission?.content || '');

  const handleSave = () => {
    if (editContent.trim()) {
      onSave(editContent.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(mission?.content || '');
    }
  };

  return (
    <>
      {/* Mission Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 glass border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Mission Content */}
            <button
              onClick={() => {
                setEditContent(mission?.content || '');
                setIsEditing(true);
              }}
              className="flex items-center gap-2 flex-1 min-w-0 group"
            >
              <span className="text-lg flex-shrink-0">🎯</span>
              {mission ? (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {mission.content}
                </span>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors">
                  Tap to define your mission
                </span>
              )}
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onRefresh}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Refresh"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </motion.button>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-7 h-7',
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Gradient border bottom */}
        <div className="h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 opacity-60" />
      </motion.header>

      {/* Edit Mission Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-mission-gradient">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <span className="text-xl">🎯</span>
                    <h2 className="font-medium">Your Life Mission</h2>
                  </div>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                    What is your purpose? What drives everything you do?
                  </p>
                </div>

                <div className="p-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="My mission is to..."
                    autoFocus
                    rows={3}
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                               text-gray-900 dark:text-white placeholder-gray-400
                               focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />

                  <div className="flex justify-end gap-2 mt-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(mission?.content || '');
                      }}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={!editContent.trim()}
                      className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg
                                 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save Mission
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
