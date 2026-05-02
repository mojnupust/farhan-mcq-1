import type { SubExamCategory } from "../types";
import type { SubExamCategoryService } from "./sub-exam-category.service";

const mockSubCategories: Record<string, SubExamCategory[]> = {
  "job-solution": [
    {
      id: "1",
      examCategoryId: "c1",
      name: "প্রাইমারি জব সল্যুশন - রিভিশন",
      slug: "primary-job-solution-revision",
      description: null,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      examCategoryId: "c1",
      name: "NTRCA জব সল্যুশন - রিভিশন",
      slug: "ntrca-job-solution-revision",
      description: null,
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      examCategoryId: "c1",
      name: "জব সল্যুশন [৯ম - ১৩তম গ্রেড]",
      slug: "job-solution-9th-13th-grade",
      description: null,
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      examCategoryId: "c1",
      name: "জব সল্যুশন [১৪তম - ২০তম গ্রেড]",
      slug: "job-solution-14th-20th-grade",
      description: null,
      sortOrder: 4,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
  "teacher-recruitment": [
    {
      id: "5",
      examCategoryId: "c2",
      name: "প্রাইমারি ফুল মডেল টেস্ট",
      slug: "primary-full-model-test",
      description: null,
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "6",
      examCategoryId: "c2",
      name: "প্রাইমারি শিক্ষক নিয়োগ প্রস্তুতি [লং কোর্স]",
      slug: "primary-teacher-long-course",
      description: null,
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ],
};

export const mockSubExamCategoryService: SubExamCategoryService = {
  async getByCategorySlug(slug: string) {
    return mockSubCategories[slug] || [];
  },
  async getUserSummary() {
    return { totalQuestionsFaced: 0, totalCorrect: 0 };
  },
  async getMeritList() {
    return [];
  },
  async create(input) {
    return {
      id: "new",
      examCategoryId: input.examCategoryId,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  },
  async update(id, input) {
    return {
      id,
      examCategoryId: "c1",
      name: input.name ?? "",
      slug: input.slug ?? "",
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
  },
  async delete() {
    // no-op
  },
  async bulkUpsert(items) {
    return items.map((item, i) => ({
      id: item.id ?? `mock-sub-${i}`,
      examCategoryId: item.examCategoryId,
      name: item.name,
      slug: item.slug,
      description: item.description ?? null,
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true,
      createdAt: new Date().toISOString(),
    }));
  },
  async bulkDelete() {
    // no-op
  },
};
