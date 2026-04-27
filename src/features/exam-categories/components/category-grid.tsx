import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { ExamCategory } from "../types";



export function CategoryGrid({ categories }: { categories: ExamCategory[] }) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/exams/${category.slug}`}>
          <Card className="group transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full">
            <CardHeader className="items-center text-center">
              <span className="text-4xl">{category.icon || "📝"}</span>
              <CardTitle className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">
                {category.name}
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
