import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "পরীক্ষার সিলেবাস | Farhan MCQ — BCS, ব্যাংক, প্রাইমারি",
  description:
    "BCS, ব্যাংক নিয়োগ, প্রাইমারি শিক্ষক ও NTRCA সহ সকল সরকারি চাকরির পরীক্ষার সম্পূর্ণ সিলেবাস ও পাঠ্যক্রম দেখুন। বিষয়ভিত্তিক টপিক ও পয়েন্ট জানুন।",
  keywords: [
    "পরীক্ষার সিলেবাস",
    "BCS সিলেবাস",
    "ব্যাংক পরীক্ষার সিলেবাস",
    "প্রাইমারি শিক্ষক নিয়োগ সিলেবাস",
    "NTRCA সিলেবাস",
    "সরকারি চাকরির পাঠ্যক্রম",
    "Farhan MCQ সিলেবাস",
  ],
  alternates: {
    canonical: "https://farhanmcq.com/syllabus",
  },
  openGraph: {
    title: "পরীক্ষার সিলেবাস | Farhan MCQ",
    description:
      "BCS, ব্যাংক নিয়োগ, প্রাইমারি শিক্ষক ও NTRCA পরীক্ষার সম্পূর্ণ সিলেবাস।",
    url: "https://farhanmcq.com/syllabus",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
  twitter: {
    card: "summary",
    title: "পরীক্ষার সিলেবাস | Farhan MCQ",
    description: "সকল সরকারি চাকরির পরীক্ষার সিলেবাস দেখুন।",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SyllabusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
