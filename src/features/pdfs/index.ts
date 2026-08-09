import { apiPdfService } from "./services/pdf.api";
import { mockPdfService } from "./services/pdf.mock.wrapped"; // নিচের B5a দেখো

export const pdfService =
  process.env.USE_MOCKS === "true" ? mockPdfService : apiPdfService;

export * from "./constants";
export type { PdfService } from "./services/pdf.service";
export * from "./types";
