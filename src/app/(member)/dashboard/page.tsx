"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { StudySection } from "@/features/dashboard/components/study-section";
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import { CategoryGrid } from "@/features/exam-categories/components/category-grid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// TODO: replace with real auth session
export default function DashboardPage() {
  const { user, isLoading, isAdmin } = useAuth();
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();

  useEffect(() => {
    examCategoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  if (!isLoading && !user) {
    router.push("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
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
