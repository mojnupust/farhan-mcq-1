"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.subExamDashboard(slug, subSlug)}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">রেজাল্ট</h1>
        </div>
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto size-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">পরীক্ষার ফলাফল শীঘ্রই আসছে</p>
          </CardContent>
        </Card>
      </div>
  );
}
