import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  ChevronRight,
  Facebook,
  Lock,
  LogInIcon,
  MessageCircle,
  Radio,
  PlayCircle,
  Shield,
  Sparkles,
  Users,
  Video,
  Wallet,
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
  { id: 1, name: "জব সলিউশন", slug: "job-solution", emoji: "💼" },
  {
    id: 2,
    name: "শিক্ষক নিয়োগ ও নিবন্ধন",
    slug: "teacher-recruitment",
    emoji: "🏫",
  },
  { id: 3, name: "বিসিএস প্রস্তুতি", slug: "bcs-preparation", emoji: "🎯" },
  {
    id: 4,
    name: "ব্যাংক নিয়োগ ও প্রস্তুতি",
    slug: "bank-recruitment",
    emoji: "🏦",
  },
];

const STUDENT_COUNT = "৪৫+";

const categoryStripById: Record<number, string> = {
  1: "from-violet-500 to-purple-500",
  2: "from-blue-500 to-cyan-500",
  3: "from-emerald-500 to-green-500",
  4: "from-orange-500 to-amber-500",
};

const benefits = [
  {
    icon: Radio,
    title: "লাইভ পরীক্ষা",
    description: "আমাদের দেওয়া রুটিন ফলো করে, প্রতিদিন পরীক্ষা দিবেন",
    iconClass: "from-violet-500/20 to-violet-600/10 text-violet-600",
    borderClass: "border-l-violet-500",
  },
  {
    icon: Video,
    title: "সাপ্তাহিক লাইভ সেশন",
    description:
      "অভিজ্ঞ মেন্টরের সাথে লাইভ সেশন, সরকার চাকরির প্রস্তুতি ও পরামর্শ এবং Q&A করব।",
    iconClass: "from-blue-500/20 to-blue-600/10 text-blue-600",
    borderClass: "border-l-blue-500",
  },
  {
    icon: Users,
    title: "পূণর্নাঙ্গ মডেল টেস্ট ",
    description:
      "হবুহু আসল পরীক্ষার মতো মডেল টেস্ট, যা আপনাকে ব্যাংক, প্রাইমারিসহ ‍ সকল পরীক্ষার জন্য প্রস্তুত করবে।",
    iconClass: "from-emerald-500/20 to-emerald-600/10 text-emerald-600",
    borderClass: "border-l-emerald-500",
  },
  {
    icon: MessageCircle,
    title: "প্রাইভেট কমিউনিটি",
    description:
      "একটি প্রাইভেট ফেসবুক গ্রুপ যেখানে আপনি অন্য সদস্যদের সাথে আলোচনা করতে পারেন, প্রশ্ন করতে পারেন, এবং পরীক্ষার আপডেট পেতে পারেন।",
    iconClass: "from-orange-500/20 to-orange-600/10 text-orange-600",
    borderClass: "border-l-orange-500",
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="glass sticky top-0 z-50 border-b border-transparent">
        <div className="animate-gradient absolute inset-x-0 bottom-0 h-px bg-[var(--gradient-accent)]" />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-black tracking-tight"
          >
            <Sparkles className="size-4 text-violet-500" />
            <span className="gradient-text">Farhan MCQ</span>
          </Link>
          <Button
            size="sm"
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
            asChild
          >
            <Link href="/dashboard">
              <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-white/30 blur-md transition-transform duration-500 group-hover:translate-x-[320%]" />
              <LogInIcon />
              লগইন/রেজিস্ট্রেশন
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute -left-10 top-16 size-64 rounded-full bg-purple-500/20 blur-3xl animate-float" />
          <div className="absolute right-0 top-0 size-72 rounded-full bg-blue-500/15 blur-3xl animate-float [animation-delay:400ms]" />
          <div className="absolute bottom-0 left-1/3 size-72 rounded-full bg-green-400/10 blur-3xl animate-float [animation-delay:800ms]" />

          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="max-w-4xl animate-fade-in-up">
              <div className="inline-flex animate-pulse-glow items-center gap-2 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-blue-500/20 px-4 py-2 text-sm font-medium">
                🔥 {STUDENT_COUNT} শিক্ষার্থী ইতিমধ্যে যোগ দিয়েছে
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
                আমাদের সাথে নিন <span className="gradient-text">সরকারি চাকরির</span>{" "}
                পূর্ণাঙ্গ <span className="gradient-text">প্রস্তুতি</span>
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                চাকরি না পাওয়ার আসল কারণটা কি জানেন? সেটা হলো—সঠিক গাইডলাইন আর
                ভালো মানের রিসোর্সের অভাব! এই দুইটা সমস্যার সমাধান নিয়েই আমরা আছি
                আপনার পাশে। আমাদের সাথে প্রাথমিক শিক্ষক নিয়োগ, শিক্ষক নিবন্ধন
                (NTRCA), ৯ম–২০তম গ্রেডের চাকরি পরীক্ষাসহ প্রায় সব সরকারি-বেসরকারি
                চাকরির পূর্ণাঙ্গ প্রস্তুতি নিন—একদম সঠিক গাইডলাইন ও প্রিমিয়াম
                রিসোর্স দিয়ে।
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="animate-pulse-glow rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-7 text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30"
                  asChild
                >
                  <Link href="/dashboard">
                    <LogInIcon />
                    জয়েন করুন
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full border border-border/60 px-7"
                  asChild
                >
                  <Link href="#about">আরো জানুন</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 rounded-2xl border bg-background/80 p-5 backdrop-blur-sm sm:grid-cols-3">
                {[
                  { icon: Users, text: `${STUDENT_COUNT} শিক্ষার্থী`, color: "text-violet-500" },
                  { icon: Wallet, text: "৪ ক্যাটাগরি", color: "text-blue-500" },
                  { icon: PlayCircle, text: "লাইভ পরীক্ষা", color: "text-emerald-500" },
                ].map((item, index) => (
                  <div
                    key={item.text}
                    className={`flex items-center gap-3 ${index < 2 ? "sm:border-r sm:pr-4" : ""}`}
                  >
                    <item.icon className={`size-5 ${item.color}`} />
                    <p className="font-semibold">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                আমাদের সদস্যরা কি পাবেন
              </h2>
              <div className="mt-3 h-1 w-28 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
              <p className="mt-3 text-muted-foreground">
                সরকারি চাকরিতে সফলতা পাওয়ার <strong>complete solution</strong>
                —সবকিছু এক জায়গায়
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className={`glass-card border-l-4 ${benefit.borderClass} transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
                >
                  <CardHeader>
                    <div
                      className={`inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${benefit.iconClass}`}
                    >
                      <benefit.icon className="size-6" />
                    </div>
                    <CardTitle className="text-base">{benefit.title}</CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                MCQ library
              </h2>
              <Badge className="bg-gradient-to-r from-violet-500 to-blue-500 text-white">
                নতুন
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Browse the MCQs. Sign in to start practicing.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link key={category.id} href={`/exams/${category.slug}`} className="group">
                  <Card className="relative h-full overflow-hidden border border-border/70 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-violet-400/50 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <div
                      className={`h-1.5 w-full bg-gradient-to-r ${categoryStripById[category.id] ?? categoryStripById[(index % 4) + 1]}`}
                    />
                    <CardHeader>
                      <div className="text-2xl">{category.emoji}</div>
                      <CardTitle className="text-base leading-6">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-3 py-1 text-xs font-medium text-white">
                        <Sparkles className="size-3" /> Premium
                      </div>
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

        <section id="about" className="border-t bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                About Us
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                প্রস্তুতির শুরুতেই সঠিক দিকনির্দেশনা পেলে সময় অনেকটাই বাঁচানো
                সম্ভব। Farhan MCQ আপনাকে শুরু থেকেই একটি পরিষ্কার roadmap দেয়।
                আমাদের লক্ষ্য হলো প্রতিটি শিক্ষার্থীকে এমনভাবে প্রস্তুত করা, যেন
                তারা আত্মবিশ্বাসের সাথে যেকোনো চাকরির পরীক্ষায় অংশ নিতে পারে।
                এখানে আপনি পাবেন আপডেটেড MCQ, রিয়েল এক্সাম-লেভেলের মডেল টেস্ট,
                লাইভ ক্লাস এবং অভিজ্ঞ মেন্টরের সরাসরি গাইডলাইন। Farhan MCQ শুধু
                একটি লার্নিং প্ল্যাটফর্ম নয়—এটি একটি কমিউনিটি, যেখানে আপনি
                শিখবেন, অনুশীলন করবেন এবং নিজের স্বপ্ন পূরণের পথে এগিয়ে যাবেন।
              </p>
            </div>

            <div className="space-y-4">
              <Card className="glass-card border-l-4 border-l-violet-500">
                <CardContent className="pt-6">
                  <blockquote className="text-sm leading-7 text-muted-foreground">
                    কবি সুকান্ত ভট্টাচার্য আমাদের অনুপ্রেরণা, যিনি বলেছেন—
                    <br />
                    <em className="mt-2 block text-foreground">
                      &quot;ক্ষুধার রাজ্যে পৃথিবী গদ্যময়, পূর্ণিমার চাঁদ যেন ঝলসানো
                      রুটি&quot;
                    </em>
                  </blockquote>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex-row items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-lg font-bold text-white">
                    FM
                  </div>
                  <div>
                    <CardTitle className="text-base">Farhan MCQ</CardTitle>
                    <CardDescription>
                      Parent Company: Farhan Software. Founder: Mojnu Miah.
                      Estern Housing, K Block, Alubdi, Koborstan.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Simple pricing
            </h2>
            <p className="mt-2 text-muted-foreground">
              One membership, everything included.
            </p>
            <Card className="relative mx-auto mt-10 max-w-md ring-2 ring-violet-500/50">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-blue-500 text-white">
                🌟 Most Popular
              </Badge>
              <CardHeader className="pt-8 text-center">
                <CardDescription>via bKash or Nagad</CardDescription>
                <CardTitle className="text-4xl font-black gradient-text">
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
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="size-3.5" /> Cancel anytime. No contracts.
                </p>
                <Button
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-base"
                  size="lg"
                  asChild
                >
                  <Link href="/dashboard">
                    <LogInIcon />
                    Join with Phone
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Frequently asked questions
            </h2>
            <div className="mt-8 max-w-3xl space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group overflow-hidden rounded-xl border bg-background/80 p-1 transition-all"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-4 py-4 text-sm font-medium transition-all hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-blue-500/10 [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <ChevronRight className="size-4 shrink-0 transition-transform duration-300 group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-sm leading-7 text-muted-foreground">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-transparent">
        <div className="animate-gradient h-px bg-[var(--gradient-accent)]" />
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-violet-500" />
              <span className="gradient-text">Farhan MCQ</span>
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Farhan MCQ. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <a
              href="https://www.facebook.com/profile.php?id=61574369463384"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground transition-all hover:gradient-text"
            >
              <Facebook className="size-4" /> Facebook
            </a>
            <a
              href="https://wa.me/8801788262433"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground transition-all hover:gradient-text"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
