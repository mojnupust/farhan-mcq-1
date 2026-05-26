"use client";

import { useAppStore } from "@/lib/store";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const cachedData = getCached<T>(key);
  const [data, setData] = useState<T | null>(cachedData);
  const [isLoading, setIsLoading] = useState(!cachedData && !skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setIsLoading((prev) => (data === null ? true : prev));
      const result = await fetcherRef.current();
      setData(result);
      setCache(key, result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Fetch failed"));
    } finally {
      setIsLoading(false);
    }
  }, [key, setCache, data]);

  useEffect(() => {
    if (skip) return;
    fetchData();
  }, [key, skip, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

