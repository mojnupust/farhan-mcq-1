import type {
  BulkUpsertQuestionSetItem,
  ExamAttempt,
  ExamQuestion,
  Marksheet,
  Question,
  QuestionSet,
  ReviewQuestion,
} from "../types";
import type { QuestionSetService } from "./question-set.service";

const mockLiveSet: QuestionSet = {
  id: "qs-live-1",
  subExamCategoryId: "s1",
  title: "প্রাইমারি জব সল্যুশন - লাইভ মডেল টেস্ট ০১",
  date: new Date("2026-05-01").toISOString(),
  totalMarks: 80,
  duration: 60,
  subject: "সকল বিষয়",
  topics: "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান",
  sourceMaterial: "NCTB বোর্ড বই",
  markPerQuestion: 1,
  negativeMark: 0.25,
  isFree: false,
  isLive: true,
  isActive: true,
  createdAt: new Date().toISOString(),
};

const mockArchiveSets: QuestionSet[] = [
  {
    id: "qs-archive-1",
    subExamCategoryId: "s1",
    title: "মডেল টেস্ট ০১ (আর্কাইভ)",
    date: new Date("2026-03-15").toISOString(),
    totalMarks: 80,
    duration: 60,
    subject: "সকল বিষয়",
    topics: "বাংলা, ইংরেজি, গণিত",
    sourceMaterial: null,
    markPerQuestion: 1,
    negativeMark: 0.25,
    isFree: false,
    isLive: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "qs-archive-2",
    subExamCategoryId: "s1",
    title: "মডেল টেস্ট ০২ (আর্কাইভ)",
    date: new Date("2026-03-22").toISOString(),
    totalMarks: 100,
    duration: 60,
    subject: "সকল বিষয়",
    topics: "বাংলা, ইংরেজি, গণিত, সাধারণ জ্ঞান",
    sourceMaterial: null,
    markPerQuestion: 1,
    negativeMark: 0.25,
    isFree: false,
    isLive: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const mockMarksheet: Marksheet = {
  attemptId: "att-1",
  questionSetId: "qs-live-1",
  questionSetTitle: "লাইভ মডেল টেস্ট ০১",
  startedAt: new Date().toISOString(),
  submittedAt: new Date().toISOString(),
  totalCorrect: 5,
  totalWrong: 2,
  totalUnanswered: 1,
  totalMarks: 80,
  obtainedMarks: 4.5,
  markPerQuestion: 1,
  negativeMark: 0.25,
  subjectWise: [
    { subject: "বাংলা", correct: 2, wrong: 0, unanswered: 0, finalMark: 2 },
    { subject: "ইংরেজি", correct: 1, wrong: 1, unanswered: 0, finalMark: 0.75 },
    { subject: "গণিত", correct: 1, wrong: 1, unanswered: 0, finalMark: 0.75 },
    {
      subject: "সাধারণ জ্ঞান",
      correct: 1,
      wrong: 0,
      unanswered: 1,
      finalMark: 1,
    },
  ],
};

export const mockQuestionSetService: QuestionSetService = {
  async getLiveBySubCategorySlug() {
    return mockLiveSet;
  },
  async getArchiveBySubCategorySlug() {
    return mockArchiveSets;
  },
  async getAllBySubCategorySlug(_slug, isLive) {
    if (isLive === true) return [mockLiveSet];
    if (isLive === false) return mockArchiveSets;
    return [mockLiveSet, ...mockArchiveSets];
  },
  async getById(id) {
    return id === mockLiveSet.id ? mockLiveSet : mockArchiveSets[0]!;
  },
  async create(input) {
    return {
      id: `qs-${Date.now()}`,
      ...input,
      topics: input.topics ?? null,
      sourceMaterial: input.sourceMaterial ?? null,
      markPerQuestion: input.markPerQuestion ?? 1,
      negativeMark: input.negativeMark ?? 0.25,
      isFree: input.isFree ?? false,
      isLive: input.isLive ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  },
  async update(id, input) {
    const base = id === mockLiveSet.id ? mockLiveSet : mockArchiveSets[0]!;
    return { ...base, ...input } as QuestionSet;
  },
  async toggleStatus(id) {
    const base = id === mockLiveSet.id ? mockLiveSet : mockArchiveSets[0]!;
    return { ...base, isLive: !base.isLive };
  },
  async delete() {},
  async getMarksheet() {
    return mockMarksheet;
  },
  async getUserAttempt() {
    return null;
  },

  // Question CRUD (admin)
  async getQuestions(): Promise<Question[]> {
    return [];
  },
  async getQuestion(): Promise<Question> {
    return {} as Question;
  },
  async createQuestion(input) {
    return {
      id: `q-${Date.now()}`,
      ...input,
      explanation: input.explanation ?? null,
      subject: input.subject ?? null,
      sortOrder: input.sortOrder ?? 0,
    } as Question;
  },
  async updateQuestion(_id, _input) {
    return {} as Question;
  },
  async deleteQuestion() {},
  async bulkUpsertQuestions() {
    return [] as Question[];
  },
  async bulkDeleteQuestions() {},

  // Exam flow
  async getExamQuestions(): Promise<ExamQuestion[]> {
    return [];
  },
  async startExam(questionSetId: string): Promise<ExamAttempt> {
    return {
      id: `att-${Date.now()}`,
      userId: "mock-user",
      questionSetId,
      startedAt: new Date().toISOString(),
      submittedAt: null,
      totalCorrect: 0,
      totalWrong: 0,
      totalUnanswered: 0,
      totalMarks: 0,
      obtainedMarks: 0,
      isCompleted: false,
    };
  },
  async answerQuestion() {},
  async submitExam(attemptId: string): Promise<ExamAttempt> {
    return {
      id: attemptId,
      userId: "mock-user",
      questionSetId: "qs-1",
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      totalCorrect: 0,
      totalWrong: 0,
      totalUnanswered: 0,
      totalMarks: 0,
      obtainedMarks: 0,
      isCompleted: true,
    };
  },

  // Review & stats
  async getReviewQuestions(): Promise<ReviewQuestion[]> {
    return [];
  },
  async getQuestionsForReview(): Promise<ReviewQuestion[]> {
    return [];
  },
  async getQuestionStats(questionId: string) {
    return {
      questionId,
      totalAttempts: 0,
      correctCount: 0,
      wrongCount: 0,
      unansweredCount: 0,
    };
  },

  // Favorites
  async toggleFavorite() {
    return true;
  },

  // App settings
  async getAppSettings() {
    return { freeLiveLimit: 3, freeArchiveLimit: 3 };
  },
  async updateAppSettings(input) {
    return {
      freeLiveLimit: input.freeLiveLimit ?? 3,
      freeArchiveLimit: input.freeArchiveLimit ?? 3,
    };
  },
  async toggleFree(id) {
    return { ...mockLiveSet, id, isFree: true };
  },
  async bulkUpsertSets(items: BulkUpsertQuestionSetItem[]) {
    return items.map((item, i) => ({
      id: item.id ?? String(Date.now() + i),
      subExamCategoryId: item.subExamCategoryId,
      title: item.title,
      date: item.date,
      totalMarks: item.totalMarks,
      duration: item.duration,
      subject: item.subject,
      topics: item.topics ?? null,
      sourceMaterial: item.sourceMaterial ?? null,
      markPerQuestion: item.markPerQuestion ?? 1,
      negativeMark: item.negativeMark ?? 0,
      isFree: item.isFree ?? false,
      isLive: item.isLive ?? false,
      isActive: item.isActive ?? true,
      createdAt: new Date().toISOString(),
    }));
  },
  async bulkDeleteSets() {
    // no-op
  },
};
