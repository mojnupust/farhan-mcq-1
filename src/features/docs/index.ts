import { apiDocxService } from "./services/docx.api";

export const docxService = apiDocxService;

export { buildDefaultDocxStyleConfig } from "./style-presets";
export type { DocxService } from "./services/docx.service";
export * from "./types";
