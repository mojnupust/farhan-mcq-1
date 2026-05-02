import { apiClient } from "@/lib/api-client";
import type {
  BulkUpsertExamCategoryItem,
  CreateExamCategoryInput,
  ExamCategory,
  UpdateExamCategoryInput,
} from "../types";
import type { ExamCategoryService } from "./exam-category.service";

export const apiExamCategoryService: ExamCategoryService = {
  async getAll() {
    const res = await apiClient.get<{ data: ExamCategory[] }>(
      "/v1/exam-categories",
    );
    return res.data;
  },
  async getBySlug(slug: string) {
    const res = await apiClient.get<{ data: ExamCategory }>(
      `/v1/exam-categories/${slug}`,
    );
    return res.data;
  },
  async create(input: CreateExamCategoryInput) {
    const res = await apiClient.post<{ data: ExamCategory }>(
      "/v1/exam-categories",
      input,
    );
    return res.data;
  },
  async update(id: string, input: UpdateExamCategoryInput) {
    const res = await apiClient.patch<{ data: ExamCategory }>(
      `/v1/exam-categories/${id}`,
      input,
    );
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/v1/exam-categories/${id}`);
  },
  async bulkUpsert(items: BulkUpsertExamCategoryItem[]) {
    const res = await apiClient.post<{ data: ExamCategory[] }>(
      "/v1/exam-categories/bulk-upsert",
      { items },
    );
    return res.data;
  },
  async bulkDelete(ids: string[]) {
    await apiClient.delete("/v1/exam-categories/bulk-delete", { ids });
  },
};
