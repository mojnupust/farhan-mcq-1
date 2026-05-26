import { create } from "zustand";

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

interface AppState {
  cache: Record<string, CacheEntry>;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration: number;

  /** Get cached data if still valid */
  getCached: <T>(key: string) => T | null;

  /** Set data in cache */
  setCache: <T>(key: string, data: T) => void;

  /** Invalidate a specific cache key */
  invalidateCache: (key: string) => void;

  /** Invalidate all cache keys matching a prefix */
  invalidatePrefix: (prefix: string) => void;

  /** Clear all cache */
  clearCache: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  cache: {},
  cacheDuration: 5 * 60 * 1000, // 5 minutes

  getCached: <T>(key: string): T | null => {
    const entry = get().cache[key];
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > get().cacheDuration;
    if (isExpired) {
      // Clean up expired entry
      set((state) => {
        const newCache = { ...state.cache };
        delete newCache[key];
        return { cache: newCache };
      });
      return null;
    }

    return entry.data as T;
  },

  setCache: <T>(key: string, data: T) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [key]: { data, timestamp: Date.now() },
      },
    }));
  },

  invalidateCache: (key: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[key];
      return { cache: newCache };
    });
  },

  invalidatePrefix: (prefix: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      Object.keys(newCache).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete newCache[key];
        }
      });
      return { cache: newCache };
    });
  },

  clearCache: () => {
    set({ cache: {} });
  },
}));
