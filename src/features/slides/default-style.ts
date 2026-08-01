import type { StyleConfigInput } from "./types";

// Phase 5 replaces this with a full customization panel — until then, Generate uses this
// so a member can go from question-set selection straight to slides with zero configuration.
export const DEFAULT_STYLE_CONFIG: StyleConfigInput = {
  mode: "GROUPED",
  questionsPerSlide: 5,
  slideWidth: 1080,
  slideHeight: 1080,
  bgColor: "#ffffff",
  bgGradient: null,
  textColor: "#0a1a2e",
  textSize: 28,
  showOptions: true,
  showAnswer: true,
  showExplanation: true,
};
