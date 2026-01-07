'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import KanbanColumn from './KanbanColumn';
import { KanbanCardOverlay } from './KanbanCard';
import type { ExtractedItem, CategoryType, ItemStatus } from '@/types';
import { KANBAN_COLUMNS } from '@/types';

interface KanbanBoardProps {
  refreshTrigger?: number;
}

export default function KanbanBoard({ refreshTrigger }: KanbanBoardProps) {
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<ExtractedItem | null>(null);
  const [mobileColumn, setMobileColumn] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();

      if (data.success) {
        // Filter out archived items
        const activeItems = data.data.filter(
          (item: ExtractedItem) => item.status !== 'archived'
        );
        setItems(activeItems);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshTrigger]);

  const handleStatusChange = async (id: string, status: ItemStatus) => {
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, updatedAt: new Date() } : item
      )
    );

    try {
      const response = await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        // Revert on failure
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      fetchItems();
    }
  };

  const handleCategoryChange = async (id: string, category: CategoryType) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, category, updatedAt: new Date() } : item
      )
    );

    try {
      const response = await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, category }),
      });

      if (!response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const response = await fetch(`/api/items?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      fetchItems();
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const item = items.find((i) => i.id === active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveItem(null);

    if (!over) return;

    const itemId = active.id as string;
    const newStatus = over.id as ItemStatus;

    // Only update if dropped on a different column
    const item = items.find((i) => i.id === itemId);
    if (item && item.status !== newStatus) {
      handleStatusChange(itemId, newStatus);
    }
  };

  const getItemsByStatus = (status: ItemStatus) =>
    items.filter((item) => item.status === status);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Get total item counts for mobile tabs
  const getColumnCount = (status: ItemStatus) =>
    items.filter((item) => item.status === status).length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile column selector tabs */}
      <div className="flex md:hidden gap-1 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto scrollbar-hide">
        {KANBAN_COLUMNS.map((column, index) => (
          <button
            key={column.id}
            onClick={() => setMobileColumn(index)}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
          </button>
        ))}
      </div>

      {/* Mobile: Single column view */}
      <div className="md:hidden">
        <KanbanColumn
          column={KANBAN_COLUMNS[mobileColumn]}
          items={getItemsByStatus(KANBAN_COLUMNS[mobileColumn].id)}
          onCategoryChange={handleCategoryChange}
          onDelete={handleDelete}
          activeId={activeId}
        />
      </div>

      {/* Desktop: Full Kanban board */}
      <div
        ref={scrollRef}
        className="hidden md:flex gap-4 overflow-x-auto pb-4 scrollbar-hide kanban-scroll"
      >
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={getItemsByStatus(column.id)}
            onCategoryChange={handleCategoryChange}
            onDelete={handleDelete}
            activeId={activeId}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? <KanbanCardOverlay item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
