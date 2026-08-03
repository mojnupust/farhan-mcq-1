import type { VideoCategory } from "./types";

export const VIDEO_CATEGORIES: {
  value: VideoCategory;
  label: string;
  emoji: string;
}[] = [
  { value: "BCS", label: "বিসিএস", emoji: "🏛️" },
  { value: "PRIMARY", label: "প্রাথমিক", emoji: "📚" },
  { value: "BANK", label: "ব্যাংক", emoji: "🏦" },
  { value: "SCHOOL", label: "স্কুল", emoji: "🎓" },
  { value: "COLLEGE", label: "কলেজ", emoji: "🎓" },
  { value: "NTRCA", label: "এনটিআরসিএ", emoji: "👨‍🏫" },
  { value: "SOMAJSEBA", label: "সমাজসেবা", emoji: "🤝" },
  { value: "COMPUTER_OPERATOR", label: "কম্পিউটার অপারেটর", emoji: "💻" },
  { value: "POLICE", label: "পুলিশ", emoji: "🚔" },
  { value: "DEFENCE", label: "প্রতিরক্ষা", emoji: "🛡️" },
  { value: "RAILWAY", label: "রেলওয়ে", emoji: "🚂" },
  { value: "HEALTH", label: "স্বাস্থ্য", emoji: "🏥" },
  { value: "OTHER", label: "অন্যান্য", emoji: "📌" },
];

export const VIDEO_SORT_OPTIONS = [
  { value: "newest" as const, label: "নতুন প্রথমে" },
  { value: "popular" as const, label: "সবচেয়ে দেখা" },
  { value: "most_liked" as const, label: "সবচেয়ে পছন্দ" },
];

export function categoryLabel(cat: VideoCategory): string {
  return VIDEO_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "আজ";
  if (days === 1) return "গতকাল";
  if (days < 30) return `${days} দিন আগে`;
  if (days < 365) return `${Math.floor(days / 30)} মাস আগে`;
  return `${Math.floor(days / 365)} বছর আগে`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
