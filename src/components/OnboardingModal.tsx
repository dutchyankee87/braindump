'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Brain Dump',
    subtitle: 'Your personal life cockpit',
  },
  {
    id: 'philosophy',
    title: 'Being Before Doing',
    subtitle: 'A different approach to productivity',
  },
  {
    id: 'tabs',
    title: 'Four Pillars',
    subtitle: 'Organize your inner and outer world',
  },
  {
    id: 'dump',
    title: 'Dump Your Thoughts',
    subtitle: 'Let AI organize for you',
  },
  {
    id: 'ready',
    title: "You're All Set",
    subtitle: 'Start your journey',
  },
];

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="text-7xl mb-4"
            >
              🧠
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
              Brain Dump is more than a to-do list. It&apos;s a space to capture everything
              in your mind and transform scattered thoughts into organized clarity.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3">
              <span className="text-emerald-500">✓</span>
              <span>Works offline</span>
              <span className="mx-2">•</span>
              <span className="text-emerald-500">✓</span>
              <span>AI-powered</span>
              <span className="mx-2">•</span>
              <span className="text-emerald-500">✓</span>
              <span>Installable</span>
            </div>
          </div>
        );

      case 'philosophy':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800"
              >
                <div className="text-3xl mb-2">🌟</div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300">Being</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Know who you are first
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
              >
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-300">Doing</h4>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Actions aligned with purpose
                </p>
              </motion.div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
              Most productivity apps start with tasks. We start with <strong>who you want to be</strong>.
              Your mission, values, and vision guide every action.
            </p>
          </div>
        );

      case 'tabs':
        return (
          <div className="space-y-4">
            {[
              { icon: '🌟', title: 'Being', desc: 'Mission, Values, Vision, Affirmations', color: 'amber' },
              { icon: '⚡', title: 'Doing', desc: 'Intentions, Projects, Tasks', color: 'blue' },
              { icon: '🌱', title: 'Growing', desc: 'Wellbeing, Journal', color: 'emerald' },
              { icon: '💭', title: 'Capturing', desc: 'Ideas for later', color: 'pink' },
            ].map((tab, index) => (
              <motion.div
                key={tab.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-${tab.color}-50 to-${tab.color}-100/50 dark:from-${tab.color}-900/20 dark:to-${tab.color}-800/10 border border-${tab.color}-200 dark:border-${tab.color}-800/50`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{tab.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tab.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'dump':
        return (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">💬</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Just type or speak
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Write whatever&apos;s on your mind. Our AI will understand context and
                    automatically categorize it into the right place.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">🎤</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Pro tip: Use voice input
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    For the best brain dump experience, speak your thoughts!
                    We recommend <strong>Whispr Pro</strong> for seamless voice-to-text.
                  </p>
                  <a
                    href="https://apps.apple.com/app/whispr-pro/id6504226219"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Get Whispr Pro (free version works great)
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'ready':
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-7xl mb-4"
            >
              🚀
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
              Start by defining your <strong>mission</strong> — your life&apos;s purpose.
              Then dump your thoughts and watch them organize themselves.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <span>1.</span>
                <span>Tap the mission bar to set your purpose</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>2.</span>
                <span>Use Quick Dump to capture thoughts</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>3.</span>
                <span>Explore the tabs to see organized items</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Skip button */}
          {currentStep < STEPS.length - 1 && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip
            </button>
          )}

          {/* Content */}
          <div className="px-8 pt-12 pb-8">
            {/* Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {STEPS[currentStep].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-[300px] flex items-center"
              >
                <div className="w-full">{renderStepContent()}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                currentStep === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Back
            </button>

            {/* Step indicators */}
            <div className="flex gap-2">
              {STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-500 w-6'
                      : index < currentStep
                      ? 'bg-blue-300 dark:bg-blue-700'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/25"
            >
              {currentStep === STEPS.length - 1 ? "Let's Go!" : 'Next'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
