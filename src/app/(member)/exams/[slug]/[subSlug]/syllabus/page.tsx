"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { Syllabus } from "@/features/syllabus";
import { syllabusService } from "@/features/syllabus";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function SyllabusListPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await syllabusService.getBySubCategorySlug(subSlug);
        setSyllabuses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subSlug]);

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.subExamDashboard(slug, subSlug)}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">সিলেবাস</h1>
            <p className="text-sm text-muted-foreground">
              পরীক্ষার পাঠ্যক্রম ও বিষয়বস্তু
            </p>
          </div>
        </div>

        {/* Syllabus List */}
        <div className="mt-6 space-y-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              লোড হচ্ছে...
            </p>
          ) : syllabuses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="mx-auto size-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  এখনো কোনো সিলেবাস যোগ হয়নি
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {syllabuses.map((s) => (
                <Link
                  key={s.id}
                  href={ROUTES.subExamSyllabusDetail(slug, subSlug, s.slug)}
                >
                  <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                    <CardHeader className="py-4">
                      <div className="flex flex-row items-center justify-between ">
                        <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                          {s.title}
                        </CardTitle>
                        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
