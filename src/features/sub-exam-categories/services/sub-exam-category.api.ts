import { apiClient } from "@/lib/api-client";
import type {
  BulkUpsertSubExamCategoryItem,
  CreateSubExamCategoryInput,
  MeritListEntry,
  SubExamCategory,
  UpdateSubExamCategoryInput,
  UserCategorySummary,
} from "../types";
import type { SubExamCategoryService } from "./sub-exam-category.service";

export const apiSubExamCategoryService: SubExamCategoryService = {
  async getByCategorySlug(categorySlug: string) {
    const res = await apiClient.get<{ data: SubExamCategory[] }>(
      `/v1/sub-exam-categories/by-category/${categorySlug}`,
    );
    return res.data;
  },
  async getUserSummary(categorySlug: string) {
    const res = await apiClient.get<{ data: UserCategorySummary }>(
      `/v1/sub-exam-categories/summary/${categorySlug}`,
    );
    return res.data;
  },
  async getMeritList(subCategorySlug: string) {
    const res = await apiClient.get<{ data: MeritListEntry[] }>(
      `/v1/sub-exam-categories/merit-list/${subCategorySlug}`,
    );
    return res.data;
  },
  async create(input: CreateSubExamCategoryInput) {
    const res = await apiClient.post<{ data: SubExamCategory }>(
      "/v1/sub-exam-categories",
      input,
    );
    return res.data;
  },
  async update(id: string, input: UpdateSubExamCategoryInput) {
    const res = await apiClient.patch<{ data: SubExamCategory }>(
      `/v1/sub-exam-categories/${id}`,
      input,
    );
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/v1/sub-exam-categories/${id}`);
  },
  async bulkUpsert(items: BulkUpsertSubExamCategoryItem[]) {
    const res = await apiClient.post<{ data: SubExamCategory[] }>(
      "/v1/sub-exam-categories/bulk-upsert",
      { items },
    );
    return res.data;
  },
  async bulkDelete(ids: string[]) {
    await apiClient.delete("/v1/sub-exam-categories/bulk-delete", { ids });
  },
};
