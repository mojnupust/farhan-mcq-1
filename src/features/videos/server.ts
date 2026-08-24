import { categoryLabel } from "./constants";
import type { PaginatedVideos, Video, VideoFilter } from "./types";

export const VIDEO_SITE_ORIGIN = "https://farhanmcq.com";
const VIDEO_REVALIDATE_SECONDS = 1800;

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

function buildListQuery(filter?: VideoFilter): string {
  if (!filter) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : "";
}

async function jsonGet(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: VIDEO_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function parsePaginated(json: unknown): PaginatedVideos | null {
  if (!json || typeof json !== "object") return null;
  const root = json as Record<string, unknown>;
  const inner =
    root.data &&
    typeof root.data === "object" &&
    !Array.isArray(root.data) &&
    "data" in (root.data as object)
      ? (root.data as Record<string, unknown>)
      : root;
  const data = inner.data;
  if (!Array.isArray(data)) return null;
  return {
    data: data as Video[],
    total: Number(inner.total ?? data.length),
    page: Number(inner.page ?? 1),
    limit: Number(inner.limit ?? data.length),
    totalPages: Number(inner.totalPages ?? 1),
  };
}

function unwrapData<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  if ("data" in json) {
    const data = (json as { data: T | null }).data;
    return data ?? null;
  }
  return json as T;
}

export async function fetchPublicVideos(
  filter?: VideoFilter,
): Promise<PaginatedVideos> {
  const json = await jsonGet(`/v1/videos${buildListQuery(filter)}`);
  return (
    parsePaginated(json) ?? {
      data: [],
      total: 0,
      page: 1,
      limit: filter?.limit ?? 12,
      totalPages: 1,
    }
  );
}

export async function fetchFeaturedVideos(): Promise<Video[]> {
  const json = await jsonGet("/v1/videos/featured");
  const data = unwrapData<Video[]>(json);
  return Array.isArray(data) ? data : [];
}

export async function fetchPublicVideoById(id: string): Promise<Video | null> {
  const json = await jsonGet(`/v1/videos/${id}`);
  return unwrapData<Video>(json);
}

export interface VideoSitemapEntry {
  id: string;
  updatedAt?: string;
}

export async function fetchVideoSitemapEntries(): Promise<VideoSitemapEntry[]> {
  const dedicated = await jsonGet("/v1/videos/sitemap");
  const dedicatedList = unwrapData<VideoSitemapEntry[]>(dedicated);
  if (Array.isArray(dedicatedList) && dedicatedList.length > 0) {
    return dedicatedList.filter((v) => v?.id);
  }

  const all: VideoSitemapEntry[] = [];
  for (let page = 1; page <= 50; page++) {
    const result = await fetchPublicVideos({
      page,
      limit: 100,
      sort: "newest",
    });
    if (!result.data.length) break;
    for (const video of result.data) {
      all.push({ id: video.id, updatedAt: video.updatedAt });
    }
    if (page >= result.totalPages) break;
  }
  return all;
}

export function videoCanonicalUrl(id: string): string {
  return `${VIDEO_SITE_ORIGIN}/videos/${id}`;
}

export function videoSeoDescription(video: Video): string {
  const cat = categoryLabel(video.category);
  const bits = [
    video.description?.trim(),
    `${cat} প্রস্তুতির ভিডিও লেকচার`,
  ].filter(Boolean);
  if (video.description?.trim()) {
    const d = video.description.trim();
    return d.length > 160 ? `${d.slice(0, 157)}…` : d;
  }
  return `${video.title} — ${cat} পরীক্ষার প্রস্তুতির ভিডিও লেকচার | Farhan MCQ`;
}

export function isoDuration(seconds: number | null): string | undefined {
  if (seconds == null || seconds <= 0) return undefined;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `PT${h}H${m}M${s}S`;
  if (m > 0) return `PT${m}M${s}S`;
  return `PT${s}S`;
}
