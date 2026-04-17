import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://farhanmcq.com"), // your actual domain

  title: {
    default: "Farhan MCQ — সরকারি চাকরির পূর্ণাঙ্গ প্রস্তুতি প্ল্যাটফর্ম",
    template: "%s | Farhan MCQ",
  },

  description:
    "BCS, ব্যাংক ও প্রাইমারি শিক্ষক নিয়োগসহ সকল সরকারি চাকরির প্রস্তুতি নিন। বিষয়ভিত্তিক Live MCQ অনুশীলন, বিগত বছরের প্রশ্ন সমাধান এবং লাইভ মডেল টেস্টে অংশ নিন।",

  keywords: [
    "BCS Preli প্রস্তুতি",
    "সরকারি চাকরি",
    "Live MCQ অনুশীলন",
    "বিসিএস প্রিলি",
    "ব্যাংক জব প্রস্তুতি",
    "প্রাইমারি শিক্ষক নিয়োগ",
    "বিগত বছরের প্রশ্ন",
    "লাইভ মডেল টেস্ট",
    "Farhan MCQ",
    "শিক্ষক নিবন্ধন NTRCA",
  ],

  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
    title: "Farhan MCQ — সরকারি চাকরির পূর্ণাঙ্গ প্রস্তুতি প্ল্যাটফর্ম",
    description:
      "বিষয়ভিত্তিক MCQ, Live পরীক্ষা ও বিগত বছরের প্রশ্ন সমাধান — সব এক জায়গায়।",
    // images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  twitter: {
    card: "summary_large_image",
    title: "Farhan MCQ — সরকারি চাকরি প্রস্তুতি",
    description:
      "BCS, ব্যাংক ও সরকারি চাকরির Live MCQ অনুশীলন ও লাইভ মডেল টেস্ট।",
    // images: ["https://yourdomain.com/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={`${hindSiliguri.variable} font-hind antialiased`}>
        {children}
      </body>
    </html>
  );
}
