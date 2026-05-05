import type {
  BulkUpsertRoutineItem,
  CreateRoutineInput,
  Routine,
  RoutineWithCategory,
  UpdateRoutineInput,
} from "../types";

export interface RoutineService {
  getAll(): Promise<RoutineWithCategory[]>;
  getBySubCategorySlug(subCategorySlug: string): Promise<Routine[]>;
  create(input: CreateRoutineInput): Promise<Routine>;
  update(id: string, input: UpdateRoutineInput): Promise<Routine>;
  delete(id: string): Promise<void>;
  bulkUpsert(items: BulkUpsertRoutineItem[]): Promise<Routine[]>;
  bulkDelete(ids: string[]): Promise<void>;
}
