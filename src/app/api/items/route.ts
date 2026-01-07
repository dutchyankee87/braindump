import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractedItems, dumps } from '@/lib/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import type { CategoryType, ItemStatus, ItemMetadata } from '@/types';
import { CATEGORY_MIGRATION_MAP } from '@/types';

// Map legacy statuses to new Kanban statuses
function normalizeStatus(status: string): ItemStatus {
  switch (status) {
    case 'active':
      return 'inbox';
    case 'completed':
      return 'done';
    default:
      return status as ItemStatus;
  }
}

// Map legacy categories to new categories
function normalizeCategory(category: string): CategoryType {
  return (CATEGORY_MIGRATION_MAP[category] || category) as CategoryType;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as CategoryType | null;
    const status = searchParams.get('status') as ItemStatus | null;

    let query = db.select().from(extractedItems);

    const conditions = [];
    if (category) {
      conditions.push(eq(extractedItems.category, category));
    }
    if (status) {
      conditions.push(eq(extractedItems.status, status));
    }

    const items = conditions.length > 0
      ? await query.where(and(...conditions)).orderBy(desc(extractedItems.createdAt))
      : await query.orderBy(desc(extractedItems.createdAt));

    // Normalize legacy statuses and categories
    const normalizedItems = items.map((item) => ({
      ...item,
      status: normalizeStatus(item.status),
      category: normalizeCategory(item.category),
    }));

    return NextResponse.json({ success: true, data: normalizedItems });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new item directly (without going through dump/AI categorization)
export async function POST(request: NextRequest) {
  try {
    const { content, category, metadata, status = 'inbox', priority } = await request.json();

    if (!content || !category) {
      return NextResponse.json(
        { error: 'Content and category are required' },
        { status: 400 }
      );
    }

    // Create a minimal dump record to satisfy the foreign key
    const [dump] = await db
      .insert(dumps)
      .values({
        content: `[Direct] ${content.substring(0, 50)}...`,
      })
      .returning();

    // Create the item
    const [item] = await db
      .insert(extractedItems)
      .values({
        dumpId: dump.id,
        content,
        category,
        status,
        priority: priority || 0,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, category, priority, metadata, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const updates: {
      status?: string;
      category?: string;
      priority?: number;
      metadata?: ItemMetadata | null;
      content?: string;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updates.status = status;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (metadata !== undefined) updates.metadata = metadata;
    if (content !== undefined) updates.content = content;

    const [updated] = await db
      .update(extractedItems)
      .set(updates)
      .where(eq(extractedItems.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const [deleted] = await db
      .delete(extractedItems)
      .where(eq(extractedItems.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item', details: String(error) },
      { status: 500 }
    );
  }
}
