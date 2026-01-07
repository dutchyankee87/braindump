import Anthropic from '@anthropic-ai/sdk';
import type { ExtractedItemFromAI, CategoryType, ItemMetadata, JournalType, WellbeingDimension } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const VALID_CATEGORIES: CategoryType[] = [
  'mission',
  'value',
  'vision',
  'affirmation',
  'intention',
  'project',
  'task',
  'idea',
  'journal',
  'wellbeing',
];

const VALID_JOURNAL_TYPES: JournalType[] = ['gratitude', 'reflection', 'emotion', 'insight'];
const VALID_WELLBEING_DIMENSIONS: WellbeingDimension[] = ['physical', 'mental', 'spiritual'];

// Being-focused categorization prompt (Dispenza-inspired)
const CATEGORIZATION_PROMPT = `Analyze this brain dump and categorize into a being-focused life system. Focus on BEING over DOING.

Categories (choose ONE per item):
- mission: Life purpose or calling statements ("My calling is to...")
- value: Core character traits or principles ("Integrity", "Presence", "Compassion")
- vision: "Who I am becoming" statements - future self identity, NOT outcomes (reframe "I want X" into "I am someone who...")
- affirmation: "I am..." identity statements for elevated self-concept
- intention: How someone wants to feel or be today/in the moment ("Today I embody calm")
- project: Multi-step work or initiatives aligned with vision
- task: Specific actionable items for present moment
- idea: Creative thoughts, possibilities, inspiration
- journal: Reflections, gratitude, emotional processing, insights
- wellbeing: Physical, mental, or spiritual health notes

Rules:
- Focus on BEING over DOING - reframe outcome-focused statements into identity statements when possible
- Split compound thoughts into separate items
- Keep original meaning and essence
- One category per item

Transformations to apply:
- "Make $100k" → vision: "I am financially abundant and generous"
- "Lose 20 lbs" → vision: "I am someone who honors and nourishes my body"
- "Feel less anxious" → intention: "I move through today with calm presence"
- "I'm grateful for..." → journal with journalType: "gratitude"
- "I realized..." → journal with journalType: "insight"
- "Went for a run" → wellbeing with wellbeingDimension: "physical"
- "Meditation session" → wellbeing with wellbeingDimension: "spiritual"

Return ONLY a valid JSON array:
[
  {
    "content": "extracted item text",
    "category": "category_name",
    "metadata": {
      "journalType": "gratitude|reflection|emotion|insight",
      "wellbeingDimension": "physical|mental|spiritual"
    }
  }
]

Only include metadata fields when relevant (journalType for journal, wellbeingDimension for wellbeing).`;

export async function categorizeContent(
  content: string,
  imageAnalysis?: string | null
): Promise<ExtractedItemFromAI[]> {
  const userMessage = imageAnalysis
    ? `Brain dump: "${content}"\n\nImage description: "${imageAnalysis}"`
    : `Brain dump: "${content}"`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `${CATEGORIZATION_PROMPT}\n\n${userMessage}`,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from response');
  }

  const items: ExtractedItemFromAI[] = JSON.parse(jsonMatch[0]);

  return items.map((item) => {
    const category = VALID_CATEGORIES.includes(item.category as CategoryType)
      ? (item.category as CategoryType)
      : 'idea';

    // Validate and clean metadata
    const metadata: ItemMetadata = {};

    if (item.metadata) {
      if (category === 'journal' && item.metadata.journalType) {
        if (VALID_JOURNAL_TYPES.includes(item.metadata.journalType as JournalType)) {
          metadata.journalType = item.metadata.journalType as JournalType;
        }
      }
      if (category === 'wellbeing' && item.metadata.wellbeingDimension) {
        if (VALID_WELLBEING_DIMENSIONS.includes(item.metadata.wellbeingDimension as WellbeingDimension)) {
          metadata.wellbeingDimension = item.metadata.wellbeingDimension as WellbeingDimension;
        }
      }
    }

    return {
      content: item.content,
      category,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };
  });
}

export async function analyzeImage(
  imageUrl: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: 'Describe this image in detail. If it contains text (handwritten notes, whiteboard, etc.), transcribe all visible text. If it shows a to-do list, tasks, or organizational content, extract those items. If it shows vision boards, affirmations, or goals, capture those. Provide a comprehensive description that captures all relevant information for personal development and organization.',
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textContent.text;
}
