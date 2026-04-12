"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import type { Marksheet } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  MinusCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function MarksheetPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const [marksheet, setMarksheet] = useState<Marksheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await questionSetService.getMarksheet(attemptId);
        setMarksheet(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId]);

  if (loading) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            লোড হচ্ছে...
          </p>
        </div>
    );
  }

  if (!marksheet) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            মার্কশিট পাওয়া যায়নি
          </p>
        </div>
    );
  }

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.dashboard}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">মার্কশিট</h1>
        </div>

        {/* Summary Card */}
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {marksheet.questionSetTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {marksheet.totalCorrect}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle2 className="size-3" /> সঠিক
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {marksheet.totalWrong}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <XCircle className="size-3" /> ভুল
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-500">
                  {marksheet.totalUnanswered}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MinusCircle className="size-3" /> উত্তর দেওয়া হয়নি
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {marksheet.obtainedMarks}
                </p>
                <p className="text-xs text-muted-foreground">
                  প্রাপ্ত / {marksheet.totalMarks}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">
                প্রতি প্রশ্নে নম্বর: {marksheet.markPerQuestion}
              </Badge>
              <Badge variant="outline">
                নেগেটিভ মার্ক: {marksheet.negativeMark}
              </Badge>
            </div>

            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href={ROUTES.examReview(attemptId)}>
                  <ClipboardList className="size-4 mr-1.5" />
                  প্রশ্ন পর্যালোচনা
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Breakdown */}
        {marksheet.subjectWise.length > 0 && (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">বিষয়ভিত্তিক ফলাফল</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marksheet.subjectWise.map((sw) => (
                  <div
                    key={sw.subject}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{sw.subject}</p>
                      <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                        <span className="text-green-600">
                          সঠিক: {sw.correct}
                        </span>
                        <span className="text-red-600">ভুল: {sw.wrong}</span>
                        <span>বাদ: {sw.unanswered}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{sw.finalMark}</p>
                      <p className="text-xs text-muted-foreground">নম্বর</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
