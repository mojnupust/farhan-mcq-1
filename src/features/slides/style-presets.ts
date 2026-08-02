import type { BgGradient, StyleConfigInput } from "./types";

export interface GradientPreset {
  id: string;
  label: string;
  gradient: BgGradient;
}

export interface SlideSizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "sky",
    label: "আকাশ নীল",
    gradient: {
      type: "linear",
      angle: 160,
      stops: [
        { color: "#f0f7ff", offset: 0 },
        { color: "#dce8f5", offset: 0.55 },
        { color: "#c5d9ef", offset: 1 },
      ],
    },
  },
  {
    id: "navy-gold",
    label: "নেভি ও সোনালি",
    gradient: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#0f1b35", offset: 0 },
        { color: "#1a3050", offset: 0.6 },
        { color: "#2a4468", offset: 1 },
      ],
    },
  },
  {
    id: "sunset",
    label: "সূর্যাস্ত",
    gradient: {
      type: "linear",
      angle: 120,
      stops: [
        { color: "#fff5eb", offset: 0 },
        { color: "#ffd6a5", offset: 0.5 },
        { color: "#ff9f7a", offset: 1 },
      ],
    },
  },
  {
    id: "mint",
    label: "মিন্ট সবুজ",
    gradient: {
      type: "linear",
      angle: 145,
      stops: [
        { color: "#f0fdf4", offset: 0 },
        { color: "#bbf7d0", offset: 0.55 },
        { color: "#86efac", offset: 1 },
      ],
    },
  },
  {
    id: "lavender",
    label: "ল্যাভেন্ডার",
    gradient: {
      type: "linear",
      angle: 150,
      stops: [
        { color: "#faf5ff", offset: 0 },
        { color: "#e9d5ff", offset: 0.55 },
        { color: "#d8b4fe", offset: 1 },
      ],
    },
  },
  {
    id: "slate",
    label: "স্লেট ধূসর",
    gradient: {
      type: "linear",
      angle: 180,
      stops: [
        { color: "#f8fafc", offset: 0 },
        { color: "#e2e8f0", offset: 0.5 },
        { color: "#cbd5e1", offset: 1 },
      ],
    },
  },
];

export const SLIDE_SIZE_PRESETS: SlideSizePreset[] = [
  { id: "ig-post", label: "IG পোস্ট", width: 1080, height: 1080 },
  { id: "fb-post", label: "FB পোস্ট", width: 1200, height: 630 },
  { id: "ig-story", label: "IG স্টোরি", width: 1080, height: 1920 },
];

export const DEFAULT_GRADIENT_PRESET_ID = "sky";

export function gradientCss(gradient: BgGradient): string {
  const stops = gradient.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(", ");
  if (gradient.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }
  return `linear-gradient(${gradient.angle ?? 135}deg, ${stops})`;
}

export function buildDefaultStyleConfig(): StyleConfigInput {
  const preset = GRADIENT_PRESETS.find((p) => p.id === DEFAULT_GRADIENT_PRESET_ID)!;
  const isDark = preset.id === "navy-gold";
  return {
    mode: "GROUPED",
    questionsPerSlide: 5,
    slideWidth: 1080,
    slideHeight: 1080,
    bgColor: null,
    bgGradient: preset.gradient,
    textColor: isDark ? "#f8fafc" : "#0a1a2e",
    textSize: 28,
    showOptions: true,
    showAnswer: true,
    showExplanation: true,
  };
}
