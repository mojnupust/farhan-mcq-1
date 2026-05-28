export type SyllabusContentType = "mdx" | "html";

export interface Syllabus {
  id: string;
  subExamCategoryId: string;
  title: string;
  slug: string;
  content: string;
  contentType: SyllabusContentType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface SyllabusWithCategory extends Syllabus {
  subExamCategoryName: string;
  subExamCategorySlug: string;
  examCategorySlug: string;
}

export interface CreateSyllabusInput {
  subExamCategoryId: string;
  title: string;
  slug: string;
  content: string;
  contentType?: SyllabusContentType;
  sortOrder?: number;
}

export interface UpdateSyllabusInput {
  title?: string;
  slug?: string;
  content?: string;
  contentType?: SyllabusContentType;
  sortOrder?: number;
  isActive?: boolean;
}
