import { getServerApiBase } from "@/lib/server-api-base";
import type { SyllabusWithCategory } from "./types";
import { syllabusPlainText } from "./content";

export const SYLLABUS_SITE_ORIGIN = "https://farhanmcq.com";
const SYLLABUS_REVALIDATE_SECONDS = 1800;

async function jsonGet(path: string): Promise<unknown | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(`${getServerApiBase()}${path}`, {
      next: { revalidate: SYLLABUS_REVALIDATE_SECONDS },
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

function unwrapData<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  if ("data" in json) {
    const data = (json as { data: T | null }).data;
    return data ?? null;
  }
  return json as T;
}

function asSyllabus(raw: unknown): SyllabusWithCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as SyllabusWithCategory;
  if (!s.slug || !s.title || s.isActive === false) return null;
  return s;
}

export async function fetchPublicSyllabusBySlug(
  slug: string,
): Promise<SyllabusWithCategory | null> {
  const json = await jsonGet(
    `/v1/syllabuses/detail/${encodeURIComponent(slug)}`,
  );
  return asSyllabus(unwrapData<SyllabusWithCategory>(json));
}

export async function fetchPublicSyllabuses(): Promise<SyllabusWithCategory[]> {
  const json = await jsonGet("/v1/syllabuses");
  const data = unwrapData<SyllabusWithCategory[]>(json);
  return Array.isArray(data) ? data.filter((s) => s?.slug && s.isActive !== false) : [];
}

export function syllabusCanonicalUrl(slug: string): string {
  return `${SYLLABUS_SITE_ORIGIN}/syllabus/${slug}`;
}

export function syllabusSeoDescription(syllabus: SyllabusWithCategory): string {
  const cat = syllabus.subExamCategoryName;
  const plain = syllabusPlainText(syllabus.content, syllabus.contentType);
  if (plain.length > 40) {
    return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
  }
  const subject = cat || "সরকারি চাকরি";
  return `${syllabus.title} — ${subject} পরীক্ষার সম্পূর্ণ সিলেবাস ও পাঠ্যক্রম | Farhan MCQ`;
}
