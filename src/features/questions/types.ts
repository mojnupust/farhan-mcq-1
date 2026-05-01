import type { QAItem, Question } from "@/types";

export type { QAItem, Question };

export interface AnswerInput {
  text: string;
}

// --- MCQ Question types (matching backend DTOs) ---

export interface McqQuestionDto {
  id: string;
  questionSetId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  subject: string | null;
  topic: string | null;
  subTopic: string | null;
  slug: string | null;
  frequencyTag: string | null;
  sortOrder: number;
}

export interface RelatedQuestionDto {
  id: string;
  slug: string;
  questionText: string;
  subject: string | null;
  topic: string | null;
}

export interface PublicQuestionDto {
  id: string;
  slug: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  subject: string | null;
  topic: string | null;
  subTopic: string | null;
  frequencyTag: string | null;
  questionSetId: string;
  questionSetTitle: string;
  examCategoryName: string;
  examCategorySlug: string;
  subExamCategoryName: string;
  subExamCategorySlug: string;
  relatedQuestions: RelatedQuestionDto[];
}
