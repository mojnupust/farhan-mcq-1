import type { DocxStyleConfigInput } from "./types";

export function buildDefaultDocxStyleConfig(): DocxStyleConfigInput {
  return {
    templateStyle: "COLORFUL",
    columnCount: 1,
    fontSizePt: null,
    fontBn: "Kalpurush",
    brandName: "Farhan MCQ",
    brandSubtitle: "farhanmcq.com",
    footerText: "নিয়মিত অনুশীলন করতে ফলো করুন — Farhan MCQ",
    showExplanation: false,
    explanationMaxChars: 400,
    siteBaseUrl: "https://farhanmcq.com",
  };
}

export const TEMPLATE_STYLE_OPTIONS = [
  { id: "COLORFUL" as const, label: "রঙিন (COLORFUL)" },
  { id: "PLAIN" as const, label: "সাদা-কালো (PLAIN)" },
];

export const COLUMN_OPTIONS = [
  { value: 1 as const, label: "১ কলাম" },
  { value: 2 as const, label: "২ কলাম" },
];

export const FONT_OPTIONS = [
  { value: "Kalpurush", label: "Kalpurush" },
  { value: "Noto Sans Bengali", label: "Noto Sans Bengali" },
];
