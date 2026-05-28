"use client";

import { AnimateIn } from "@/components/ui/animate-in";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { StudySection } from "@/features/dashboard/components/study-section";
import { CategoryGrid } from "@/features/exam-categories/components/category-grid";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ExamCategory } from "@/features/exam-categories/types";

const categories: ExamCategory[] = [
  {
    id: "1",
    icon: "💼",
    slug: "job-solution",
    name: "জব সল্যুশন",
    sortOrder: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    icon: "📚",
    slug: "teacher-recruitment",
    name: "শিক্ষক নিয়োগ ও নিবন্ধন",
    sortOrder: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

const motivationalQuotes = [
  "প্রতিদিন একটু একটু করে এগিয়ে যান — সফলতা আসবেই! 🚀",
  "আজকের প্রস্তুতি আগামীর সাফল্যের চাবিকাঠি! ✨",
  "ধারাবাহিক চর্চাই সফলতার সিঁড়ি! 📈",
  "আপনি পারবেন — শুধু চেষ্টা চালিয়ে যান! 💪",
];

// TODO: replace with real auth session
export default function DashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  if (!isLoading && !user) {
    router.push("/login");
    return null;
  }

  const dailyQuote =
    motivationalQuotes[new Date().getDate() % motivationalQuotes.length];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 page-enter">
      {/* Welcome Header */}
      <AnimateIn variant="fade-up" duration={400}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">হোম</h1>
            <p className="text-sm text-muted-foreground">
              স্বাগতম, {user?.name}
            </p>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">অ্যাডমিন প্যানেল</Link>
            </Button>
          )}
        </div>
      </AnimateIn>

      {/* Daily Motivation */}
      <AnimateIn variant="fade-up" delay={100} duration={500}>
        <div className="mt-5 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-4 flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {dailyQuote}
          </p>
        </div>
      </AnimateIn>

      {/* Exam Categories */}
      <AnimateIn variant="fade-up" delay={200} duration={500}>
        <div className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            পরীক্ষার ক্যাটাগরি
          </h2>
          <CategoryGrid categories={categories} />
        </div>
      </AnimateIn>

      {/* Study Section */}
      <AnimateIn variant="fade-up" delay={300} duration={500}>
        <div className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            প্র্যাক্টিস ও প্রস্তুতি
          </h2>
          <StudySection />
        </div>
      </AnimateIn>
    </div>
  );
}
