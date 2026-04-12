import { apiQuestionSetService } from "./services/question-set.api";
import { mockQuestionSetService } from "./services/question-set.mock";
import type { QuestionSetService } from "./services/question-set.service";

export const questionSetService: QuestionSetService =
  process.env.USE_MOCKS === "true"
    ? mockQuestionSetService
    : apiQuestionSetService;

export type { QuestionSetService } from "./services/question-set.service";
export * from "./types";
