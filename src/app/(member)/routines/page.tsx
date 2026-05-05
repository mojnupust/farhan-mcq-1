"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { RoutineWithCategory } from "@/features/routines";
import { routineService } from "@/features/routines";
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isUpcoming(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<RoutineWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await routineService.getAll();
        setRoutines(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjects = useMemo(() => {
    return Array.from(new Set(routines.map((r) => r.subject)));
  }, [routines]);

  const filtered = useMemo(() => {
    return routines
      .filter((r) => (subjectFilter ? r.subject === subjectFilter : true))
      .filter((r) =>
        tab === "upcoming" ? isUpcoming(r.date) : !isUpcoming(r.date),
      );
  }, [routines, subjectFilter, tab]);

  const upcomingCount = routines.filter((r) => isUpcoming(r.date)).length;
  const pastCount = routines.length - upcomingCount;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">রুটিন</h1>
        <p className="text-sm text-muted-foreground mt-1">
          সকল পরীক্ষার সময়সূচি
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          size="sm"
          variant={tab === "upcoming" ? "default" : "outline"}
          onClick={() => setTab("upcoming")}
        >
          আসছে ({upcomingCount})
        </Button>
        <Button
          size="sm"
          variant={tab === "past" ? "default" : "outline"}
          onClick={() => setTab("past")}
        >
          সম্পন্ন ({pastCount})
        </Button>
      </div>

      {/* Subject filter */}
      {subjects.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            size="sm"
            variant={subjectFilter === null ? "secondary" : "outline"}
            onClick={() => setSubjectFilter(null)}
          >
            সকল বিষয়
          </Button>
          {subjects.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={subjectFilter === s ? "secondary" : "outline"}
              onClick={() => setSubjectFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto size-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">কোনো রুটিন পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((routine) => (
            <Card key={routine.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Date sidebar */}
                  <div className="flex flex-col items-center justify-center w-16 shrink-0 bg-primary/10 text-primary px-2 py-4">
                    <span className="text-xs font-medium">
                      {new Date(routine.date).toLocaleDateString("bn-BD", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-2xl font-bold leading-none">
                      {new Date(routine.date).getDate()}
                    </span>
                    <span className="text-xs">
                      {new Date(routine.date).getFullYear()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base leading-snug">
                        {routine.title}
                      </h3>
                      <Link
                        href={ROUTES.subExamRoutine(
                          routine.examCategorySlug,
                          routine.subExamCategorySlug,
                        )}
                        className="shrink-0"
                      >
                        <ExternalLink className="size-4 text-muted-foreground hover:text-primary" />
                      </Link>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {routine.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {routine.subExamCategoryName}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {routine.duration} মিনিট
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="size-3" />
                        {routine.totalMarks} নম্বর
                      </span>
                      {routine.topics && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {routine.topics}
                        </span>
                      )}
                    </div>

                    {routine.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {routine.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-muted-foreground">
                      <Calendar className="size-3 inline mr-1" />
                      {formatDate(routine.date)}
                    </p>
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
