'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { uploadImage } from '@/lib/supabase';
import { saveOfflineDump, isOnline } from '@/lib/offline';

interface QuickDumpProps {
  onDumpComplete: () => void;
}

const PROMPTS = [
  "What's alive in you right now?",
  "Capture the moment...",
  "What wants to be expressed?",
  "Download your thoughts...",
  "What's on your mind?",
  "Let it flow...",
];

export default function QuickDump({ onDumpComplete }: QuickDumpProps) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Rotate prompts
  useEffect(() => {
    if (!isExpanded) {
      const interval = setInterval(() => {
        setCurrentPrompt((prev) => (prev + 1) % PROMPTS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setContent('');
    removeImage();
    setIsExpanded(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !imageFile) {
      setError('Please enter some text or add an image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!online) {
        await saveOfflineDump(content.trim(), imagePreview || undefined, user?.id);
        resetForm();
        onDumpComplete();
        return;
      }

      let imageUrl: string | null = null;

      if (imageFile && user?.id) {
        imageUrl = await uploadImage(imageFile, user.id);
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const response = await fetch('/api/dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create dump');
      }

      resetForm();
      onDumpComplete();
    } catch (err) {
      if (!online) {
        await saveOfflineDump(content.trim(), imagePreview || undefined, user?.id);
        resetForm();
        onDumpComplete();
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      if (!content.trim() && !imageFile) {
        setIsExpanded(false);
      }
    }
  };

  return (
    <motion.div
      layout
      className={`relative rounded-2xl border transition-all duration-300 ${
        isExpanded
          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg'
          : 'glass border-blue-200/50 dark:border-blue-700/50 breathing cursor-pointer'
      }`}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Collapsed state - meditative prompt
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center gap-3 p-6 text-center"
          >
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl"
            >
              ✨
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPrompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-500 dark:text-gray-400 text-lg"
              >
                {PROMPTS[currentPrompt]}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        ) : (
          // Expanded state - full form
          <motion.form
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="p-5 space-y-4"
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Let your thoughts flow freely... (Cmd+Enter to submit)"
              className="w-full min-h-[120px] p-0 bg-transparent text-gray-900 dark:text-gray-100
                         placeholder-gray-400 resize-none focus:outline-none text-lg leading-relaxed"
              disabled={isLoading}
            />

            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative inline-block"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 rounded-xl object-cover shadow-md"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                               flex items-center justify-center hover:bg-red-600 text-sm shadow-md"
                    disabled={isLoading}
                  >
                    ×
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="quick-image-upload"
                  disabled={isLoading || !online}
                />
                <motion.label
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  htmlFor="quick-image-upload"
                  className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    isLoading || !online ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={online ? 'Add image' : 'Images disabled offline'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </motion.label>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    if (!content.trim() && !imageFile) {
                      setIsExpanded(false);
                    } else {
                      resetForm();
                    }
                  }}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Cancel"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || (!content.trim() && !imageFile)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600
                           text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {isLoading ? (
                  <>
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </motion.svg>
                    Processing...
                  </>
                ) : !online ? (
                  'Save Offline'
                ) : (
                  <>
                    <span>Dump</span>
                    <span className="text-blue-200">↵</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
