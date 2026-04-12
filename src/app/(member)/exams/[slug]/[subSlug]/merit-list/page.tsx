"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/config/routes";
import type { MeritListEntry } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import { ArrowLeft, Medal, Trophy } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Badge className="bg-amber-500">🥇 ১ম</Badge>;
  if (rank === 2) return <Badge className="bg-gray-400">🥈 ২য়</Badge>;
  if (rank === 3) return <Badge className="bg-amber-700">🥉 ৩য়</Badge>;
  return <Badge variant="outline">{rank}</Badge>;
}

export default function MeritListPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);
  const [entries, setEntries] = useState<MeritListEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await subExamCategoryService.getMeritList(subSlug);
        setEntries(data);
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
              মেরিট লিস্ট
            </h1>
            <p className="text-sm text-muted-foreground">
              সকল পরীক্ষার্থীদের ফলাফল
            </p>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              লিডারবোর্ড
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">
                লোড হচ্ছে...
              </p>
            ) : entries.length === 0 ? (
              <div className="py-8 text-center">
                <Medal className="mx-auto size-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  এখনো কোনো পরীক্ষার ফলাফল নেই
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">র‍্যাংক</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead className="text-right">মোট নম্বর</TableHead>
                    <TableHead className="text-right">সঠিক</TableHead>
                    <TableHead className="text-right">ভুল</TableHead>
                    <TableHead className="text-right">পরীক্ষা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.userId}>
                      <TableCell>
                        <RankBadge rank={entry.rank} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.userName}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {entry.totalMarks}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        {entry.totalCorrect}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {entry.totalWrong}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.examsTaken}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
