'use client';

import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';
import type { ExtractedItem, CategoryType, KanbanColumn as KanbanColumnType } from '@/types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  items: ExtractedItem[];
  onCategoryChange: (id: string, category: CategoryType) => void;
  onDelete: (id: string) => void;
  activeId: string | null;
}

export default function KanbanColumn({
  column,
  items,
  onCategoryChange,
  onDelete,
  activeId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column },
  });

  return (
    <div className="flex flex-col w-full md:min-w-[280px] md:max-w-[320px] md:flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg">{column.icon}</span>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {column.title}
        </h3>
        <span className="ml-auto text-sm font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {items.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 rounded-xl min-h-[200px] transition-colors
          ${
            isOver
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600'
              : 'bg-gray-100 dark:bg-gray-800/50'
          }
        `}
      >
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              {column.description}
            </div>
          ) : (
            items.map((item) => (
              <KanbanCard
                key={item.id}
                item={item}
                onCategoryChange={onCategoryChange}
                onDelete={onDelete}
                isDragging={item.id === activeId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
