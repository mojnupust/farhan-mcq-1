"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { SyllabusWithCategory } from "@/features/syllabus";
import { syllabusService } from "@/features/syllabus";
import { BookOpen, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function SyllabusPage() {
  const [syllabuses, setSyllabuses] = useState<SyllabusWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await syllabusService.getAll();
        setSyllabuses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return syllabuses;
    const q = query.toLowerCase();
    return syllabuses.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subExamCategoryName.toLowerCase().includes(q),
    );
  }, [syllabuses, query]);

  // Group by subExamCategorySlug
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { name: string; examSlug: string; subSlug: string; items: SyllabusWithCategory[] }
    >();
    for (const s of filtered) {
      if (!map.has(s.subExamCategorySlug)) {
        map.set(s.subExamCategorySlug, {
          name: s.subExamCategoryName,
          examSlug: s.examCategorySlug,
          subSlug: s.subExamCategorySlug,
          items: [],
        });
      }
      map.get(s.subExamCategorySlug)!.items.push(s);
    }
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">সিলেবাস</h1>
        <p className="text-sm text-muted-foreground mt-1">
          সকল পরীক্ষার পাঠ্যক্রম ও বিষয়বস্তু
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="সিলেবাস খুঁজুন..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-background pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto size-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">কোনো সিলেবাস পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.subSlug}>
              {/* Group header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">{group.name}</h2>
                <Link
                  href={ROUTES.subExamSyllabus(group.examSlug, group.subSlug)}
                  className="text-xs text-primary hover:underline"
                >
                  সব দেখুন
                </Link>
              </div>

              {/* Syllabus cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((s) => (
                  <Link
                    key={s.id}
                    href={ROUTES.subExamSyllabusDetail(
                      group.examSlug,
                      group.subSlug,
                      s.slug,
                    )}
                  >
                    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30 h-full">
                      <CardContent className="py-4 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {s.title}
                            </p>
                            <Badge
                              variant="secondary"
                              className="mt-2 text-xs"
                            >
                              {group.name}
                            </Badge>
                          </div>
                          <ChevronRight className="size-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

