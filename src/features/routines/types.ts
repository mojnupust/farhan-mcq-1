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
