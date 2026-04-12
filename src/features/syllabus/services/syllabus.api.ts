import { apiClient } from "@/lib/api-client";
import type {
  CreateSyllabusInput,
  Syllabus,
  UpdateSyllabusInput,
} from "../types";
import type { SyllabusService } from "./syllabus.service";

export const apiSyllabusService: SyllabusService = {
  async getBySubCategorySlug(subCategorySlug: string) {
    const res = await apiClient.get<{ data: Syllabus[] }>(
      `/v1/syllabuses/by-sub-category/${subCategorySlug}`,
    );
    return res.data;
  },
  async getBySlug(slug: string) {
    const res = await apiClient.get<{ data: Syllabus }>(
      `/v1/syllabuses/detail/${slug}`,
    );
    return res.data;
  },
  async create(input: CreateSyllabusInput) {
    const res = await apiClient.post<{ data: Syllabus }>(
      "/v1/syllabuses",
      input,
    );
    return res.data;
  },
  async update(id: string, input: UpdateSyllabusInput) {
    const res = await apiClient.patch<{ data: Syllabus }>(
      `/v1/syllabuses/${id}`,
      input,
    );
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/v1/syllabuses/${id}`);
  },
};
