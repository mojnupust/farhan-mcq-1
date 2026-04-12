"use client";

import { examCategoryService } from "@/features/exam-categories";
import { CategoryGrid } from "@/features/exam-categories/components/category-grid";
import { useEffect, useState } from "react";

// TODO: replace with real auth session
export default function ExamPage() {
  const [categories, setCategories] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    examCategoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  return (
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mt-8">
          <h2 className="text-lg font-semibold tracking-tight mb-4">
            পরীক্ষার ক্যাটাগরি
          </h2>
          <CategoryGrid categories={categories} />
        </div>
      </div>
  );
}
