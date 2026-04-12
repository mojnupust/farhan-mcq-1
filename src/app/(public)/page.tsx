import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import Link from "next/link";

import { examCategoryService } from "@/features/exam-categories";

const courses = [
  {
    id: "ai-augmented-engineering",
    title: "AI-Augmented Software Engineering",
    description:
      "Using AI tools in real production workflows — not toy demos, but actual engineering practices.",
    videoCount: 12,
  },
  {
    id: "deep-nodejs",
    title: "Deep Node.js",
    description:
      "Internals, event loop, streams, and production debugging. The stuff that separates juniors from seniors.",
    videoCount: 8,
  },
  {
    id: "software-architecture",
    title: "Software Architecture Fundamentals",
    description:
      "Design patterns, system design, and understanding trade-offs in real systems.",
    videoCount: 6,
    inProgress: true,
  },
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const categories = await examCategoryService.getAll();

  console.log("Fetched categories:", categories);
  return (
    <div className="min-h-screen bg-background">
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
            <div className="mt-8 max-w-2xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
