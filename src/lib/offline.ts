import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

interface OfflineDump {
  id: string;
  userId?: string;
  content: string;
  imageData?: string;
  createdAt: Date;
  synced: boolean;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB('brain-dump-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('offlineDumps', { keyPath: 'id' });
        store.createIndex('by-synced', 'synced');
      },
    });
  }
  return dbPromise;
}

export async function saveOfflineDump(
  content: string,
  imageData?: string,
  userId?: string
): Promise<OfflineDump> {
  const db = await getDB();
  const dump: OfflineDump = {
    id: uuidv4(),
    userId,
    content,
    imageData,
    createdAt: new Date(),
    synced: false,
  };
  await db.put('offlineDumps', dump);
  return dump;
}

export async function getUnsyncedDumps(): Promise<OfflineDump[]> {
  const db = await getDB();
  const tx = db.transaction('offlineDumps', 'readonly');
  const store = tx.objectStore('offlineDumps');
  const allDumps = await store.getAll();
  return allDumps.filter((dump: OfflineDump) => !dump.synced);
}

export async function markDumpSynced(id: string): Promise<void> {
  const db = await getDB();
  const dump = await db.get('offlineDumps', id);
  if (dump) {
    dump.synced = true;
    await db.put('offlineDumps', dump);
  }
}

export async function deleteOfflineDump(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offlineDumps', id);
}

export async function syncOfflineDumps(): Promise<{
  synced: number;
  failed: number;
}> {
  const unsyncedDumps = await getUnsyncedDumps();
  let synced = 0;
  let failed = 0;

  for (const dump of unsyncedDumps) {
    try {
      const response = await fetch('/api/dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: dump.content,
          imageUrl: null,
        }),
      });

      if (response.ok) {
        await deleteOfflineDump(dump.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}
