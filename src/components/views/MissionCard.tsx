'use client';

import { useState } from 'react';
import type { ExtractedItem } from '@/types';

interface MissionCardProps {
  mission: ExtractedItem | null;
  onSave: (content: string) => void;
}

export default function MissionCard({ mission, onSave }: MissionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(mission?.content || '');

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave();
    }
    if (e.key === 'Escape') {
      setContent(mission?.content || '');
      setIsEditing(false);
    }
  };

  if (!mission && !isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full p-8 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600
                   hover:border-red-400 dark:hover:border-red-500 transition-colors
                   text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">🎯</span>
          <span className="font-medium">Define Your Mission</span>
          <span className="text-sm">What is your life's calling?</span>
        </div>
      </button>
    );
  }

  if (isEditing) {
    return (
      <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Mission</h2>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="My calling is to..."
          autoFocus
          className="w-full p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                     text-lg text-gray-900 dark:text-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={3}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={() => {
              setContent(mission?.content || '');
              setIsEditing(false);
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg
                       hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Mission
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20
                 border border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow text-left group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">🎯</span>
        <div className="flex-1">
          <h2 className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">YOUR MISSION</h2>
          <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
            {mission?.content}
          </p>
        </div>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
          Edit
        </span>
      </div>
    </button>
  );
}
