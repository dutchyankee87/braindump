'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ExtractedItem } from '@/types';

interface ValuesViewProps {
  values: ExtractedItem[];
  onReorder: (items: ExtractedItem[]) => void;
  onDelete: (id: string) => void;
  onAdd: (content: string, description?: string) => void;
}

interface SortableValueProps {
  item: ExtractedItem;
  index: number;
  onDelete: (id: string) => void;
}

// Podium badge styles based on rank
const getPodiumStyle = (index: number) => {
  if (index === 0) {
    return {
      badge: 'w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900 text-lg shadow-lg shadow-amber-200 dark:shadow-amber-900/30',
      card: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-700',
      icon: '🥇',
    };
  }
  if (index === 1) {
    return {
      badge: 'w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-400 text-gray-700 shadow-md',
      card: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700',
      icon: '🥈',
    };
  }
  if (index === 2) {
    return {
      badge: 'w-10 h-10 bg-gradient-to-br from-orange-200 to-orange-500 text-orange-900 shadow-md',
      card: 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700',
      icon: '🥉',
    };
  }
  return {
    badge: 'w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    icon: null,
  };
};

function SortableValue({ item, index, onDelete }: SortableValueProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const podiumStyle = getPodiumStyle(index);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                  ${podiumStyle.card}
                  ${isDragging ? 'shadow-2xl scale-[1.02] z-10' : 'hover:shadow-lg'}
                  ${index === 0 ? 'p-5' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Rank Badge */}
      <div className={`flex items-center justify-center rounded-full font-bold flex-shrink-0 ${podiumStyle.badge}`}>
        {podiumStyle.icon || index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-gray-900 dark:text-white truncate ${index === 0 ? 'text-lg' : ''}`}>
          {item.content}
        </h3>
        {item.metadata?.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {item.metadata.description}
          </p>
        )}
      </div>

      {/* Delete */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(item.id)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>
    </motion.div>
  );
}

export default function ValuesView({ values, onReorder, onDelete, onAdd }: ValuesViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = values.findIndex((v) => v.id === active.id);
      const newIndex = values.findIndex((v) => v.id === over.id);
      const reordered = arrayMove(values, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  const handleAdd = () => {
    if (newValue.trim()) {
      onAdd(newValue.trim(), newDescription.trim() || undefined);
      setNewValue('');
      setNewDescription('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewValue('');
      setNewDescription('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💎</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Core Values</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              What do you stand for? Drag to prioritize.
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400
                     hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
        >
          + Add Value
        </motion.button>
      </div>

      {/* Empty State */}
      {values.length === 0 && !isAdding ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">💎</div>
          <h3 className="empty-state-title">What do you stand for?</h3>
          <p className="empty-state-description">
            Your values are the foundation of who you are. Add your core principles.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Add your first value
          </motion.button>
        </motion.div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={values.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              <AnimatePresence>
                {values.map((value, index) => (
                  <SortableValue
                    key={value.id}
                    item={value}
                    index={index}
                    onDelete={onDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800"
          >
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Value name (e.g., Integrity, Presence, Courage)"
              autoFocus
              className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What does this value mean to you? (optional)"
              className="w-full p-3.5 mt-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewValue('');
                  setNewDescription('');
                }}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newValue.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-xl
                           hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Value
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
