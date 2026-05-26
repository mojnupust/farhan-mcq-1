"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { StudySection } from "@/features/dashboard/components/study-section";
import { CategoryGrid } from "@/features/exam-categories/components/category-grid";
import type { ExamCategory } from "@/features/exam-categories/types";
import { Award, BarChart3, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function DashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  if (!isLoading && !user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">স্বাগতম, {user?.name}</h1>
            <p className="mt-2 text-sm text-violet-100">
              নিয়মিত প্র্যাক্টিস চালিয়ে যান, আপনার সফলতা খুব কাছেই ✨
            </p>
          </div>
          <span className="text-3xl">🚀</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "মোট পরীক্ষা", value: "১২", icon: BarChart3, color: "text-violet-500" },
          { title: "স্কোর", value: "৮৮%", icon: Trophy, color: "text-blue-500" },
          { title: "র্যাংক", value: "#০৭", icon: Award, color: "text-emerald-500" },
        ].map((item) => (
          <div key={item.title} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <item.icon className={`size-4 ${item.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight gradient-text">
            পরীক্ষার ক্যাটাগরি
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/exams">সব দেখুন</Link>
          </Button>
        </div>
        <CategoryGrid categories={categories} />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight gradient-text">
            প্র্যাক্টিস ও প্রস্তুতি
          </h2>
        </div>
        <StudySection />
      </div>

      {isAdmin && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">অ্যাডমিন প্যানেল</Link>
        </Button>
      )}
    </div>
  );
}
