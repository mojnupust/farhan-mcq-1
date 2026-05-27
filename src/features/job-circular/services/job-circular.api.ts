import { apiClient } from "@/lib/api-client";
import type {
  CreateJobCircularInput,
  JobCircular,
  JobCircularFilter,
  JobCircularFilterOptions,
  PaginatedJobCirculars,
  UpdateJobCircularInput,
} from "../types";
import type { JobCircularService } from "./job-circular.service";

function buildParams(filter?: JobCircularFilter): string {
  if (!filter) return "";
  const p = new URLSearchParams();
  const entries: [string, unknown][] = Object.entries(filter);
  for (const [k, v] of entries) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const str = p.toString();
  return str ? `?${str}` : "";
}

export const apiJobCircularService: JobCircularService = {
  async getAll(filter) {
    const res = await apiClient.get<PaginatedJobCirculars>(
      `/v1/job-circulars${buildParams(filter)}`,
    );
    return res;
  },

  async getById(id) {
    const res = await apiClient.get<{ data: JobCircular }>(
      `/v1/job-circulars/${id}`,
    );
    return res.data;
  },

  async getFilterOptions() {
    const res = await apiClient.get<{ data: JobCircularFilterOptions }>(
      `/v1/job-circulars/filter-options`,
    );
    return res.data;
  },

  async recordView(id) {
    await apiClient.post(`/v1/job-circulars/${id}/view`, {});
  },

  async create(input: CreateJobCircularInput) {
    const res = await apiClient.post<{ data: JobCircular }>(
      `/v1/job-circulars`,
      input,
    );
    return res.data;
  },

  async update(id: string, input: UpdateJobCircularInput) {
    const res = await apiClient.patch<{ data: JobCircular }>(
      `/v1/job-circulars/${id}`,
      input,
    );
    return res.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/v1/job-circulars/${id}`);
  },
};
