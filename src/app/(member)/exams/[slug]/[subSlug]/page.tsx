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
        <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
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
      {liveSet ? (
        <Card className="mt-6 overflow-hidden border border-green-200/60 bg-gradient-to-br from-green-50 via-emerald-50/40 to-white shadow-md shadow-green-100/50">
          <CardContent className="py-0 px-0">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />

            <div className="px-5 py-4">
              {/* Live Badge with animated pulse */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* Animated live pulse dot */}
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600" />
                  </span>
                  <Badge className="bg-green-600/90 hover:bg-green-600 text-white text-xs font-semibold tracking-wide px-2.5 py-0.5 shadow-sm shadow-green-700/20">
                    LIVE • লাইভ পরীক্ষা
                  </Badge>
                </div>
                <span className="text-[10px] font-medium text-green-600/70 uppercase tracking-widest">
                  এখন চলছে
                </span>
              </div>

              {/* Title */}
              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {liveSet.title}
              </h2>

              {/* Meta info */}
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="size-3.5 text-green-500" />
                  {new Date(liveSet.date).toLocaleDateString("bn-BD")}
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="size-3.5 text-green-500" />
                  {liveSet.duration} মিনিট
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  মোট নম্বর: {liveSet.totalMarks}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  বিষয়: {liveSet.subject}
                </span>
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 active:scale-95 transition-all duration-150 text-white shadow-sm shadow-green-700/30 font-semibold text-sm px-4"
                  asChild
                >
                  <Link href={ROUTES.exam(liveSet.id)}>
                    <PlayCircle className="size-4 mr-1.5" />
                    পরীক্ষা দিন
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          {/* Subtle top strip */}
          <div className="h-0.5 w-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          <div className="flex flex-col items-center justify-center gap-3 px-6 py-7 text-center">
            {/* Text */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-600">
                আজ লাইভ পরীক্ষা নেই
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                পরবর্তী পরীক্ষার জন্য অপেক্ষা করুন
              </p>
            </div>
          </div>
        </div>
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
