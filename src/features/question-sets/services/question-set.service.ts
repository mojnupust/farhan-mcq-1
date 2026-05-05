import type {
  AnswerQuestionInput,
  AppSettings,
  BulkUpsertQuestionItem,
  BulkUpsertQuestionSetItem,
  CreateQuestionInput,
  CreateQuestionSetInput,
  ExamAttempt,
  ExamQuestion,
  Marksheet,
  Question,
  QuestionSet,
  QuestionStats,
  ReviewQuestion,
  UpdateAppSettingsInput,
  UpdateQuestionInput,
  UpdateQuestionSetInput,
  UserAttempt,
} from "../types";

export interface QuestionSetService {
  getLiveBySubCategorySlug(
    subCategorySlug: string,
  ): Promise<QuestionSet | null>;
  getArchiveBySubCategorySlug(subCategorySlug: string): Promise<QuestionSet[]>;
  getAllBySubCategorySlug(
    subCategorySlug: string,
    isLive?: boolean,
  ): Promise<QuestionSet[]>;
  getById(id: string): Promise<QuestionSet>;
  create(input: CreateQuestionSetInput): Promise<QuestionSet>;
  update(id: string, input: UpdateQuestionSetInput): Promise<QuestionSet>;
  toggleStatus(id: string): Promise<QuestionSet>;
  delete(id: string): Promise<void>;
  getMarksheet(attemptId: string): Promise<Marksheet>;
  getUserAttempt(questionSetId: string): Promise<UserAttempt | null>;

  // Question CRUD (admin)
  getQuestions(questionSetId: string): Promise<Question[]>;
  getQuestion(id: string): Promise<Question>;
  createQuestion(input: CreateQuestionInput): Promise<Question>;
  updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  bulkUpsertQuestions(questions: BulkUpsertQuestionItem[]): Promise<Question[]>;
  bulkDeleteQuestions(ids: string[]): Promise<void>;

  // Exam flow
  getExamQuestions(questionSetId: string): Promise<ExamQuestion[]>;
  startExam(questionSetId: string): Promise<ExamAttempt>;
  answerQuestion(attemptId: string, input: AnswerQuestionInput): Promise<void>;
  submitExam(attemptId: string): Promise<ExamAttempt>;

  // Review & stats
  getReviewQuestions(attemptId: string): Promise<ReviewQuestion[]>;
  getQuestionsForReview(questionSetId: string): Promise<ReviewQuestion[]>;
  getQuestionStats(questionId: string): Promise<QuestionStats>;

  // Favorites
  getFavoriteQuestions(): Promise<ReviewQuestion[]>;
  toggleFavorite(questionId: string): Promise<boolean>;

  // App settings
  getAppSettings(): Promise<AppSettings>;
  updateAppSettings(input: UpdateAppSettingsInput): Promise<AppSettings>;
  toggleFree(id: string): Promise<QuestionSet>;

  // Bulk question sets
  bulkUpsertSets(items: BulkUpsertQuestionSetItem[]): Promise<QuestionSet[]>;
  bulkDeleteSets(ids: string[]): Promise<void>;
}
