import { apiPdfService } from "./services/pdf.api";

// video-র features/videos/index.ts-এর মতো mock/real সুইচ নেই — pdf.mock.ts আর
// এই ফিচারে নেই (পুরোপুরি real backend-driven), তাই সরাসরি apiPdfService export
// করা হচ্ছে।
export const pdfService = apiPdfService;

export * from "./constants";
export type { PdfService } from "./services/pdf.service";
export * from "./types";
