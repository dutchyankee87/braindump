import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dumps, extractedItems } from '@/lib/db/schema';
import { categorizeContent, analyzeImage } from '@/lib/claude';
import { desc, eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser();
    const { content, imageUrl } = await request.json();

    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: 'Content or image is required' },
        { status: 400 }
      );
    }

    let imageAnalysis: string | null = null;

    if (imageUrl) {
      imageAnalysis = await analyzeImage(imageUrl);
    }

    const [dump] = await db
      .insert(dumps)
      .values({
        userId,
        content: content || '',
        imageUrl,
        imageAnalysis,
      })
      .returning();

    const textToAnalyze = content || imageAnalysis || '';
    const items = await categorizeContent(textToAnalyze, imageAnalysis);

    const insertedItems = await db
      .insert(extractedItems)
      .values(
        items.map((item) => ({
          dumpId: dump.id,
          content: item.content,
          category: item.category,
          status: 'inbox',
          metadata: item.metadata || null,
        }))
      )
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        dump,
        items: insertedItems,
      },
    });
  } catch (error) {
    console.error('Error creating dump:', error);
    return NextResponse.json(
      { error: 'Failed to create dump', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await getAuthenticatedUser();

    const allDumps = await db
      .select()
      .from(dumps)
      .where(eq(dumps.userId, userId))
      .orderBy(desc(dumps.createdAt));

    return NextResponse.json({ success: true, data: allDumps });
  } catch (error) {
    console.error('Error fetching dumps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dumps', details: String(error) },
      { status: 500 }
    );
  }
}
