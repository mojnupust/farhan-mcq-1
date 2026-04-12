"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { QuestionSet } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  Heart,
  Medal,
  PlayCircle,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

interface DashboardCard {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bg: string;
}

export default function SubExamDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);
  const [subCategory, setSubCategory] = useState<SubExamCategory | null>(null);
  const [liveSet, setLiveSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subs, live] = await Promise.all([
          subExamCategoryService.getByCategorySlug(slug),
          questionSetService.getLiveBySubCategorySlug(subSlug),
        ]);
        const found = subs.find((s) => s.slug === subSlug);
        setSubCategory(found ?? null);
        setLiveSet(live);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, subSlug]);

  const cards: DashboardCard[] = [
    {
      label: "রুটিন",
      icon: Calendar,
      href: ROUTES.subExamRoutine(slug, subSlug),
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "রেজাল্ট",
      icon: Trophy,
      href: ROUTES.subExamResults(slug, subSlug),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "আর্কাইভ",
      icon: FileText,
      href: ROUTES.subExamArchive(slug, subSlug),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "ফেভারিট",
      icon: Heart,
      href: ROUTES.subExamFavorites(slug, subSlug),
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "সিলেবাস",
      icon: BookOpen,
      href: ROUTES.subExamSyllabus(slug, subSlug),
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "মেরিট লিস্ট",
      icon: Medal,
      href: ROUTES.subExamMeritList(slug, subSlug),
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  if (loading) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            লোড হচ্ছে...
          </p>
        </div>
    );
  }

  if (!subCategory) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            সাব-ক্যাটাগরি পাওয়া যায়নি
          </p>
        </div>
    );
  }

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.examCategory(slug)}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {subCategory.name}
          </h1>
        </div>

        {/* Live Question Set Card */}
        {liveSet && (
          <Card className="mt-6 border-green-200 bg-green-50/50">
            <CardContent className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-600 text-white text-xs">
                  <PlayCircle className="size-3 mr-1" />
                  লাইভ পরীক্ষা
                </Badge>
              </div>
              <h2 className="text-lg font-semibold">{liveSet.title}</h2>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {new Date(liveSet.date).toLocaleDateString("bn-BD")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {liveSet.duration} মিনিট
                </span>
                <span>মোট নম্বর: {liveSet.totalMarks}</span>
                <span>বিষয়: {liveSet.subject}</span>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <Link href={ROUTES.exam(liveSet.id)}>
                    <PlayCircle className="size-4 mr-1.5" />
                    পরীক্ষা দিন
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6 Icon Cards Grid */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}>
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                <CardContent className="flex flex-col items-center justify-center py-6 gap-3">
                  <div
                    className={`flex size-14 items-center justify-center rounded-2xl ${card.bg} transition-transform group-hover:scale-110`}
                  >
                    <card.icon className={`size-7 ${card.color}`} />
                  </div>
                  <span className="text-sm font-medium text-center">
                    {card.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
  );
}
