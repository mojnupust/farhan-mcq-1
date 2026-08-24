import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "পিডিএফ লাইব্রেরি | BCS, NTRCA, ব্যাংক সিলেবাস ও প্রশ্নব্যাংক",
  description:
    "বিসিএস, NTRCA, ব্যাংক ও সরকারি চাকরির সিলেবাস, রুটিন, প্রশ্নব্যাংক, বিগত প্রশ্ন সমাধান ও রিভিশন নোট — প্রিন্টযোগ্য PDF আকারে Farhan MCQ লাইব্রেরি থেকে পড়ুন ও ডাউনলোড করুন।",
  keywords: [
    "BCS PDF ডাউনলোড",
    "NTRCA সিলেবাস PDF",
    "ব্যাংক জব প্রশ্নব্যাংক PDF",
    "সরকারি চাকরির সিলেবাস PDF",
    "বিগত প্রশ্ন সমাধান PDF",
    "প্রাইমারি শিক্ষক নিয়োগ PDF",
    "Farhan MCQ পিডিএফ",
    "বাংলাদেশ চাকরি প্রস্তুতি PDF",
  ],
  alternates: { canonical: "https://farhanmcq.com/pdf-library" },
  openGraph: {
    title: "পিডিএফ লাইব্রেরি | Farhan MCQ",
    description:
      "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির সিলেবাস, প্রশ্নব্যাংক ও নোট PDF এক জায়গায়।",
    url: "https://farhanmcq.com/pdf-library",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "পিডিএফ লাইব্রেরি | Farhan MCQ",
    description: "সরকারি চাকরির প্রস্তুতির PDF — সিলেবাস, প্রশ্নব্যাংক ও নোট।",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function PdfLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
