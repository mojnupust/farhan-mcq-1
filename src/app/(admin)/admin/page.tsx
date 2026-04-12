"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, HelpCircle, Megaphone, Users } from "lucide-react";

const STATS = [
  {
    label: "মোট ব্যবহারকারী",
    value: 45,
    icon: Users,
    description: "সক্রিয় ব্যবহারকারী",
  },
  {
    label: "পরীক্ষার ক্যাটাগরি",
    value: 4,
    icon: FolderOpen,
    description: "সক্রিয় ক্যাটাগরি",
  },
  {
    label: "প্রশ্ন ব্যাংক",
    value: 0,
    icon: HelpCircle,
    description: "মোট প্রশ্ন",
  },
  {
    label: "নোটিফিকেশন",
    value: 3,
    icon: Megaphone,
    description: "প্রকাশিত নোটিফিকেশন",
  },
];

export default function AdminHomePage() {
  return (
          <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            অ্যাডমিন ড্যাশবোর্ড
          </h1>
          <p className="text-sm text-muted-foreground">
            প্ল্যাটফর্মের সারসংক্ষেপ
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {STATS.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
