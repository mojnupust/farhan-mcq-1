import type { PaginatedPdfs } from "./services/pdf.service";
import type { PdfDocument, PdfFilter } from "./types";

export const PDF_REVALIDATE_SECONDS = 1800;
export const PDF_SITE_ORIGIN = "https://farhanmcq.com";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

function buildListQuery(filter?: PdfFilter): string {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: PDF_REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function parsePaginated(json: unknown): PaginatedPdfs | null {
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
    data: data as PdfDocument[],
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

export async function fetchPublicPdfs(
  filter?: PdfFilter,
): Promise<PaginatedPdfs> {
  const json = await jsonGet(`/v1/pdfs${buildListQuery(filter)}`);
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

export async function fetchFeaturedPdfs(): Promise<PdfDocument[]> {
  const json = await jsonGet("/v1/pdfs/featured");
  const data = unwrapData<PdfDocument[]>(json);
  return Array.isArray(data) ? data : [];
}

export async function fetchPublicPdfById(
  id: string,
): Promise<PdfDocument | null> {
  const json = await jsonGet(`/v1/pdfs/${id}`);
  return unwrapData<PdfDocument>(json);
}

export interface PdfSitemapEntry {
  id: string;
  updatedAt?: string;
}

export async function fetchPdfSitemapEntries(): Promise<PdfSitemapEntry[]> {
  const dedicated = await jsonGet("/v1/pdfs/sitemap");
  const dedicatedList = unwrapData<PdfSitemapEntry[]>(dedicated);
  if (Array.isArray(dedicatedList) && dedicatedList.length > 0) {
    return dedicatedList.filter((p) => p?.id);
  }

  const all: PdfSitemapEntry[] = [];
  for (let page = 1; page <= 5; page++) {
    const result = await fetchPublicPdfs({ page, limit: 100, sort: "newest" });
    if (!result.data.length) break;
    for (const pdf of result.data) {
      all.push({ id: pdf.id, updatedAt: pdf.updatedAt });
    }
    if (page >= result.totalPages) break;
  }
  return all;
}

export function pdfCanonicalUrl(id: string): string {
  return `${PDF_SITE_ORIGIN}/pdf-library/${id}`;
}

export function pdfSeoDescription(pdf: PdfDocument): string {
  const bits = [
    pdf.description?.trim(),
    pdf.examName ? `${pdf.examName} পরীক্ষার প্রস্তুতি` : null,
    pdf.subject ? `বিষয়: ${pdf.subject}` : null,
    pdf.pageCount ? `${pdf.pageCount} পৃষ্ঠার PDF` : null,
  ].filter(Boolean);
  if (bits.length > 0) {
    return `${bits.join(" — ")} | Farhan MCQ থেকে ডাউনলোড করুন।`;
  }
  return `${pdf.title} PDF ডাউনলোড — BCS, NTRCA, ব্যাংক ও সরকারি চাকরির প্রস্তুতির জন্য Farhan MCQ।`;
}
