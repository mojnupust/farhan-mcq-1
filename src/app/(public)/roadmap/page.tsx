import { LandingHeader } from "@/components/landing-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JOB_CATEGORIES, JOB_ROLES } from "@/features/roadmap/roadmap-data";
import { BookOpen, MapPin, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "রোডম্যাপ — আপনার চাকরির প্রস্তুতির পথ",
  description:
    "আপনার লক্ষ্য চাকরি নির্বাচন করুন এবং ধাপে ধাপে প্রস্তুতির রোডম্যাপ দেখুন।",
};

export default function RoadmapPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <MapPin className="size-4" />
              <span>ইন্টারেক্টিভ রোডম্যাপ</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              আপনার চাকরির প্রস্তুতির
              <span className="block text-primary">সম্পূর্ণ রোডম্যাপ</span>
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              আপনার লক্ষ্য চাকরি নির্বাচন করুন। আমরা আপনাকে বিষয়ভিত্তিক টপিক
              সিরিয়ালে ধাপে ধাপে গাইড করব — যেন একটি রাস্তায় হেঁটে গন্তব্যে
              পৌঁছানো!
            </p>
          </div>
        </section>

        {/* Job Roles by Category */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl space-y-10">
            {JOB_CATEGORIES.map((category) => {
              const roles = JOB_ROLES.filter((r) => r.category === category.id);
              if (roles.length === 0) return null;
              return (
                <div key={category.id}>
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Target className="size-5 text-primary" />
                    {category.label}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => {
                      const totalTopics = role.subjects.reduce(
                        (sum, s) => sum + s.topics.length,
                        0,
                      );
                      return (
                        <Link
                          key={role.id}
                          href={`/roadmap/${role.slug}`}
                          className="group"
                        >
                          <Card className="h-full transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md">
                            <CardContent className="flex flex-col gap-3 p-4">
                              <div className="flex items-start justify-between">
                                <h3 className="font-semibold leading-tight group-hover:text-primary">
                                  {role.titleBn}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-xs"
                                >
                                  {role.subjects.length} বিষয়
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {role.title}
                              </p>
                              <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                                <BookOpen className="size-3.5" />
                                <span>{totalTopics} টপিক</span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
