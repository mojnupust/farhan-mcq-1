"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { gradientCss } from "../style-presets";
import type { Scene } from "../types";
import { extractSlidePreviewLines } from "../utils/slide-text";

interface SlideTextPreviewProps {
  scene: Scene;
  className?: string;
}

/** Browser-rendered fallback preview — Hind Siliguri covers Bengali and Latin glyphs. */
export function SlideTextPreview({ scene, className }: SlideTextPreviewProps) {
  const lines = useMemo(() => extractSlidePreviewLines(scene), [scene]);

  const backgroundStyle = scene.background.gradient
    ? { background: gradientCss(scene.background.gradient) }
    : { backgroundColor: scene.background.color ?? "#ffffff" };

  if (lines.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-3 font-slide-mixed text-xs text-muted-foreground",
          className,
        )}
        style={backgroundStyle}
        lang="bn"
      >
        প্রিভিউ উপলব্ধ নয়
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col gap-1 overflow-hidden p-3 font-slide-mixed text-[11px] leading-snug sm:text-xs sm:leading-relaxed",
        className,
      )}
      style={backgroundStyle}
      lang="bn"
      aria-label="স্লাইড টেক্সট প্রিভিউ"
    >
      {lines.map((line) => (
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
      ))}
    </div>
  );
}
