import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { ExamCategory } from "../types";

const bgColors = [
  "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
  "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
  "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
  "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
  "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
];

export function CategoryGrid({ categories }: { categories: ExamCategory[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <Link key={category.id} href={`/exams/${category.slug}`}>
          <Card className={`group card-hover-lift glow-on-hover icon-bounce-hover cursor-pointer h-full border bg-gradient-to-br ${bgColors[index % bgColors.length]} hover:border-primary/40`}>
            <CardHeader className="items-center text-center">
              <span className="icon-target text-4xl transition-transform duration-300 group-hover:scale-110">
                {category.icon || "📝"}
              </span>
              <CardTitle className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors duration-200">
                {category.name}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
