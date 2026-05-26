"use client";

import { useAppStore } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";

interface UseCachedFetchOptions {
  /** Cache key for this data */
  key: string;
  /** Whether to skip fetching (e.g., when params aren't ready) */
  skip?: boolean;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches data with automatic caching via zustand store.
 * Returns cached data immediately if available, then refreshes in background.
 */
export function useCachedFetch<T>(
  fetcher: () => Promise<T>,
  options: UseCachedFetchOptions,
): UseCachedFetchResult<T> {
  const { key, skip = false } = options;
  const { getCached, setCache } = useAppStore();

  const cachedData = getCached<T>(key);
  const [data, setData] = useState<T | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData && !skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      if (!data) setIsLoading(true);
      const result = await fetcher();
      setData(result);
      setCache(key, result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, skip]);

  useEffect(() => {
    if (skip) return;

    // If we have cached data, show it immediately but still refresh
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      // Background refresh
      fetchData();
    } else {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, skip]);

  return { data, isLoading, error, refetch: fetchData };
}
