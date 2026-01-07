# Brain Dump

A PWA productivity app where users dump thoughts (text/images) and AI categorizes them into actionable items.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL via Drizzle ORM
- **AI**: Claude API (categorization + Vision for images)
- **Storage**: Supabase Storage (images)
- **PWA**: next-pwa (offline support + installable)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dump interface
│   ├── items/page.tsx        # Items list view
│   └── api/
│       ├── dump/route.ts     # POST: create dump + AI categorization
│       └── items/route.ts    # GET/PATCH/DELETE items
├── components/
│   ├── DumpInput.tsx         # Text + image input form
│   ├── ItemList.tsx          # Categorized items display
│   ├── ItemCard.tsx          # Individual item with actions
│   ├── CategoryFilter.tsx    # Filter by category
│   └── OfflineIndicator.tsx  # Offline status banner
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema (dumps, extracted_items, categories)
│   │   └── index.ts          # DB connection
│   ├── claude.ts             # AI categorization + image analysis
│   ├── supabase.ts           # Image upload
│   └── offline.ts            # IndexedDB for offline dumps
├── hooks/
│   └── useOfflineSync.ts     # Sync offline dumps when online
└── types/
    └── index.ts              # TypeScript interfaces + category definitions
```

## Database Tables

- **dumps**: Original brain dump content + optional image
- **extracted_items**: AI-extracted items with category and status
- **categories**: User categories (defaults: task, project, goal, emotion, health, idea, reflection)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `ANTHROPIC_API_KEY` - Claude API key

## Key Flows

### Dump Creation
1. User enters text and/or uploads image
2. If image: upload to Supabase Storage, analyze with Claude Vision
3. Send content to Claude for categorization
4. Claude extracts items and assigns categories
5. Save dump + extracted items to database

### Offline Support
- Dumps saved to IndexedDB when offline
- Auto-sync when connection restored
- Images disabled when offline (text only)

## Categories

| Category   | Color   | Description                    |
|------------|---------|--------------------------------|
| task       | #3B82F6 | Actionable to-dos              |
| project    | #8B5CF6 | Larger initiatives             |
| goal       | #10B981 | Future aspirations             |
| emotion    | #F59E0B | Feelings, mood                 |
| health     | #EF4444 | Fitness, wellness              |
| idea       | #EC4899 | Creative thoughts              |
| reflection | #6366F1 | Observations, gratitude        |

## Notes

- Supabase shared with other projects (same account)
- Storage bucket: `brain-dump-images` (must be public)
- PWA disabled in development mode
