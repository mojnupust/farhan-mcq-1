import { apiClient } from "@/lib/api-client";
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
import type { QuestionSetService } from "./question-set.service";

export const apiQuestionSetService: QuestionSetService = {
  async getLiveBySubCategorySlug(subCategorySlug: string) {
    const res = await apiClient.get<{ data: QuestionSet | null }>(
      `/v1/question-sets/live/${subCategorySlug}`,
    );
    return res.data;
  },
  async getArchiveBySubCategorySlug(subCategorySlug: string) {
    const res = await apiClient.get<{ data: QuestionSet[] }>(
      `/v1/question-sets/archive/${subCategorySlug}`,
    );
    return res.data;
  },
  async getAllBySubCategorySlug(subCategorySlug: string, isLive?: boolean) {
    const query = isLive !== undefined ? `?isLive=${isLive}` : "";
    const res = await apiClient.get<{ data: QuestionSet[] }>(
      `/v1/question-sets/by-sub-category/${subCategorySlug}${query}`,
    );
    return res.data;
  },
  async getById(id: string) {
    const res = await apiClient.get<{ data: QuestionSet }>(
      `/v1/question-sets/${id}`,
    );
    return res.data;
  },
  async create(input: CreateQuestionSetInput) {
    const res = await apiClient.post<{ data: QuestionSet }>(
      "/v1/question-sets",
      input,
    );
    return res.data;
  },
  async update(id: string, input: UpdateQuestionSetInput) {
    const res = await apiClient.patch<{ data: QuestionSet }>(
      `/v1/question-sets/${id}`,
      input,
    );
    return res.data;
  },
  async toggleStatus(id: string) {
    const res = await apiClient.patch<{ data: QuestionSet }>(
      `/v1/question-sets/${id}/toggle-status`,
      {},
    );
    return res.data;
  },
  async delete(id: string) {
    await apiClient.delete(`/v1/question-sets/${id}`);
  },
  async getMarksheet(attemptId: string) {
    const res = await apiClient.get<{ data: Marksheet }>(
      `/v1/question-sets/marksheet/${attemptId}`,
    );
    return res.data;
  },
  async getUserAttempt(questionSetId: string) {
    const res = await apiClient.get<{ data: UserAttempt | null }>(
      `/v1/question-sets/user-attempt/${questionSetId}`,
    );
    return res.data;
  },

  // Question CRUD (admin)
  async getQuestions(questionSetId: string) {
    const res = await apiClient.get<{ data: Question[] }>(
      `/v1/question-sets/questions/${questionSetId}`,
    );
    return res.data;
  },
  async getQuestion(id: string) {
    const res = await apiClient.get<{ data: Question }>(
      `/v1/question-sets/question/${id}`,
    );
    return res.data;
  },
  async createQuestion(input: CreateQuestionInput) {
    const res = await apiClient.post<{ data: Question }>(
      "/v1/question-sets/questions",
      input,
    );
    return res.data;
  },
  async updateQuestion(id: string, input: UpdateQuestionInput) {
    const res = await apiClient.patch<{ data: Question }>(
      `/v1/question-sets/question/${id}`,
      input,
    );
    return res.data;
  },
  async deleteQuestion(id: string) {
    await apiClient.delete(`/v1/question-sets/question/${id}`);
  },
  async bulkUpsertQuestions(questions: BulkUpsertQuestionItem[]) {
    const res = await apiClient.post<{ data: Question[] }>(
      "/v1/question-sets/questions/bulk-upsert",
      { questions },
    );
    return res.data;
  },
  async bulkDeleteQuestions(ids: string[]) {
    await apiClient.delete("/v1/question-sets/questions/bulk-delete", { ids });
  },

  // Exam flow
  async getExamQuestions(questionSetId: string) {
    const res = await apiClient.get<{ data: ExamQuestion[] }>(
      `/v1/question-sets/exam-questions/${questionSetId}`,
    );
    return res.data;
  },
  async startExam(questionSetId: string) {
    const res = await apiClient.post<{ data: ExamAttempt }>(
      "/v1/question-sets/start-exam",
      { questionSetId },
    );
    return res.data;
  },
  async answerQuestion(attemptId: string, input: AnswerQuestionInput) {
    await apiClient.post(`/v1/question-sets/answer/${attemptId}`, input);
  },
  async submitExam(attemptId: string) {
    const res = await apiClient.post<{ data: ExamAttempt }>(
      `/v1/question-sets/submit-exam/${attemptId}`,
      {},
    );
    return res.data;
  },

  // Review & stats
  async getReviewQuestions(attemptId: string) {
    const res = await apiClient.get<{ data: ReviewQuestion[] }>(
      `/v1/question-sets/review/${attemptId}`,
    );
    return res.data;
  },
  async getQuestionsForReview(questionSetId: string) {
    const res = await apiClient.get<{ data: ReviewQuestion[] }>(
      `/v1/question-sets/review-questions/${questionSetId}`,
    );
    return res.data;
  },
  async getQuestionStats(questionId: string) {
    const res = await apiClient.get<{ data: QuestionStats }>(
      `/v1/question-sets/question-stats/${questionId}`,
    );
    return res.data;
  },

  // Favorites
  async getFavoriteQuestions() {
    const res = await apiClient.get<{ data: ReviewQuestion[] }>(
      `/v1/question-sets/favorites`,
    );
    return res.data;
  },
  async toggleFavorite(questionId: string) {
    const res = await apiClient.post<{ data: { isFavorite: boolean } }>(
      `/v1/question-sets/favorite/${questionId}`,
      {},
    );
    return res.data.isFavorite;
  },

  // App settings
  async getAppSettings() {
    const res = await apiClient.get<{ data: AppSettings }>(
      "/v1/question-sets/settings/free-tier",
    );
    return res.data;
  },
  async updateAppSettings(input: UpdateAppSettingsInput) {
    const res = await apiClient.patch<{ data: AppSettings }>(
      "/v1/question-sets/settings/free-tier",
      input,
    );
    return res.data;
  },
  async toggleFree(id: string) {
    const res = await apiClient.patch<{ data: QuestionSet }>(
      `/v1/question-sets/${id}/toggle-free`,
      {},
    );
    return res.data;
  },
  async bulkUpsertSets(items: BulkUpsertQuestionSetItem[]) {
    const res = await apiClient.post<{ data: QuestionSet[] }>(
      "/v1/question-sets/bulk-upsert-sets",
      { items },
    );
    return res.data;
  },
  async bulkDeleteSets(ids: string[]) {
    await apiClient.delete("/v1/question-sets/bulk-delete-sets", { ids });
  },
};
