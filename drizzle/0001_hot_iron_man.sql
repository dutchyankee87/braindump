ALTER TABLE "extracted_items" ALTER COLUMN "status" SET DEFAULT 'inbox';--> statement-breakpoint
ALTER TABLE "extracted_items" ADD COLUMN "priority" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "extracted_items" ADD COLUMN "metadata" jsonb;