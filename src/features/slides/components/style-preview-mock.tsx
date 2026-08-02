"use client";

import { cn } from "@/lib/utils";

import { gradientCss } from "../style-presets";
import type { StyleConfigInput } from "../types";

interface StylePreviewMockProps {
  style: StyleConfigInput;
  className?: string;
}

// Lightweight SVG mock — updates instantly as the member tweaks style (no backend call).
export function StylePreviewMock({ style, className }: StylePreviewMockProps) {
  const bgStyle = style.bgGradient
    ? { background: gradientCss(style.bgGradient) }
    : { backgroundColor: style.bgColor ?? "#ffffff" };

  const aspect =
    style.slideWidth >= style.slideHeight
      ? "aspect-[4/3]"
      : style.slideHeight / style.slideWidth > 1.5
        ? "aspect-[9/16]"
        : "aspect-square";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border shadow-sm",
        aspect,
        className,
      )}
      style={bgStyle}
    >
      <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden>
        <rect x="0" y="0" width="200" height="28" fill="#0f1b35" />
        <text x="100" y="19" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
          Farhan MCQ
        </text>
        <text x="12" y="48" fill={style.textColor} fontSize={style.textSize * 0.35} fontWeight="bold">
          ১। নমুনা প্রশ্ন — স্টাইল প্রিভিউ
        </text>
        {style.showOptions && (
          <>
            <text x="12" y="68" fill={style.textColor} fontSize={style.textSize * 0.28}>
              (ক) প্রথম অপশন
            </text>
            <text x="12" y="84" fill={style.textColor} fontSize={style.textSize * 0.28}>
              (খ) দ্বিতীয় অপশন
            </text>
          </>
        )}
        {style.showAnswer && (
          <rect x="8" y="92" width="90" height="18" rx="4" fill="#e8f5ee" />
        )}
        {style.showAnswer && (
          <text x="12" y="105" fill="#0a2210" fontSize={style.textSize * 0.26} fontWeight="bold">
            (গ) ✓ সঠিক
          </text>
        )}
        {style.showExplanation && (
          <text x="12" y="125" fill={style.textColor} fontSize={style.textSize * 0.22} opacity={0.85}>
            ব্যাখ্যা: সংক্ষিপ্ত উদাহরণ…
          </text>
        )}
        <rect x="0" y="128" width="200" height="12" fill="#0f1b35" opacity={0.9} />
      </svg>
    </div>
  );
}
