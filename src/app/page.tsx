'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MissionCard,
  ValuesView,
  VisionBoard,
  AffirmationsView,
  IntentionsView,
  ProjectsView,
  TasksKanban,
  IdeasView,
  JournalView,
  WellbeingView,
} from '@/components/views';
import QuickDump from '@/components/QuickDump';
import MissionBar from '@/components/MissionBar';
import OfflineIndicator from '@/components/OfflineIndicator';
import OnboardingModal from '@/components/OnboardingModal';
import type {
  ExtractedItem,
  CategoryType,
  TabGroup,
  ItemStatus,
  ItemMetadata,
} from '@/types';
import { TAB_GROUPS, CATEGORY_MIGRATION_MAP } from '@/types';

// Tab colors for the gradient effect
const TAB_COLORS: Record<TabGroup, { primary: string; bg: string; glow: string }> = {
  being: { primary: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', glow: 'glow-being' },
  doing: { primary: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500', glow: 'glow-doing' },
  growing: { primary: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', glow: 'glow-growing' },
  capturing: { primary: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500', glow: 'glow-capturing' },
};

// Category icons for sub-navigation
const CATEGORY_ICONS: Record<CategoryType, string> = {
  mission: '🎯',
  value: '💎',
  vision: '🔭',
  affirmation: '✨',
  intention: '🌅',
  project: '📁',
  task: '✅',
  idea: '💡',
  journal: '📔',
  wellbeing: '🧘',
};

const CATEGORY_LABELS: Record<CategoryType, string> = {
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

export default function Cockpit() {
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabGroup>('being');
  const [activeSubView, setActiveSubView] = useState<CategoryType>('mission');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding has been completed
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('brain-dump-onboarding-complete');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('brain-dump-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();

      if (data.success) {
        const normalizedItems = data.data.map((item: ExtractedItem) => ({
          ...item,
          category: CATEGORY_MIGRATION_MAP[item.category] || item.category,
        }));
        setItems(normalizedItems.filter((i: ExtractedItem) => i.status !== 'archived'));
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

  // Set active sub-view when tab changes
  useEffect(() => {
    const tabConfig = TAB_GROUPS.find((t) => t.id === activeTab);
    if (tabConfig && tabConfig.categories.length > 0) {
      setActiveSubView(tabConfig.categories[0]);
    }
  }, [activeTab]);

  const handleDumpComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Get items by category
  const getItemsByCategory = (category: CategoryType) =>
    items.filter((i) => i.category === category);

  // Get mission (should be single item)
  const mission = items.find((i) => i.category === 'mission') || null;

  // Generic update handler
  const updateItem = async (id: string, updates: Partial<ExtractedItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      )
    );

    try {
      const response = await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!response.ok) fetchItems();
    } catch (error) {
      console.error('Failed to update item:', error);
      fetchItems();
    }
  };

  // Generic delete handler
  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      const response = await fetch(`/api/items?id=${id}`, { method: 'DELETE' });
      if (!response.ok) fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      fetchItems();
    }
  };

  // Generic add handler
  const addItem = async (
    content: string,
    category: CategoryType,
    metadata?: ItemMetadata
  ) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category, metadata }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItems((prev) => [data.data, ...prev]);
        }
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Category change handler
  const changeCategory = async (id: string, newCategory: CategoryType) => {
    await updateItem(id, { category: newCategory });
  };

  // Edit content handler
  const editItemContent = async (id: string, content: string) => {
    await updateItem(id, { content });
  };

  // Reorder handler for values
  const handleValuesReorder = async (reorderedValues: ExtractedItem[]) => {
    setItems((prev) => {
      const nonValues = prev.filter((i) => i.category !== 'value');
      return [...nonValues, ...reorderedValues.map((v, idx) => ({ ...v, priority: idx }))];
    });

    for (let i = 0; i < reorderedValues.length; i++) {
      await updateItem(reorderedValues[i].id, { priority: i });
    }
  };

  // Project progress update
  const handleProjectProgress = async (id: string, progress: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      await updateItem(id, {
        metadata: { ...item.metadata, progress },
        status: progress >= 100 ? 'done' : item.status,
      });
    }
  };

  // Mission save handler
  const handleMissionSave = (content: string) => {
    if (mission) {
      updateItem(mission.id, { content });
    } else {
      addItem(content, 'mission');
    }
  };

  // Tab group config
  const currentTabConfig = TAB_GROUPS.find((t) => t.id === activeTab);

  // Render sub-view based on active category
  const renderSubView = () => {
    const viewProps = {
      mission: (
        <MissionCard
          mission={mission}
          onSave={(content) => {
            if (mission) {
              updateItem(mission.id, { content });
            } else {
              addItem(content, 'mission');
            }
          }}
        />
      ),
      value: (
        <ValuesView
          values={getItemsByCategory('value').sort((a, b) => (a.priority || 0) - (b.priority || 0))}
          onReorder={handleValuesReorder}
          onDelete={deleteItem}
          onAdd={(content, description) => addItem(content, 'value', { description })}
        />
      ),
      vision: (
        <VisionBoard
          visions={getItemsByCategory('vision')}
          onAdd={(content) => addItem(content, 'vision')}
          onDelete={deleteItem}
          onEdit={editItemContent}
        />
      ),
      affirmation: (
        <AffirmationsView
          affirmations={getItemsByCategory('affirmation')}
          onAdd={(content) => addItem(content, 'affirmation')}
          onDelete={deleteItem}
          onEdit={editItemContent}
        />
      ),
      intention: (
        <IntentionsView
          intentions={getItemsByCategory('intention')}
          onAdd={(content) => addItem(content, 'intention')}
          onDelete={deleteItem}
          onComplete={(id) => updateItem(id, { status: 'done' })}
        />
      ),
      project: (
        <ProjectsView
          projects={getItemsByCategory('project')}
          onAdd={(content) => addItem(content, 'project', { progress: 0 })}
          onDelete={deleteItem}
          onUpdateProgress={handleProjectProgress}
        />
      ),
      task: (
        <TasksKanban
          tasks={getItemsByCategory('task')}
          onStatusChange={(id, status) => updateItem(id, { status })}
          onDelete={deleteItem}
          onAdd={(content) => addItem(content, 'task')}
        />
      ),
      idea: (
        <IdeasView
          ideas={getItemsByCategory('idea')}
          onAdd={(content) => addItem(content, 'idea')}
          onDelete={deleteItem}
          onEdit={editItemContent}
          onPromoteToProject={(id) => changeCategory(id, 'project')}
          onPromoteToTask={(id) => changeCategory(id, 'task')}
        />
      ),
      journal: (
        <JournalView
          entries={getItemsByCategory('journal').sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          onAdd={(content, journalType) => addItem(content, 'journal', { journalType })}
          onDelete={deleteItem}
        />
      ),
      wellbeing: (
        <WellbeingView
          entries={getItemsByCategory('wellbeing').sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )}
          onAdd={(content, wellbeingDimension) => addItem(content, 'wellbeing', { wellbeingDimension })}
          onDelete={deleteItem}
        />
      ),
    };

    return viewProps[activeSubView] || null;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0F172A] pb-24 md:pb-6">
      {/* Mission Bar - Always at top */}
      <MissionBar
        mission={mission}
        onSave={handleMissionSave}
        onRefresh={handleRefresh}
      />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Quick Dump */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickDump onDumpComplete={handleDumpComplete} />
        </motion.section>

        {/* Desktop Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block"
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-1.5">
            {/* Gradient bar underneath */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 tab-gradient-bar rounded-b-2xl opacity-50" />

            <div className="flex gap-1">
              {TAB_GROUPS.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                    activeTab === tab.id
                      ? `${TAB_COLORS[tab.id].primary} bg-gray-100 dark:bg-gray-700`
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.title}</span>

                  {/* Active indicator dot */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${TAB_COLORS[tab.id].bg}`}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.nav>

        {/* Sub-navigation for categories within tab */}
        <AnimatePresence mode="wait">
          {currentTabConfig && currentTabConfig.categories.length > 1 && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
            >
              {currentTabConfig.categories.map((cat) => {
                const count = getItemsByCategory(cat).length;
                return (
                  <motion.button
                    key={cat}
                    onClick={() => setActiveSubView(cat)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                      activeSubView === cat
                        ? 'bg-white dark:bg-gray-800 shadow-md font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    <span>{CATEGORY_LABELS[cat]}</span>
                    {count > 0 && cat !== 'mission' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        activeSubView === cat
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'bg-gray-200/50 dark:bg-gray-700/50'
                      }`}>
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.section
            key={activeSubView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[400px]"
          >
            {renderSubView()}
          </motion.section>
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 safe-area-pb">
        {/* Gradient bar on top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 tab-gradient-bar opacity-50" />

        <div className="flex justify-around py-2 px-2">
          {TAB_GROUPS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? TAB_COLORS[tab.id].primary
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.title}</span>

              {/* Active indicator dot */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${TAB_COLORS[tab.id].bg}`}
                />
              )}
            </motion.button>
          ))}
        </div>
      </nav>

      <OfflineIndicator />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </main>
  );
}
