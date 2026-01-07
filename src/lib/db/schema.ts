import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const dumps = pgTable('dumps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().default('default'),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  imageAnalysis: text('image_analysis'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  synced: boolean('synced').default(true).notNull(),
});

export const extractedItems = pgTable('extracted_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  dumpId: uuid('dump_id')
    .references(() => dumps.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(), // mission | value | vision | affirmation | intention | project | task | idea | journal | wellbeing
  status: text('status').notNull().default('inbox'), // inbox | today | doing | done | archived
  priority: integer('priority').default(0), // For ordering (values, etc.)
  metadata: jsonb('metadata'), // Additional category-specific data (journalType, wellbeingDimension, progress, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().default('default'),
  name: text('name').notNull(),
  color: text('color').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DumpInsert = typeof dumps.$inferInsert;
export type DumpSelect = typeof dumps.$inferSelect;
export type ExtractedItemInsert = typeof extractedItems.$inferInsert;
export type ExtractedItemSelect = typeof extractedItems.$inferSelect;
export type CategoryInsert = typeof categories.$inferInsert;
export type CategorySelect = typeof categories.$inferSelect;
