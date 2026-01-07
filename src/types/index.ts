// Being-focused Life Cockpit Categories (Dispenza-inspired)
export type CategoryType =
  | 'mission'     // Life purpose / calling
  | 'value'       // Core character traits
  | 'vision'      // Future self (who you're becoming)
  | 'affirmation' // "I am..." identity statements
  | 'intention'   // How you want to feel/be today
  | 'project'     // Work in service of vision
  | 'task'        // Present moment actions
  | 'idea'        // Creative downloads
  | 'journal'     // Gratitude, reflections, emotions
  | 'wellbeing';  // Physical, mental, spiritual

// Kanban workflow statuses (for tasks)
export type ItemStatus = 'inbox' | 'today' | 'doing' | 'done' | 'archived';

// Wellbeing dimensions
export type WellbeingDimension = 'physical' | 'mental' | 'spiritual';

// Journal entry types
export type JournalType = 'gratitude' | 'reflection' | 'emotion' | 'insight';

// Tab groups for cockpit navigation
export type TabGroup = 'being' | 'doing' | 'growing' | 'capturing';

// Category metadata for display
export interface CategoryConfig {
  id: CategoryType;
  title: string;
  icon: string;
  color: string;
  description: string;
  tabGroup: TabGroup;
  displayType: 'hero' | 'list' | 'board' | 'cards' | 'kanban' | 'timeline' | 'log';
}

// All category configurations
export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'mission',
    title: 'Mission',
    icon: '🎯',
    color: '#DC2626',
    description: 'Your life purpose and calling',
    tabGroup: 'being',
    displayType: 'hero',
  },
  {
    id: 'value',
    title: 'Values',
    icon: '💎',
    color: '#7C3AED',
    description: 'Core character traits',
    tabGroup: 'being',
    displayType: 'list',
  },
  {
    id: 'vision',
    title: 'Vision',
    icon: '🔭',
    color: '#2563EB',
    description: 'Who you are becoming',
    tabGroup: 'being',
    displayType: 'board',
  },
  {
    id: 'affirmation',
    title: 'Affirmations',
    icon: '✨',
    color: '#F59E0B',
    description: '"I am..." identity statements',
    tabGroup: 'being',
    displayType: 'cards',
  },
  {
    id: 'intention',
    title: 'Intentions',
    icon: '🌅',
    color: '#F97316',
    description: 'How you want to feel today',
    tabGroup: 'doing',
    displayType: 'cards',
  },
  {
    id: 'project',
    title: 'Projects',
    icon: '📁',
    color: '#8B5CF6',
    description: 'Work aligned with your vision',
    tabGroup: 'doing',
    displayType: 'cards',
  },
  {
    id: 'task',
    title: 'Tasks',
    icon: '✅',
    color: '#3B82F6',
    description: 'Present moment actions',
    tabGroup: 'doing',
    displayType: 'kanban',
  },
  {
    id: 'idea',
    title: 'Ideas',
    icon: '💡',
    color: '#EC4899',
    description: 'Creative downloads',
    tabGroup: 'capturing',
    displayType: 'cards',
  },
  {
    id: 'journal',
    title: 'Journal',
    icon: '📔',
    color: '#6366F1',
    description: 'Gratitude, reflections, emotions',
    tabGroup: 'growing',
    displayType: 'timeline',
  },
  {
    id: 'wellbeing',
    title: 'Wellbeing',
    icon: '🧘',
    color: '#10B981',
    description: 'Physical, mental, spiritual',
    tabGroup: 'growing',
    displayType: 'log',
  },
];

// Tab group configuration
export interface TabGroupConfig {
  id: TabGroup;
  title: string;
  icon: string;
  categories: CategoryType[];
}

export const TAB_GROUPS: TabGroupConfig[] = [
  {
    id: 'being',
    title: 'Being',
    icon: '🌟',
    categories: ['mission', 'value', 'vision', 'affirmation'],
  },
  {
    id: 'doing',
    title: 'Doing',
    icon: '⚡',
    categories: ['intention', 'project', 'task'],
  },
  {
    id: 'growing',
    title: 'Growing',
    icon: '🌱',
    categories: ['wellbeing', 'journal'],
  },
  {
    id: 'capturing',
    title: 'Capturing',
    icon: '💭',
    categories: ['idea'],
  },
];

// Column configuration for the Kanban board (tasks only)
export interface KanbanColumn {
  id: ItemStatus;
  title: string;
  icon: string;
  color: string;
  description: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'inbox',
    title: 'Inbox',
    icon: '📥',
    color: '#6B7280',
    description: 'New items to process',
  },
  {
    id: 'today',
    title: 'Today',
    icon: '📌',
    color: '#F59E0B',
    description: 'Queued for today',
  },
  {
    id: 'doing',
    title: 'Doing',
    icon: '🔥',
    color: '#3B82F6',
    description: 'Currently working on',
  },
  {
    id: 'done',
    title: 'Done',
    icon: '✅',
    color: '#10B981',
    description: 'Completed',
  },
];

// Helper to get category config by id
export function getCategoryConfig(id: CategoryType): CategoryConfig {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[6]; // default to task
}

// Helper to get categories by tab group
export function getCategoriesByTabGroup(tabGroup: TabGroup): CategoryConfig[] {
  return CATEGORIES.filter((c) => c.tabGroup === tabGroup);
}

export interface Dump {
  id: string;
  userId: string;
  content: string;
  imageUrl: string | null;
  imageAnalysis: string | null;
  createdAt: Date;
  synced: boolean;
}

export interface ExtractedItem {
  id: string;
  dumpId: string;
  content: string;
  category: CategoryType;
  status: ItemStatus;
  priority?: number;           // For ordering (values, etc.)
  metadata?: ItemMetadata;     // Additional category-specific data
  createdAt: Date;
  updatedAt: Date;
}

// Metadata for different item types
export interface ItemMetadata {
  // For journal entries
  journalType?: JournalType;
  // For wellbeing entries
  wellbeingDimension?: WellbeingDimension;
  // For projects
  progress?: number;           // 0-100
  linkedVision?: string;       // Reference to vision item
  // For values
  description?: string;        // Expanded description
  // For vision board
  imageUrl?: string;           // Optional image for vision items
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface ExtractedItemFromAI {
  content: string;
  category: CategoryType;
  metadata?: ItemMetadata;
}

// Legacy support - maps old categories to new
export const CATEGORY_MIGRATION_MAP: Record<string, CategoryType> = {
  task: 'task',
  project: 'project',
  goal: 'vision',      // Reframe as "who I'm becoming"
  emotion: 'journal',
  health: 'wellbeing',
  idea: 'idea',
  reflection: 'journal',
};

// Category labels for display
export const CATEGORY_LABELS: Record<CategoryType, string> = {
  mission: 'Mission',
  value: 'Values',
  vision: 'Vision',
  affirmation: 'Affirmations',
  intention: 'Intentions',
  project: 'Projects',
  task: 'Tasks',
  idea: 'Ideas',
  journal: 'Journal',
  wellbeing: 'Wellbeing',
};

// Category colors for UI
export const CATEGORY_COLORS: Record<CategoryType, string> = {
  mission: '#DC2626',
  value: '#7C3AED',
  vision: '#2563EB',
  affirmation: '#F59E0B',
  intention: '#F97316',
  project: '#8B5CF6',
  task: '#3B82F6',
  idea: '#EC4899',
  journal: '#6366F1',
  wellbeing: '#10B981',
};
