import type {
  CreateSyllabusInput,
  Syllabus,
  SyllabusWithCategory,
  UpdateSyllabusInput,
} from "../types";

export interface SyllabusService {
  getAll(): Promise<SyllabusWithCategory[]>;
  getBySubCategorySlug(subCategorySlug: string): Promise<Syllabus[]>;
  getBySlug(slug: string): Promise<Syllabus>;
  create(input: CreateSyllabusInput): Promise<Syllabus>;
  update(id: string, input: UpdateSyllabusInput): Promise<Syllabus>;
  delete(id: string): Promise<void>;
}
