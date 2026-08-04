"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { gradientCss } from "../style-presets";
import type { Scene } from "../types";
import {
  extractSlideChrome,
  extractSlidePreviewLines,
} from "../utils/slide-text";

interface SlideTextPreviewProps {
  scene: Scene;
  className?: string;
}

const BRAND_NAVY = "#0f1b35";

/** Browser-rendered fallback preview — matches PNG chrome (header/footer) + content text. */
export function SlideTextPreview({ scene, className }: SlideTextPreviewProps) {
  const lines = useMemo(() => extractSlidePreviewLines(scene), [scene]);
  const chrome = useMemo(() => extractSlideChrome(scene), [scene]);

  const backgroundStyle = scene.background.gradient
    ? { background: gradientCss(scene.background.gradient) }
    : { backgroundColor: scene.background.color ?? "#ffffff" };

  const headerScale = chrome ? Math.min(1, chrome.headerHeight / 70) : 1;
  const footerScale = chrome ? Math.min(1, chrome.footerHeight / 46) : 1;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden font-slide-mixed",
        className,
      )}
      style={backgroundStyle}
      lang="bn"
      aria-label="স্লাইড টেক্সট প্রিভিউ"
    >
      {chrome ? (
        <div
          className="flex shrink-0 items-center justify-between px-2 text-white"
          style={{
            backgroundColor: BRAND_NAVY,
            minHeight: `${Math.max(28, chrome.headerHeight * 0.45)}px`,
            fontSize: `${Math.max(9, 11 * headerScale)}px`,
          }}
        >
          <span className="truncate font-semibold">{chrome.headerTitle}</span>
          {chrome.headerCount ? (
            <span className="ml-2 shrink-0 opacity-90">{chrome.headerCount}</span>
          ) : null}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden p-3 text-[11px] leading-snug sm:text-xs sm:leading-relaxed">
        {lines.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            প্রিভিউ উপলব্ধ নয়
          </p>
        ) : (
          lines.map((line) => (
            <p
              key={line.id}
              className={cn(
                "line-clamp-3 break-words",
                line.bold && "font-semibold",
              )}
              style={{ color: line.color }}
            >
              {line.text}
            </p>
          ))
        )}
      </div>

      {chrome ? (
        <div
          className="flex shrink-0 items-center justify-center px-2 text-center text-white"
          style={{
            backgroundColor: BRAND_NAVY,
            minHeight: `${Math.max(22, chrome.footerHeight * 0.45)}px`,
            fontSize: `${Math.max(8, 10 * footerScale)}px`,
          }}
        >
          <span className="line-clamp-1">{chrome.footerText}</span>
        </div>
      ) : null}
    </div>
  );
}
