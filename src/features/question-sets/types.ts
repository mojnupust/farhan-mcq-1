export interface QuestionSet {
  id: string;
  subExamCategoryId: string;
  title: string;
  date: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics: string | null;
  sourceMaterial: string | null;
  markPerQuestion: number;
  negativeMark: number;
  isFree: boolean;
  isLive: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateQuestionSetInput {
  subExamCategoryId: string;
  title: string;
  date: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics?: string;
  sourceMaterial?: string;
  markPerQuestion?: number;
  negativeMark?: number;
  isFree?: boolean;
  isLive?: boolean;
}

export interface UpdateQuestionSetInput {
  title?: string;
  date?: string;
  totalMarks?: number;
  duration?: number;
  subject?: string;
  topics?: string;
  sourceMaterial?: string;
  markPerQuestion?: number;
  negativeMark?: number;
  isFree?: boolean;
  isLive?: boolean;
  isActive?: boolean;
}

export interface SubjectWiseMark {
  subject: string;
  correct: number;
  wrong: number;
  unanswered: number;
  finalMark: number;
}

export interface Marksheet {
  attemptId: string;
  questionSetId: string;
  questionSetTitle: string;
  startedAt: string;
  submittedAt: string | null;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  totalMarks: number;
  obtainedMarks: number;
  markPerQuestion: number;
  negativeMark: number;
  subjectWise: SubjectWiseMark[];
}

export interface UserAttempt {
  id: string;
  isCompleted: boolean;
}

// --- Question types ---

export interface Question {
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

/** Question returned during exam (hides correctAnswer & explanation) */
export interface ExamQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subject: string | null;
  sortOrder: number;
}

export interface CreateQuestionInput {
  questionSetId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  subject?: string;
  sortOrder?: number;
}

export interface UpdateQuestionInput {
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  subTopic?: string;
  slug?: string;
  frequencyTag?: string;
  sortOrder?: number;
}

export interface BulkUpsertQuestionItem {
  /** Omit for new questions; include for updates. */
  id?: string;
  questionSetId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  subject?: string;
  topic?: string;
  subTopic?: string;
  slug?: string;
  frequencyTag?: string;
  sortOrder?: number;
}

// --- Exam attempt types ---

export interface ExamAttempt {
  id: string;
  userId: string;
  questionSetId: string;
  startedAt: string;
  submittedAt: string | null;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  totalMarks: number;
  obtainedMarks: number;
  isCompleted: boolean;
}

export interface AnswerQuestionInput {
  questionId: string;
  selectedAnswer: string;
}

// --- Review types ---

export interface ReviewQuestion {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  subject: string | null;
  sortOrder: number;
  userAnswer: string | null;
  isCorrect: boolean;
  isFavorite: boolean;
}

export interface QuestionStats {
  questionId: string;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

// --- App settings ---

export interface AppSettings {
  freeLiveLimit: number;
  freeArchiveLimit: number;
}

export interface UpdateAppSettingsInput {
  freeLiveLimit?: number;
  freeArchiveLimit?: number;
}
