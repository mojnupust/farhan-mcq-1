import { getServerApiBase } from "@/lib/server-api-base";
import type { PublicQuestionDto } from "./types";

export const QUESTION_SITE_ORIGIN = "https://www.farhanmcq.com";

export function publicMcqPath(slug: string): string {
  return `/mcq/${slug}`;
}

export function publicMcqUrl(slug: string): string {
  return `${QUESTION_SITE_ORIGIN}/mcq/${slug}`;
}

function unwrapData<T>(json: unknown): T | null {
  if (!json || typeof json !== "object") return null;
  if ("data" in json) {
    const data = (json as { data: T | null }).data;
    return data ?? null;
  }
  return json as T;
}

export async function fetchPublicQuestionBySlug(
  slug: string,
): Promise<PublicQuestionDto | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch(
      `${getServerApiBase()}/v1/question-sets/public/question/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 3600 },
        headers: { Accept: "application/json" },
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const question = unwrapData<PublicQuestionDto>(await res.json());
    if (!question?.slug || !question.questionText) return null;
    return question;
  } catch {
    return null;
  }
}
