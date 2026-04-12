export interface SubExamCategory {
  id: string;
  examCategoryId: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSubExamCategoryInput {
  examCategoryId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateSubExamCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UserCategorySummary {
  totalQuestionsFaced: number;
  totalCorrect: number;
}

export interface MeritListEntry {
  rank: number;
  userId: string;
  userName: string;
  totalMarks: number;
  totalCorrect: number;
  totalWrong: number;
  examsTaken: number;
}
