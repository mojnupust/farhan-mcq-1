import type {
  BulkUpsertRoutineItem,
  CreateRoutineInput,
  Routine,
  UpdateRoutineInput,
} from "../types";

export interface RoutineService {
  getBySubCategorySlug(subCategorySlug: string): Promise<Routine[]>;
  create(input: CreateRoutineInput): Promise<Routine>;
  update(id: string, input: UpdateRoutineInput): Promise<Routine>;
  delete(id: string): Promise<void>;
  bulkUpsert(items: BulkUpsertRoutineItem[]): Promise<Routine[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
