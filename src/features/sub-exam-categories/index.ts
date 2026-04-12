import { apiSubExamCategoryService } from "./services/sub-exam-category.api";
import { mockSubExamCategoryService } from "./services/sub-exam-category.mock";
import type { SubExamCategoryService } from "./services/sub-exam-category.service";

export const subExamCategoryService: SubExamCategoryService =
  process.env.USE_MOCKS === "true"
    ? mockSubExamCategoryService
    : apiSubExamCategoryService;

export type { SubExamCategoryService } from "./services/sub-exam-category.service";
export * from "./types";
