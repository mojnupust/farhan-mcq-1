import type { ExamCategory } from "../types";
import type { ExamCategoryService } from "./exam-category.service";

const mockCategories: ExamCategory[] = [
  {
    id: "1",
    name: "জব সল্যুশন",
    slug: "job-solution",
    icon: "💼",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "শিক্ষক নিয়োগ ও নিবন্ধন",
    slug: "teacher-recruitment",
    icon: "📚",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "বিসিএস প্রস্তুতি",
    slug: "bcs-preparation",
    icon: "🏛️",
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "ব্যাংক নিয়োগ প্রস্তুতি",
    slug: "bank-recruitment",
    icon: "🏦",
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const mockExamCategoryService: ExamCategoryService = {
  async getAll() {
    return mockCategories;
  },
  async getBySlug(slug: string) {
    const cat = mockCategories.find((c) => c.slug === slug);
    if (!cat) throw new Error("Category not found");
    return cat;
  },
  async create(input) {
    return {
      id: String(mockCategories.length + 1),
      name: input.name,
      slug: input.slug,
      icon: input.icon ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  },
  async update(id, input) {
    const cat = mockCategories.find((c) => c.id === id);
    if (!cat) throw new Error("Category not found");
    return { ...cat, ...input };
  },
  async delete() {
    // no-op
  },
};
