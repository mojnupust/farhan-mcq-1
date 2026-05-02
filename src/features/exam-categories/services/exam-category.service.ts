import type {
  BulkUpsertExamCategoryItem,
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
  bulkUpsert(items: BulkUpsertExamCategoryItem[]): Promise<ExamCategory[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
