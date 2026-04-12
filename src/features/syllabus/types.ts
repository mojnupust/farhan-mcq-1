export interface Syllabus {
  id: string;
  subExamCategoryId: string;
  title: string;
  slug: string;
  content: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSyllabusInput {
  subExamCategoryId: string;
  title: string;
  slug: string;
  content: string;
  sortOrder?: number;
}

export interface UpdateSyllabusInput {
  title?: string;
  slug?: string;
  content?: string;
  sortOrder?: number;
  isActive?: boolean;
}
