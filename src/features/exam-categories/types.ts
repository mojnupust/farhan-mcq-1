export interface ExamCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateExamCategoryInput {
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateExamCategoryInput {
  name?: string;
  slug?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BulkUpsertExamCategoryItem {
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}
