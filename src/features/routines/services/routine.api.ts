import { apiClient } from "@/lib/api-client";
import type {
  BulkUpsertRoutineItem,
  CreateRoutineInput,
  Routine,
  UpdateRoutineInput,
} from "../types";
import type { RoutineService } from "./routine.service";

export const apiRoutineService: RoutineService = {
  async getBySubCategorySlug(subCategorySlug: string) {
    const res = await apiClient.get<{ data: Routine[] }>(
      `/v1/routines/by-sub-category/${subCategorySlug}`,
    );
    return res.data;
  },
  async create(input: CreateRoutineInput) {
    const res = await apiClient.post<{ data: Routine }>("/v1/routines", input);
    return res.data;
  },
  async update(id: string, input: UpdateRoutineInput) {
    const res = await apiClient.patch<{ data: Routine }>(
      `/v1/routines/${id}`,
      input,
    );
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/v1/routines/${id}`);
  },
  async bulkUpsert(items: BulkUpsertRoutineItem[]) {
    const res = await apiClient.post<{ data: Routine[] }>(
      "/v1/routines/bulk-upsert",
      { routines: items },
    );
    return res.data;
  },
  async bulkDelete(ids: string[]) {
    await apiClient.delete("/v1/routines/bulk-delete", { ids });
  },
};
