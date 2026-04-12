import type {
  CreateExamCategoryInput,
  ExamCategory,
  UpdateExamCategoryInput,
} from "../types";

export interface ExamCategoryService {
  getAll(): Promise<ExamCategory[]>;
  getBySlug(slug: string): Promise<ExamCategory>;
  create(input: CreateExamCategoryInput): Promise<ExamCategory>;
  update(id: string, input: UpdateExamCategoryInput): Promise<ExamCategory>;
  delete(id: string): Promise<void>;
}
