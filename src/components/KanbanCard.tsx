'use client';

import { useDraggable } from '@dnd-kit/core';
import type { ExtractedItem, CategoryType } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types';

interface KanbanCardProps {
  item: ExtractedItem;
  onCategoryChange: (id: string, category: CategoryType) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export default function KanbanCard({
  item,
  onCategoryChange,
  onDelete,
  isDragging = false,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { item },
  });

  const categoryColor = CATEGORY_COLORS[item.category] || '#6B7280';

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  const isDone = item.status === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-3 rounded-lg border bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-700
        hover:border-gray-300 dark:hover:border-gray-600
        transition-all cursor-grab active:cursor-grabbing
        ${isDragging ? 'shadow-lg opacity-90 rotate-2' : 'shadow-sm'}
        ${isDone ? 'opacity-60' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      {/* Category indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Content */}
      <div className="pl-2">
        <p
          className={`text-sm text-gray-900 dark:text-gray-100 leading-snug ${
            isDone ? 'line-through text-gray-500 dark:text-gray-400' : ''
          }`}
        >
          {item.content}
        </p>

        {/* Footer - just delete button for tasks */}
        <div className="flex items-center justify-between mt-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
            }}
          >
            {CATEGORY_LABELS[item.category]}
          </span>

          {/* Delete button - visible on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Overlay component for drag preview
export function KanbanCardOverlay({ item }: { item: ExtractedItem }) {
  const categoryColor = CATEGORY_COLORS[item.category] || '#6B7280';

  return (
    <div className="p-3 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-xl rotate-3 cursor-grabbing">
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: categoryColor }}
      />
      <div className="pl-2">
        <p className="text-sm text-gray-900 dark:text-gray-100 leading-snug">
          {item.content}
        </p>
      </div>
    </div>
  );
}
