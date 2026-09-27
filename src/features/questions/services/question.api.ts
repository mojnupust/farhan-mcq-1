import { apiClient } from "@/lib/api-client";
import { fetchPublicQuestionBySlug } from "../server";
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
 * Uses an absolute API origin so Next.js Server Components can resolve it
 * when NEXT_PUBLIC_API_URL is the browser proxy path `/api`.
 */
export async function getPublicQuestion(
  slug: string,
): Promise<PublicQuestionDto | null> {
  return fetchPublicQuestionBySlug(slug);
}
