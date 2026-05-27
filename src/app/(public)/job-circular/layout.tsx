import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "সরকারি চাকরির বিজ্ঞপ্তি | Farhan MCQ — সকল চাকরির নিয়োগ",
  description:
    "বাংলাদেশ সরকারের সকল মন্ত্রণালয়, অধিদপ্তর ও স্বায়ত্তশাসিত প্রতিষ্ঠানের চাকরির বিজ্ঞপ্তি। BCS, ব্যাংক, প্রাইমারি শিক্ষক ও সকল সরকারি নিয়োগ বিজ্ঞপ্তি এক জায়গায়।",
  keywords: [
    "সরকারি চাকরির বিজ্ঞপ্তি",
    "সরকারি নিয়োগ ২০২৬",
    "BD Govt Job Circular",
    "BCS নিয়োগ",
    "ব্যাংক নিয়োগ বিজ্ঞপ্তি",
    "প্রাইমারি শিক্ষক নিয়োগ",
    "Farhan MCQ চাকরি",
  ],
  alternates: { canonical: "https://farhanmcq.com/job-circular" },
  openGraph: {
    title: "সরকারি চাকরির বিজ্ঞপ্তি | Farhan MCQ",
    description: "বাংলাদেশের সকল সরকারি চাকরির নিয়োগ বিজ্ঞপ্তি এক জায়গায়।",
    url: "https://farhanmcq.com/job-circular",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
  twitter: {
    card: "summary",
    title: "সরকারি চাকরির বিজ্ঞপ্তি | Farhan MCQ",
    description: "সকল সরকারি নিয়োগ বিজ্ঞপ্তি দেখুন।",
  },
  robots: { index: true, follow: true },
};

export default function JobCircularLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
