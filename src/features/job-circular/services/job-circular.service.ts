import type {
  BulkUpsertJobCircularItem,
  CreateJobCircularInput,
  JobCircular,
  JobCircularFilter,
  JobCircularFilterOptions,
  PaginatedJobCirculars,
  UpdateJobCircularInput,
} from "../types";

export interface JobCircularService {
  getAll(filter?: JobCircularFilter): Promise<PaginatedJobCirculars>;
  getById(id: string): Promise<JobCircular>;
  getFilterOptions(): Promise<JobCircularFilterOptions>;
  recordView(id: string): Promise<void>;
  create(input: CreateJobCircularInput): Promise<JobCircular>;
  update(id: string, input: UpdateJobCircularInput): Promise<JobCircular>;
  delete(id: string): Promise<void>;
  bulkUpsert(items: BulkUpsertJobCircularItem[]): Promise<JobCircular[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
