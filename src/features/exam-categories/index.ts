import { apiExamCategoryService } from "./services/exam-category.api";
import { mockExamCategoryService } from "./services/exam-category.mock";
import type { ExamCategoryService } from "./services/exam-category.service";

export const examCategoryService: ExamCategoryService =
  process.env.USE_MOCKS === "true"
    ? mockExamCategoryService
    : apiExamCategoryService;

export type { ExamCategoryService } from "./services/exam-category.service";
export * from "./types";
