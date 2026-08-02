import type { StyleConfigInput } from "./types";

export { buildDefaultStyleConfig, GRADIENT_PRESETS, SLIDE_SIZE_PRESETS } from "./style-presets";

/** @deprecated Use buildDefaultStyleConfig() for fresh defaults with gradient preset */
export const DEFAULT_STYLE_CONFIG: StyleConfigInput = {
  mode: "GROUPED",
  questionsPerSlide: 5,
  slideWidth: 1080,
  slideHeight: 1080,
  bgColor: null,
  bgGradient: {
    type: "linear",
    angle: 160,
    stops: [
      { color: "#f0f7ff", offset: 0 },
      { color: "#dce8f5", offset: 0.55 },
      { color: "#c5d9ef", offset: 1 },
    ],
  },
  textColor: "#0a1a2e",
  textSize: 28,
  showOptions: true,
  showAnswer: true,
  showExplanation: true,
};
