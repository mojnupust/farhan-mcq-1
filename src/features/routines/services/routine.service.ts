import type { CreateRoutineInput, Routine, UpdateRoutineInput } from "../types";

export interface RoutineService {
  getBySubCategorySlug(subCategorySlug: string): Promise<Routine[]>;
  create(input: CreateRoutineInput): Promise<Routine>;
  update(id: string, input: UpdateRoutineInput): Promise<Routine>;
  delete(id: string): Promise<void>;
}
