import { apiQuestionService } from "./services/question.api";
import { mockQuestionService } from "./services/question.mock";
import type { QuestionService } from "./services/question.service";

export const questionService: QuestionService =
  process.env.USE_MOCKS === "true" || !process.env.NEXT_PUBLIC_API_URL
    ? mockQuestionService
    : apiQuestionService;

export * from "./schemas";
export { getPublicQuestion } from "./services/question.api";
export type { QuestionService } from "./services/question.service";
export * from "./types";
