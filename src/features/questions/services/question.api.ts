import { apiClient } from "@/lib/api-client";
import type { PublicQuestionDto, Question } from "../types";
import type { QuestionService } from "./question.service";

export const apiQuestionService: QuestionService = {
  async getAll() {
    return apiClient.get<Question[]>("/admin/questions");
  },
  async answer(id, text) {
    return apiClient.post<Question>(`/admin/questions/${id}/answer`, { text });
  },
};

/**
 * Fetches a single public question by slug for the SEO page.
 * Uses raw fetch (not apiClient) so it works in Next.js server components with ISR.
 */
export async function getPublicQuestion(
  slug: string,
): Promise<PublicQuestionDto | null> {
  // NEXT_PUBLIC_API_URL already ends with "/api" (e.g. "http://localhost:3002/api"),
  // so we append the versioned path directly without repeating "/api".
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (!apiUrl) return null;

  const res = await fetch(
    `${apiUrl}/v1/question-sets/public/question/${slug}`,
    {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch question: ${res.status}`);

  const json = (await res.json()) as { data: PublicQuestionDto };
  return json.data;
}
