import type { Metadata } from "next";
import Link from "next/link";

import { ROUTES } from "@/config/routes";

export const metadata: Metadata = {
  title: "MCQ প্রশ্ন ও উত্তর",
  description:
    "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির MCQ প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যা — Farhan MCQ।",
  alternates: { canonical: "https://www.farhanmcq.com/mcq" },
};

export default function McqIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">MCQ প্রশ্নব্যাংক</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        পরীক্ষা নির্বাচন করে অনুশীলন শুরু করুন। প্রতিটি প্রশ্নের আলাদা পাতা
        Google-এ ইনডেক্সের জন্য তৈরি।
      </p>
      <Link
        href={ROUTES.exams}
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        পরীক্ষা বেছে নিন →
      </Link>
    </div>
  );
}
