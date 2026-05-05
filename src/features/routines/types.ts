export interface Routine {
  id: string;
  subExamCategoryId: string;
  date: string;
  title: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics: string | null;
  sourceMaterial: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RoutineWithCategory extends Routine {
  subExamCategoryName: string;
  subExamCategorySlug: string;
  examCategorySlug: string;
}

export interface CreateRoutineInput {
  subExamCategoryId: string;
  date: string;
  title: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics?: string;
  sourceMaterial?: string;
  description?: string;
}

export interface UpdateRoutineInput {
  date?: string;
  title?: string;
  totalMarks?: number;
  duration?: number;
  subject?: string;
  topics?: string;
  sourceMaterial?: string;
  description?: string;
  isActive?: boolean;
}

export interface BulkUpsertRoutineItem {
  /** Omit for new routines; include for updates. */
  id?: string;
  subExamCategoryId: string;
  date: string;
  title: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics?: string;
  sourceMaterial?: string;
  description?: string;
  isActive?: boolean;
}
