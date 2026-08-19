import type { PdfDocType, PdfFilter } from "./types";

export const PDF_DOC_TYPES: {
  value: PdfDocType;
  label: string;
  emoji: string;
}[] = [
  { value: "SYLLABUS", label: "সিলেবাস", emoji: "📘" },
  { value: "ROUTINE", label: "রুটিন", emoji: "🗓️" },
  { value: "QUESTION_BANK", label: "প্রশ্নব্যাংক", emoji: "📝" },
  { value: "PREVIOUS_QUESTIONS", label: "বিগত প্রশ্ন সমাধান", emoji: "📚" },
  { value: "BOOK_GUIDE", label: "বই / গাইড", emoji: "📖" },
  { value: "NOTES", label: "রিভিশন নোট", emoji: "🗒️" },
  { value: "MODEL_TEST", label: "মডেল টেস্ট", emoji: "✅" },
  { value: "OTHER", label: "অন্যান্য", emoji: "📄" },
];

export const PDF_SORT_OPTIONS: {
  value: NonNullable<PdfFilter["sort"]>;
  label: string;
}[] = [
  { value: "newest", label: "নতুন আগে" },
  { value: "popular", label: "জনপ্রিয়" },
  { value: "most_downloaded", label: "সর্বাধিক ডাউনলোড" },
  { value: "most_viewed", label: "সর্বাধিক দেখা" },
];

export function docTypeLabel(value: PdfDocType): string {
  return PDF_DOC_TYPES.find((c) => c.value === value)?.label ?? value;
}

export function subExamCategoryLabel(
  id?: string | null,
  categories: { id: string; name: string }[] = [],
): string {
  if (!id) return "সাধারণ (কোনো নির্দিষ্ট বিভাগ নয়)";
  return categories.find((c) => c.id === id)?.name ?? "অজানা বিভাগ";
}

export function formatFileSize(kb?: number): string {
  if (!kb) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function formatCount(n: number): string {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "এইমাত্র";
  if (diffMin < 60) return `${diffMin} মিনিট আগে`;
  if (diffHour < 24) return `${diffHour} ঘণ্টা আগে`;
  if (diffDay < 30) return `${diffDay} দিন আগে`;
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Very small client-side sanity check — this is not a real link
// verification call (no backend yet), just enough to catch obvious typos
// before saving.
export function looksLikeFileUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
