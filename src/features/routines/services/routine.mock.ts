import type { Routine } from "../types";
import type { RoutineService } from "./routine.service";

const mockRoutines: Routine[] = [
  {
    id: "r1",
    subExamCategoryId: "s1",
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    title: "বাংলা সাহিত্য মডেল টেস্ট",
    totalMarks: 50,
    duration: 10,
    subject: "বাংলা",
    topics: "কবিতা, গল্প, উপন্যাস",
    sourceMaterial: "NCTB বোর্ড বই",
    description:
      "প্রাইমারি শিক্ষক নিয়োগ পরীক্ষার জন্য বাংলা সাহিত্য মডেল টেস্ট",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2",
    subExamCategoryId: "s1",
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    title: "ইংরেজি গ্রামার মডেল টেস্ট",
    totalMarks: 50,
    duration: 15,
    subject: "ইংরেজি",
    topics: "Tense, Voice, Narration, Correction",
    sourceMaterial: "NCTB Board Books",
    description: null,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const mockRoutineService: RoutineService = {
  async getBySubCategorySlug() {
    return mockRoutines;
  },
  async create(input) {
    return {
      id: `r${Date.now()}`,
      ...input,
      topics: input.topics ?? null,
      sourceMaterial: input.sourceMaterial ?? null,
      description: input.description ?? null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  },
  async update(id, input) {
    const r = mockRoutines.find((r) => r.id === id) ?? mockRoutines[0];
    return { ...r, ...input } as Routine;
  },
  async delete() {},
};
