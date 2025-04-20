import { useState, useEffect, useCallback } from 'react';
import Dexie from 'dexie';
import { API_URL } from '../lib/constants';

// Define the database schema
class OfflineDB extends Dexie {
  offlineEdits: Dexie.Table<{
    id?: number;
    url: string;
    method: string;
    data: any;
    timestamp: number;
    synced: boolean;
  }, number>;

  constructor() {
    super('AutoDraftOfflineDB');
    this.version(1).stores({
      offlineEdits: '++id, url, method, timestamp, synced',
    });
  }
}

interface OfflineEdit {
  id?: number;
  url: string;
  method: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [db] = useState(() => new OfflineDB());

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await db.offlineEdits.where('synced').equals(false).count();
      setPendingCount(count);
    };

    updatePendingCount();
  }, [db]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncOfflineEdits();
    }
  }, [isOnline, pendingCount]);

  const addToQueue = useCallback(async (url: string, method: string, data: any) => {
    const edit: OfflineEdit = {
      url,
      method,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    await db.offlineEdits.add(edit);
    setPendingCount((prev) => prev + 1);
  }, [db]);

  const syncOfflineEdits = useCallback(async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const unsyncedEdits = await db.offlineEdits.where('synced').equals(false).toArray();
      
      for (const edit of unsyncedEdits) {
        try {
          const fullUrl = edit.url.startsWith('http') ? edit.url : `${API_URL}${edit.url}`;
          
          const response = await fetch(fullUrl, {
            method: edit.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(edit.data),
            credentials: 'include',
          });
          
          if (response.ok) {
            await db.offlineEdits.update(edit.id!, { synced: true });
            setPendingCount((prev) => Math.max(0, prev - 1));
          }
        } catch (error) {
          console.error('Failed to sync edit:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline edits:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, db]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    addToQueue,
    syncOfflineEdits,
  };
}; 