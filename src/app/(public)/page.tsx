import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronRight,
  Lock,
  LogInIcon,
  MessageCircle,
  PlayCircle,
  Radio,
  Users,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Farhan MCQ — সরকারি চাকরির পূর্ণাঙ্গ MCQ প্রস্তুতি প্ল্যাটফর্ম",
  description:
    "BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA সহ সকল সরকারি চাকরির MCQ প্রস্তুতি নিন। লাইভ পরীক্ষা, মডেল টেস্ট, বিগত বছরের প্রশ্ন সমাধান — সব এক জায়গায়। মাত্র ৳190/মাস।",
  alternates: {
    canonical: "https://farhanmcq.com",
  },
  openGraph: {
    title: "Farhan MCQ — সরকারি চাকরির পূর্ণাঙ্গ MCQ প্রস্তুতি",
    description:
      "BCS, ব্যাংক ও প্রাইমারি শিক্ষক নিয়োগসহ সকল সরকারি চাকরির MCQ অনুশীলন, লাইভ পরীক্ষা ও মডেল টেস্ট। মাত্র ৳190/মাস।",
    url: "https://farhanmcq.com",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
};

const categories = [
  { id: 1, name: "জব সলিউশন", slug: "job-solution" },
  { id: 2, name: "শিক্ষক নিয়োগ ও নিবন্ধন", slug: "teacher-recruitment" },
  { id: 3, name: "বিসিএস প্রস্তুতি", slug: "bcs-preparation" },
  { id: 4, name: "ব্যাংক নিয়োগ ও প্রস্তুতি", slug: "bank-recruitment" },
];

const benefits = [
  {
    icon: Radio,
    title: "লাইভ পরীক্ষা",
    description: "আমাদের দেওয়া রুটিন ফলো করে, প্রতিদিন পরীক্ষা দিবেন",
  },
  {
    icon: Video,
    title: "সাপ্তাহিক লাইভ সেশন",
    description:
      "অভিজ্ঞ মেন্টরের সাথে লাইভ সেশন, সরকার চাকরির প্রস্তুতি ও পরামর্শ এবং Q&A করব।",
  },
  {
    icon: Users,
    title: "পূণর্নাঙ্গ মডেল টেস্ট ",
    description:
      "হবুহু আসল পরীক্ষার মতো মডেল টেস্ট, যা আপনাকে ব্যাংক, প্রাইমারিসহ ‍ সকল পরীক্ষার জন্য প্রস্তুত করবে।",
  },
  {
    icon: MessageCircle,
    title: "প্রাইভেট কমিউনিটি",
    description:
      "একটি প্রাইভেট ফেসবুক গ্রুপ যেখানে আপনি অন্য সদস্যদের সাথে আলোচনা করতে পারেন, প্রশ্ন করতে পারেন, এবং পরীক্ষার আপডেট পেতে পারেন।",
  },
];

const faqs = [
  {
    question: "What exactly is Farhan MCQ?",
    answer:
      "It's a small, membership-based mentoring community for Bangladeshi software engineers. You get access to a growing video library, bi-weekly live sessions, a private Telegram group, and direct messaging with a senior engineer. Think of it as having a mentor on retainer — not a course platform.",
  },
  {
    question: "How do I pay?",
    answer:
      "Payment is via bKash or Nagad. After signing in with Google, you'll message the admin directly to arrange payment. It's simple and personal — no complex payment gateway.",
  },
  {
    question: "What if I miss a live session?",
    answer:
      "All live sessions are recorded and added to the video library. You can watch them anytime. The Telegram group also has discussion threads for each session.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no contracts, no lock-in periods. If you stop paying, your access pauses. If you come back, you pick up where you left off.",
  },
  {
    question: "What courses are available?",
    answer:
      "Currently: AI-Augmented Software Engineering (12 videos), Deep Node.js (8 videos), and Software Architecture Fundamentals (6 videos, in progress). New content is added regularly based on what members want to learn.",
  },
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Farhan MCQ",
    url: "https://farhanmcq.com",
    description:
      "BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA সহ সকল সরকারি চাকরির MCQ প্রস্তুতি প্ল্যাটফর্ম।",
    publisher: {
      "@type": "Organization",
      name: "Farhan Software",
      founder: { "@type": "Person", name: "Mojnu Miah" },
    },
    offers: {
      "@type": "Offer",
      price: "190",
      priceCurrency: "BDT",
      url: "https://farhanmcq.com/dashboard",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Farhan MCQ
          </Link>
          <Button size="sm" asChild>
            <Link href="/dashboard">
              <LogInIcon />
              লগইন/রেজিস্ট্রেশন
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              আমাদের সাথে নিন
              <br />
              সরকারি চাকরির পূর্ণাঙ্গ প্রস্তুতি
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              চাকরি না পাওয়ার আসল কারণটা কি জানেন? সেটা হলো—সঠিক গাইডলাইন আর
              ভালো মানের রিসোর্সের অভাব! এই দুইটা সমস্যার সমাধান নিয়েই আমরা আছি
              আপনার পাশে। আমাদের সাথে প্রাথমিক শিক্ষক নিয়োগ, শিক্ষক নিবন্ধন
              (NTRCA), ৯ম–২০তম গ্রেডের চাকরি পরীক্ষাসহ প্রায় সব সরকারি-বেসরকারি
              চাকরির পূর্ণাঙ্গ প্রস্তুতি নিন—একদম সঠিক গাইডলাইন ও প্রিমিয়াম
              রিসোর্স দিয়ে।
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button size="lg" className="text-base" asChild>
                <Link href="/dashboard">
                  <LogInIcon />
                  জয়েন করুন
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              45+ শিক্ষার্থী ইতিমধ্যে ‍ আমাদের সাথে শিখছে{" "}
            </p>
          </div>
        </section>

        {/* What Members Get */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              আমাদের সদস্যরা কি পাবেন
            </h2>
            <p className="mt-2 text-muted-foreground">
              সরকারি চাকরিতে সফলতা পাওয়ার <strong>complete solution</strong>
              —সবকিছু এক জায়গায়
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="border-0 shadow-none bg-background"
                >
                  <CardHeader>
                    <benefit.icon className="size-5 text-muted-foreground" />
                    <CardTitle className="text-base">{benefit.title}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Course Preview */}
        <section className="border-t">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              MCQ library
            </h2>
            <p className="mt-2 text-muted-foreground">
              Browse the MCQs. Sign in to start practicing.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category?.id}
                  href={`/exams/${category?.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-colors group-hover:border-foreground/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {category?.name}
                        </CardTitle>
                        <Lock className="size-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PlayCircle className="size-4" />
                        <span>MCQs</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Lock className="mb-0.5 inline size-3" /> Sign in to practice MCQs
            </p>
          </div>
        </section>

        {/* About the Mentor */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              About Us
            </h2>
            <div className="mt-8 max-w-2xl">
              <p className="text-lg font-medium">Farhan MCQ</p>
              <p className="text-sm text-muted-foreground">
                Parent Company: Farhan Software. Founder: Mojnu Miah. Estern
                Housing, K Block, Alubdi, Koborstan.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {/* Write About Farhan MCQ here. */}
                প্রস্তুতির শুরুতেই সঠিক দিকনির্দেশনা পেলে সময় অনেকটাই বাঁচানো
                সম্ভব। Farhan MCQ আপনাকে শুরু থেকেই একটি পরিষ্কার roadmap দেয়।
                আমাদের লক্ষ্য হলো প্রতিটি শিক্ষার্থীকে এমনভাবে প্রস্তুত করা, যেন
                তারা আত্মবিশ্বাসের সাথে যেকোনো চাকরির পরীক্ষায় অংশ নিতে পারে।
                এখানে আপনি পাবেন আপডেটেড MCQ, রিয়েল এক্সাম-লেভেলের মডেল টেস্ট,
                লাইভ ক্লাস এবং অভিজ্ঞ মেন্টরের সরাসরি গাইডলাইন। Farhan MCQ শুধু
                একটি লার্নিং প্ল্যাটফর্ম নয়—এটি একটি কমিউনিটি, যেখানে আপনি
                শিখবেন, অনুশীলন করবেন এবং নিজের স্বপ্ন পূরণের পথে এগিয়ে যাবেন।
              </p>
              <p className="mt-4 text-sm italic text-muted-foreground">
                {/* Sukanto Bhattacharjee poet is our Motivation  */}
                কবি সুকান্ত ভট্টাচার্য আমাদের অনুপ্রেরণা, যিনি বলেছেন—
                <br />
                <em>
                  &quot;ক্ষুধার রাজ্যে পৃথিবী গদ্যময়, পূর্ণিমার চাঁদ যেন ঝলসানো
                  রুটি&quot;
                </em>
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-md text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Simple pricing
              </h2>
              <p className="mt-2 text-muted-foreground">
                One membership, everything included.
              </p>
              <Card className="mt-8">
                <CardHeader className="text-center">
                  <CardDescription>via bKash or Nagad</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    ৳190 / Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-sm">
                    {[
                      "All MCQs and video content",
                      "Weekly live sessions",
                      "Private Facebook community",
                      "Model tests for all major exams",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Cancel anytime. No contracts.
                  </p>
                  <Button className="mt-6 w-full text-base" size="lg" asChild>
                    <Link href="/dashboard">
                      <LogInIcon />
                      Join with Phone
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-8 max-w-2xl space-y-2">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border-b pb-4 [&[open]>summary>svg]:rotate-180"
                >
                  <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium transition-colors hover:underline [&::-webkit-details-marker]:hidden list-none">
                    {faq.question}
                    <ChevronRight className="size-4 shrink-0 rotate-90 text-muted-foreground transition-transform duration-200" />
                  </summary>
                  <p className="pb-2 text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Farhan MCQ. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61574369463384"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://wa.me/8801788262433"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
