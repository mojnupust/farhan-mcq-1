"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Prefetches commonly accessed routes on mount for instant navigation.
 * Call this in layout components to warm up the router cache.
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    // Delay prefetching to not compete with initial page load
    const timer = setTimeout(() => {
      routes.forEach((route) => {
        router.prefetch(route);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, routes]);
}
