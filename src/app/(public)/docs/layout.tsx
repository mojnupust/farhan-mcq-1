import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ফ্রি Docx তৈরি করুন | Farhan MCQ",
  description:
    "আপনার জব প্রস্তুতি প্ল্যাটফর্মের জন্য সম্পূর্ণ ফ্রিতে প্রশ্নের প্রিন্ট-রেডি Docx তৈরি করুন। নিজের ব্র্যান্ড নাম, টেমপ্লেট ও কলাম কাস্টমাইজ করুন।",
  keywords: [
    "ফ্রি Docx তৈরি",
    "প্রশ্ন Docx",
    "MCQ Word ফাইল",
    "Farhan MCQ Docx",
    "প্রশ্নপত্র তৈরি",
  ],
  alternates: {
    canonical: "https://farhanmcq.com/docs",
  },
  openGraph: {
    title: "ফ্রি Docx তৈরি করুন | Farhan MCQ",
    description:
      "নিজের ব্র্যান্ডে ফ্রিতে প্রশ্নের প্রিন্ট-রেডি Word ফাইল তৈরি করুন।",
    url: "https://farhanmcq.com/docs",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
  twitter: {
    card: "summary",
    title: "ফ্রি Docx তৈরি করুন | Farhan MCQ",
    description: "নিজের ব্র্যান্ডে ফ্রিতে প্রশ্নের Word ফাইল তৈরি করুন।",
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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
