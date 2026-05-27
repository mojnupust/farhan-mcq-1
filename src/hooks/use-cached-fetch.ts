"use client";

import { useAppStore } from "@/lib/store";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseCachedFetchOptions {
  /** Cache key for this data */
  key: string;
  /** Whether to skip fetching (e.g., when params aren't ready) */
  skip?: boolean;
  /** Custom cache duration in ms (default uses store's cacheDuration) */
  cacheDuration?: number;
  /** If true, don't show loading state when refreshing stale data */
  staleWhileRevalidate?: boolean;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Global in-flight request deduplication to prevent duplicate network calls
const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Hook that fetches data with automatic caching via zustand store.
 * Returns cached data immediately if available, then refreshes in background.
 * Deduplicates concurrent requests for the same cache key.
 */
export function useCachedFetch<T>(
  fetcher: () => Promise<T>,
  options: UseCachedFetchOptions,
): UseCachedFetchResult<T> {
  const { key, skip = false, staleWhileRevalidate = true } = options;
  const { getCached, setCache } = useAppStore();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const cachedData = getCached<T>(key);
  const [data, setData] = useState<T | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData && !skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Only show loading if no cached data (stale-while-revalidate)
      if (!staleWhileRevalidate || data === null) {
        setIsLoading(true);
      }

      // Deduplicate concurrent requests for the same key
      let promise = inFlightRequests.get(key) as Promise<T> | undefined;
      if (!promise) {
        promise = fetcherRef.current();
        inFlightRequests.set(key, promise);
        promise.finally(() => inFlightRequests.delete(key));
      }

      const result = await promise;
      setData(result);
      setCache(key, result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"));
    } finally {
      setIsLoading(false);
    }
  }, [key, setCache, data, staleWhileRevalidate]);

  useEffect(() => {
    if (skip) return;
    fetchData();
  }, [key, skip, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

