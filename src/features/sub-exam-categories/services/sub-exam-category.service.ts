import type {
  CreateSubExamCategoryInput,
  MeritListEntry,
  SubExamCategory,
  UpdateSubExamCategoryInput,
  UserCategorySummary,
} from "../types";

export interface SubExamCategoryService {
  getByCategorySlug(categorySlug: string): Promise<SubExamCategory[]>;
  getUserSummary(categorySlug: string): Promise<UserCategorySummary>;
  getMeritList(subCategorySlug: string): Promise<MeritListEntry[]>;
  create(input: CreateSubExamCategoryInput): Promise<SubExamCategory>;
  update(
    id: string,
    input: UpdateSubExamCategoryInput,
  ): Promise<SubExamCategory>;
  delete(id: string): Promise<void>;
}
