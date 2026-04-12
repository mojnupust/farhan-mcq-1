"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { QuestionSet } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import { ArrowLeft, Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function ArchivePage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await questionSetService.getArchiveBySubCategorySlug(subSlug);
        setSets(data);
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.subExamDashboard(slug, subSlug)}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">আর্কাইভ</h1>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-12">
            লোড হচ্ছে...
          </p>
        ) : sets.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                কোনো আর্কাইভ প্রশ্নসেট নেই
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-6 space-y-3">
            {sets.map((set) => (
              <Card
                key={set.id}
                className="transition-all hover:shadow-md hover:border-primary/30"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{set.title}</h3>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {new Date(set.date).toLocaleDateString("bn-BD")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {set.duration} মিনিট
                        </span>
                        <span>নম্বর: {set.totalMarks}</span>
                      </div>
                      {set.subject && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {set.subject}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={ROUTES.exam(set.id)}>পরীক্ষা দিন</Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={ROUTES.examAnswers(set.id)}>
                          উত্তর দেখুন
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
