import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "পরীক্ষার রুটিন | Farhan MCQ — BCS, ব্যাংক, প্রাইমারি",
  description:
    "BCS, ব্যাংক নিয়োগ, প্রাইমারি শিক্ষক ও NTRCA সহ সকল সরকারি চাকরির পরীক্ষার সময়সূচি ও রুটিন দেখুন। আসন্ন পরীক্ষার তারিখ, বিষয় ও সময় সম্পর্কে আপডেট থাকুন।",
  keywords: [
    "পরীক্ষার রুটিন",
    "BCS রুটিন",
    "ব্যাংক পরীক্ষার সময়সূচি",
    "প্রাইমারি শিক্ষক নিয়োগ রুটিন",
    "NTRCA সময়সূচি",
    "সরকারি চাকরি পরীক্ষার তারিখ",
    "Farhan MCQ রুটিন",
  ],
  alternates: {
    canonical: "https://farhanmcq.com/routines",
  },
  openGraph: {
    title: "পরীক্ষার রুটিন | Farhan MCQ",
    description:
      "BCS, ব্যাংক নিয়োগ, প্রাইমারি শিক্ষক ও NTRCA পরীক্ষার সময়সূচি ও রুটিন।",
    url: "https://farhanmcq.com/routines",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
  twitter: {
    card: "summary",
    title: "পরীক্ষার রুটিন | Farhan MCQ",
    description: "সকল সরকারি চাকরির পরীক্ষার সময়সূচি দেখুন।",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RoutinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
