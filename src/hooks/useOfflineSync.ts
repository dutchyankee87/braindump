'use client';

import { useEffect, useCallback, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { syncOfflineDumps, getUnsyncedDumps } from '@/lib/offline';

export function useOfflineSync(onSyncComplete?: () => void) {
  const { isSignedIn } = useUser();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkPending = useCallback(async () => {
    try {
      const unsynced = await getUnsyncedDumps();
      setPendingCount(unsynced.length);
    } catch (error) {
      console.error('Failed to check pending dumps:', error);
    }
  }, []);

  const sync = useCallback(async () => {
    if (isSyncing || !isSignedIn) return;

    setIsSyncing(true);
    try {
      const result = await syncOfflineDumps();
      if (result.synced > 0) {
        onSyncComplete?.();
      }
      await checkPending();
    } catch (error) {
      console.error('Failed to sync:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isSignedIn, onSyncComplete, checkPending]);

  useEffect(() => {
    checkPending();

    const handleOnline = () => {
      sync();
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      sync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [sync, checkPending]);

  return { pendingCount, isSyncing, sync };
}
