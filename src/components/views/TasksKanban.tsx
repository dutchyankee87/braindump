'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import KanbanColumn from '../KanbanColumn';
import { KanbanCardOverlay } from '../KanbanCard';
import type { ExtractedItem, ItemStatus } from '@/types';
import { KANBAN_COLUMNS } from '@/types';

interface TasksKanbanProps {
  tasks: ExtractedItem[];
  onStatusChange: (id: string, status: ItemStatus) => void;
  onDelete: (id: string) => void;
  onAdd: (content: string) => void;
}

export default function TasksKanban({ tasks, onStatusChange, onDelete, onAdd }: TasksKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ExtractedItem | null>(null);
  const [mobileColumn, setMobileColumn] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [focusedTask, setFocusedTask] = useState<ExtractedItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const item = tasks.find((i) => i.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const itemId = active.id as string;
    const newStatus = over.id as ItemStatus;

    const item = tasks.find((i) => i.id === itemId);
    if (item && item.status !== newStatus) {
      onStatusChange(itemId, newStatus);
    }
  };

  const handleAdd = () => {
    if (newTask.trim()) {
      onAdd(newTask.trim());
      setNewTask('');
      setIsAdding(false);
    }
  };

  const getTasksByStatus = (status: ItemStatus) =>
    tasks.filter((task) => task.status === status);

  const getColumnCount = (status: ItemStatus) =>
    tasks.filter((task) => task.status === status).length;

  const handleCategoryChange = () => {};

  // Find current "doing" task for focus mode suggestion
  const currentDoingTask = tasks.find((t) => t.status === 'doing');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Tasks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentDoingTask && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFocusedTask(currentDoingTask)}
              className="px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400
                         bg-orange-50 dark:bg-orange-900/20 rounded-xl transition-colors"
            >
              🎯 Focus Mode
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400
                       hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
          >
            + Add Task
          </motion.button>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-700"
          >
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewTask('');
                }
              }}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsAdding(false);
                  setNewTask('');
                }}
                className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!newTask.trim()}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Task
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {tasks.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="empty-state rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <div className="empty-state-icon">✅</div>
          <h3 className="empty-state-title">A clear mind, a clear list</h3>
          <p className="empty-state-description">
            Capture tasks and drag them through your workflow.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Add a task
          </motion.button>
        </motion.div>
      )}

      {/* Kanban Board */}
      {tasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Mobile column selector tabs */}
          <div className="flex md:hidden gap-1 mb-4 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-x-auto scrollbar-hide">
            {KANBAN_COLUMNS.map((column, index) => (
              <motion.button
                key={column.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMobileColumn(index)}
                className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mobileColumn === index
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span>{column.icon}</span>
                <span className="hidden xs:inline">{column.title}</span>
                {getColumnCount(column.id) > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    mobileColumn === index
                      ? 'bg-gray-100 dark:bg-gray-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {getColumnCount(column.id)}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Mobile: Single column view */}
          <div className="md:hidden">
            <KanbanColumn
              column={KANBAN_COLUMNS[mobileColumn]}
              items={getTasksByStatus(KANBAN_COLUMNS[mobileColumn].id)}
              onCategoryChange={handleCategoryChange}
              onDelete={onDelete}
              activeId={activeId}
            />
          </div>

          {/* Desktop: Full Kanban board */}
          <div className="hidden md:flex gap-4 overflow-x-auto pb-4 scrollbar-hide kanban-scroll">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                items={getTasksByStatus(column.id)}
                onCategoryChange={handleCategoryChange}
                onDelete={onDelete}
                activeId={activeId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? <KanbanCardOverlay item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Focus Mode Modal */}
      <AnimatePresence>
        {focusedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="focus-mode-overlay"
            onClick={() => setFocusedTask(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="focus-mode-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Focus on this one thing
                  </h2>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-700 mb-8">
                  <p className="text-xl font-medium text-gray-900 dark:text-white text-center">
                    {focusedTask.content}
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onStatusChange(focusedTask.id, 'done');
                      setFocusedTask(null);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    ✓ Mark Complete
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFocusedTask(null)}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    Back to Board
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
