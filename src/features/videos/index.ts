import { apiVideoService } from "./services/video.api";
import { mockVideoService } from "./services/video.mock";

export const videoService =
  process.env.USE_MOCKS === "true" ? mockVideoService : apiVideoService;

export type { VideoService } from "./services/video.service";
export * from "./types";
export * from "./constants";
