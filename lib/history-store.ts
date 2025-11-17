// lib/history-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { HistoryStore, ConversionHistoryItem, SharePlatform } from '../types';

// 6 hours in milliseconds
const SIX_HOURS = 6 * 60 * 60 * 1000;

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      addConversion: (item) =>
        set((state) => {
          const newItem: ConversionHistoryItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: Date.now(),
            fileSize: item.output ? `${(item.output.length / 1024).toFixed(1)} KB` : undefined,
          };
          const newHistory = [newItem, ...state.history];
          return { history: newHistory.slice(0, 50) }; // Increased limit for better file management
        }),
      clearHistory: () => set({ history: [] }),
      deleteHistoryItem: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearOldData: () => {
        const now = Date.now();
        set((state) => ({
          history: state.history.filter((item) => now - item.timestamp < SIX_HOURS),
        }));
      },
      updateShareStatus: (id, isShared, shareData) =>
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id
              ? {
                  ...item,
                  isShared,
                  shareLink: shareData?.link,
                  sharePlatform: shareData?.platform,
                  sharedWith: shareData?.sharedWith,
                }
              : item
          ),
        })),
      getAllFiles: () => get().history,
      getSharedFiles: () => get().history.filter((item) => item.isShared),
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'converter-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Auto-clear old data on app load
        if (state) {
          const now = Date.now();
          const filteredHistory = state.history.filter(
            (item) => now - item.timestamp < SIX_HOURS
          );
          state.history = filteredHistory;
          state._hasHydrated = true;
        }
      },
    }
  )
);

// Auto-clear interval (runs every hour to check for old data)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useHistoryStore.getState();
    store.clearOldData();
  }, 60 * 60 * 1000); // Check every hour
}

// Client-side hook for handling hydration
export const useHydratedHistoryStore = () => {
  const hasHydrated = useHistoryStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      const store = useHistoryStore.getState();
      store.setHasHydrated(true);
    }
  }, [hasHydrated]);

  const history = useHistoryStore((state) => state.history);
  return hasHydrated ? history : [];
};
