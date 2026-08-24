import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ভিডিও লাইব্রেরি | BCS, NTRCA, ব্যাংক লেকচার",
  description:
    "বিসিএস, NTRCA, ব্যাংক, প্রাথমিক শিক্ষক নিয়োগ ও অন্যান্য সরকারি চাকরির প্রস্তুতির YouTube লেকচার — Farhan MCQ ভিডিও লাইব্রেরিতে এক জায়গায় দেখুন।",
  keywords: [
    "BCS ভিডিও লেকচার",
    "NTRCA ক্লাস ভিডিও",
    "ব্যাংক জব প্রস্তুতি ভিডিও",
    "প্রাইমারি শিক্ষক নিয়োগ ভিডিও",
    "সরকারি চাকরির ক্লাস",
    "Farhan MCQ ভিডিও",
    "বাংলাদেশ চাকরি প্রস্তুতি YouTube",
  ],
  alternates: { canonical: "https://farhanmcq.com/videos" },
  openGraph: {
    title: "ভিডিও লাইব্রেরি | Farhan MCQ",
    description:
      "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির প্রস্তুতির ভিডিও লেকচার এক জায়গায়।",
    url: "https://farhanmcq.com/videos",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "ভিডিও লাইব্রেরি | Farhan MCQ",
    description: "সরকারি চাকরির প্রস্তুতির ভিডিও লেকচার দেখুন।",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
