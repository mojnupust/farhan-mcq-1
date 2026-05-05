import type { Syllabus, SyllabusWithCategory } from "../types";
import type { SyllabusService } from "./syllabus.service";

const mockSyllabuses: Syllabus[] = [
  {
    id: "sy1",
    subExamCategoryId: "s1",
    title: "প্রাথমিক শিক্ষক নিয়োগ সিলেবাস",
    slug: "primary-shikkok-niyog",
    content:
      "# প্রাথমিক শিক্ষক নিয়োগ সিলেবাস\n\n## বাংলা\n- বাংলা সাহিত্য\n- বাংলা ব্যাকরণ\n\n## ইংরেজি\n- Grammar\n- Vocabulary\n\n## গণিত\n- পাটিগণিত\n- বীজগণিত\n\n## সাধারণ জ্ঞান\n- বাংলাদেশ বিষয়াবলী\n- আন্তর্জাতিক বিষয়াবলী",
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "sy2",
    subExamCategoryId: "s1",
    title: "NTRCA শিক্ষক নিবন্ধন সিলেবাস",
    slug: "ntrca-shikkok-nibondhon",
    content:
      "# NTRCA শিক্ষক নিবন্ধন সিলেবাস\n\n## স্কুল পর্যায়\n- বাংলা\n- ইংরেজি\n- গণিত\n- সাধারণ জ্ঞান",
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const mockSyllabusService: SyllabusService = {
  async getAll() {
    return mockSyllabuses.map((s) => ({
      ...s,
      subExamCategoryName: "প্রাইমারি শিক্ষক নিয়োগ",
      subExamCategorySlug: "primary-teacher",
      examCategorySlug: "primary",
    })) as SyllabusWithCategory[];
  },
  async getBySubCategorySlug() {
    return mockSyllabuses;
  },
  async getBySlug(slug: string) {
    const s = mockSyllabuses.find((s) => s.slug === slug);
    if (!s) throw new Error("Not found");
    return s;
  },
  async create(input) {
    return {
      id: `sy${Date.now()}`,
      ...input,
      sortOrder: input.sortOrder ?? 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  },
  async update(id, input) {
    const s = mockSyllabuses.find((s) => s.id === id) ?? mockSyllabuses[0];
    return { ...s, ...input } as Syllabus;
  },
  async delete() {},
};
