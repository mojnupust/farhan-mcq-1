"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { Routine } from "@/features/routines";
import { routineService } from "@/features/routines";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function RoutineCard({ routine }: { routine: Routine }) {
  const [expanded, setExpanded] = useState(false);
  const hasDescription = routine.description && routine.description.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold">
            {routine.title}
          </CardTitle>
          {!routine.isActive && <Badge variant="secondary">নিষ্ক্রিয়</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <span>{formatDate(routine.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-muted-foreground" />
            <span>মোট নম্বর: {routine.totalMarks}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span>সময়: {routine.duration} মিনিট</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <span>{routine.subject}</span>
          </div>
        </div>

        {routine.topics && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="mt-0.5 size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">
              টপিক: {routine.topics}
            </span>
          </div>
        )}

        {routine.sourceMaterial && (
          <div className="text-sm text-muted-foreground">
            📚 সোর্স: {routine.sourceMaterial}
          </div>
        )}

        {hasDescription && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  সংক্ষিপ্ত করুন <ChevronUp className="ml-1 size-3" />
                </>
              ) : (
                <>
                  আরও দেখুন <ChevronDown className="ml-1 size-3" />
                </>
              )}
            </Button>
            {expanded && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {routine.description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function RoutinePage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await routineService.getBySubCategorySlug(subSlug);
        setRoutines(data);
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
            <h1 className="text-2xl font-semibold tracking-tight">
              পরীক্ষার রুটিন
            </h1>
            <p className="text-sm text-muted-foreground">
              আসন্ন পরীক্ষার সময়সূচী
            </p>
          </div>
        </div>

        {/* Routine List */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              লোড হচ্ছে...
            </p>
          ) : routines.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="mx-auto size-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  এখনো কোনো রুটিন যোগ হয়নি
                </p>
              </CardContent>
            </Card>
          ) : (
            routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} />
            ))
          )}
        </div>
      </div>
  );
}
