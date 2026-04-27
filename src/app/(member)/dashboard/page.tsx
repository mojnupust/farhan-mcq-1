"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { StudySection } from "@/features/dashboard/components/study-section";
import { CategoryGrid } from "@/features/exam-categories/components/category-grid";
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

// TODO: replace with real auth session
export default function DashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  if (!isLoading && !user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">হোম</h1>
          <p className="text-sm text-muted-foreground">স্বাগতম, {user?.name}</p>
        </div>
        {isAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">অ্যাডমিন প্যানেল</Link>
          </Button>
        )}
      </div>

      {/* Notification Banner Future Display Latest Notifications Here */}

      {/* Exam Categories */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          পরীক্ষার ক্যাটাগরি
        </h2>
        <CategoryGrid categories={categories} />
      </div>

      {/* Study Section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">
          প্র্যাক্টিস ও প্রস্তুতি
        </h2>
        <StudySection />
      </div>
    </div>
  );
}
