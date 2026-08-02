import { apiSlideService } from "./services/slide.api";
import { mockSlideService } from "./services/slide.mock";
import type { SlideService } from "./services/slide.service";

export const slideService: SlideService =
  process.env.USE_MOCKS === "true" ? mockSlideService : apiSlideService;

export type { SlideService } from "./services/slide.service";
export { buildDefaultStyleConfig } from "./style-presets";
export * from "./default-style";
export * from "./types";
