import type { JobCircularService } from "./job-circular.service";

export const mockJobCircularService: JobCircularService = {
  async getAll() {
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  },
  async getById() {
    throw new Error("Not found");
  },
  async getFilterOptions() {
    return { categories: [], ministries: [], organizations: [] };
  },
  async recordView() {},
  async create() {
    throw new Error("Not implemented");
  },
  async update() {
    throw new Error("Not implemented");
  },
  async delete() {},
};
