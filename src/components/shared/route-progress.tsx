"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A thin top-of-page progress bar that animates during route transitions.
 * Provides visual feedback for smooth navigation experience.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // Route changed - animate to complete via timeout (not synchronous setState)
      prevPathname.current = pathname;
      if (timerRef.current) clearInterval(timerRef.current);

      const completeTimeout = setTimeout(() => {
        setProgress(100);
        const hideTimeout = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
        return () => clearTimeout(hideTimeout);
      }, 0);

      return () => clearTimeout(completeTimeout);
    }
  }, [pathname]);

  useEffect(() => {
    // Intercept link clicks to start progress bar
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      if (href === pathname) return;

      setVisible(true);
      setProgress(20);

      // Animate progress
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-primary/20"
      role="progressbar"
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
