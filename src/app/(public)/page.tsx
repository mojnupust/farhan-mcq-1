import { LandingHeader } from "@/components/landing-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  Lock,
  LogInIcon,
  MessageCircle,
  PlayCircle,
  Radio,
  Star,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Farhan MCQ — সরকারি চাকরির পূর্ণাঙ্গ MCQ প্রস্তুতি প্ল্যাটফর্ম",
  description:
    "BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA সহ সকল সরকারি চাকরির MCQ প্রস্তুতি নিন।",
  alternates: { canonical: "https://farhanmcq.com" },
  openGraph: {
    title: "Farhan MCQ — সরকারি চাকরির পূর্ণাঙ্গ MCQ প্রস্তুতি",
    description:
      "BCS, ব্যাংক ও প্রাইমারি শিক্ষক নিয়োগসহ সকল সরকারি চাকরির MCQ অনুশীলন করুন।",
    url: "https://farhanmcq.com",
    type: "website",
    locale: "bn_BD",
    siteName: "Farhan MCQ",
  },
};

const stats = [
  { value: "৫০০+", label: "প্রশ্নব্যাংক" },
  { value: "৪৫+", label: "সক্রিয় শিক্ষার্থী" },
  { value: "৪টি", label: "পরীক্ষা ক্যাটাগরি" },
  { value: "৯৮%", label: "সন্তুষ্ট শিক্ষার্থী" },
];

const categories = [
  { id: 1, name: "জব সলিউশন", slug: "job-solution", icon: "💼", count: "১৫০+" },
  {
    id: 2,
    name: "শিক্ষক নিয়োগ ও নিবন্ধন",
    slug: "teacher-recruitment",
    icon: "📚",
    count: "২০০+",
  },
  {
    id: 3,
    name: "বিসিএস প্রস্তুতি",
    slug: "bcs-preparation",
    icon: "🎯",
    count: "১০০+",
  },
  {
    id: 4,
    name: "ব্যাংক নিয়োগ ও প্রস্তুতি",
    slug: "bank-recruitment",
    icon: "🏦",
    count: "৮০+",
  },
];

const benefits = [
  {
    icon: Radio,
    title: "লাইভ পরীক্ষা",
    description:
      "প্রতিদিন নির্দিষ্ট রুটিন অনুযায়ী লাইভ MCQ পরীক্ষায় অংশ নিন এবং রিয়েল-টাইম র‍্যাংকিং দেখুন।",
  },
  {
    icon: Video,
    title: "সাপ্তাহিক লাইভ সেশন",
    description:
      "অভিজ্ঞ মেন্টরের সাথে সরাসরি প্রশ্নোত্তর ও কৌশলগত গাইডলাইন পান।",
  },
  {
    icon: Users,
    title: "পূর্ণাঙ্গ মডেল টেস্ট",
    description:
      "হুবহু আসল পরীক্ষার পরিবেশে মডেল টেস্ট দিন — ব্যাংক, প্রাইমারি, BCS সব কিছুর জন্য।",
  },
  {
    icon: TrendingUp,
    title: "পার্সোনালাইজড প্রগ্রেস",
    description:
      "আপনার দুর্বল বিষয় চিহ্নিত করে স্মার্ট অধ্যয়ন পরিকল্পনা তৈরি করুন।",
  },
  {
    icon: MessageCircle,
    title: "প্রাইভেট কমিউনিটি",
    description:
      "একটি প্রাইভেট ফেসবুক গ্রুপ — যেখানে সদস্যরা একে অপরকে সাহায্য করেন।",
  },
  {
    icon: Zap,
    title: "তাৎক্ষণিক ফলাফল",
    description: "পরীক্ষার সাথে সাথে সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা পান।",
  },
];

const testimonials = [
  {
    name: "রাফিউল ইসলাম",
    role: "প্রাথমিক শিক্ষক নিয়োগ প্রার্থী",
    text: "Farhan MCQ তে যোগ দেওয়ার পর থেকে আমার প্রস্তুতি অনেক গুছানো হয়েছে। লাইভ পরীক্ষাগুলো সত্যিই কার্যকর।",
    stars: 5,
  },
  {
    name: "সাদিয়া আক্তার",
    role: "BCS প্রস্তুতি",
    text: "মডেল টেস্টগুলো হুবহু আসল পরীক্ষার মতো। মেন্টর খুবই সহায়ক এবং প্রতিটি প্রশ্নের ব্যাখ্যা পাওয়া যায়।",
    stars: 5,
  },
  {
    name: "মো. তানভীর",
    role: "ব্যাংক নিয়োগ প্রার্থী",
    text: "মাত্র ৳১৯০/মাসে এত সুন্দর একটি প্ল্যাটফর্ম! কমিউনিটির সবাই অনেক সহযোগিতামূলক।",
    stars: 5,
  },
];

const faqs = [
  {
    question: "Farhan MCQ কী এবং এটি কাদের জন্য?",
    answer:
      "Farhan MCQ হলো বাংলাদেশের সরকারি চাকরি প্রার্থীদের জন্য একটি প্রিমিয়াম মেম্বারশিপ প্ল্যাটফর্ম। BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ, NTRCA সহ সব ধরনের সরকারি চাকরির প্রস্তুতির জন্য এটি উপযুক্ত।",
  },
  {
    question: "কীভাবে পেমেন্ট করতে হবে?",
    answer:
      "bKash বা Nagad এর মাধ্যমে পেমেন্ট করা যায়। Google দিয়ে সাইন ইন করার পর অ্যাডমিনের সাথে যোগাযোগ করলেই হবে — সম্পূর্ণ সহজ প্রক্রিয়া।",
  },
  {
    question: "লাইভ সেশন মিস হলে কী হবে?",
    answer:
      "সব লাইভ সেশন রেকর্ড করা হয় এবং ভিডিও লাইব্রেরিতে যুক্ত করা হয়। যেকোনো সময় দেখতে পারবেন।",
  },
  {
    question: "যেকোনো সময় বাতিল করা যাবে কি?",
    answer:
      "হ্যাঁ, কোনো চুক্তি নেই। পেমেন্ট বন্ধ করলে অ্যাক্সেস পজ হয়, পুনরায় জয়েন করলে আগের জায়গা থেকে শুরু করতে পারবেন।",
  },
  {
    question: "কোন কোন ক্যাটাগরির MCQ পাওয়া যায়?",
    answer:
      "বর্তমানে জব সলিউশন, শিক্ষক নিয়োগ ও নিবন্ধন, BCS প্রস্তুতি এবং ব্যাংক নিয়োগ — এই ৪টি ক্যাটাগরিতে ৫০০+ MCQ আছে। প্রতিনিয়ত নতুন প্রশ্ন যোগ হচ্ছে।",
  },
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Farhan MCQ",
    url: "https://farhanmcq.com",
    description: "সরকারি চাকরির MCQ প্রস্তুতি প্ল্যাটফর্ম",
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

      {/* ── Auth-Aware Header ── */}
      <LandingHeader />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                ৪৫+ শিক্ষার্থী এখন প্রস্তুতি নিচ্ছেন
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                সরকারি চাকরিতে
                <span className="text-primary"> সফল হওয়ার</span>
                <br />
                সবচেয়ে স্মার্ট উপায়
              </h1>
              <p className="mt-5 text-lg text-muted-foreground sm:text-xl leading-relaxed">
                BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA — সব পরীক্ষার জন্য
                পূর্ণাঙ্গ MCQ প্র্যাকটিস, লাইভ পরীক্ষা, মডেল টেস্ট এবং অভিজ্ঞ
                মেন্টরের গাইডলাইন — একটিমাত্র প্ল্যাটফর্মে।
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="text-base shadow-lg" asChild>
                  <Link href="/dashboard">
                    <LogInIcon />
                    এখনই জয়েন করুন — মাত্র ৳১৯০/মাস
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">
                  ✅ কোনো চুক্তি নেই। যেকোনো সময় বাতিল করুন।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-b bg-primary text-primary-foreground">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-sm opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                আমাদের সদস্যরা যা পাবেন
              </h2>
              <p className="mt-2 text-muted-foreground">
                সরকারি চাকরিতে সফলতার <strong>complete solution</strong> —
                সবকিছু এক জায়গায়
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  className="border bg-card hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <benefit.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle className="text-base mt-2">
                      {benefit.title}
                    </CardTitle>
                    <CardDescription>{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── MCQ Library ── */}
        <section className="border-b bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  MCQ লাইব্রেরি
                </h2>
                <p className="mt-1 text-muted-foreground">
                  সাইন ইন করুন এবং প্র্যাকটিস শুরু করুন।
                </p>
              </div>
              <BookOpen className="size-8 text-muted-foreground hidden sm:block" />
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/exams/${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-md">
                    <CardHeader className="pb-3">
                      <span className="text-2xl">{category.icon}</span>
                      <CardTitle className="text-sm mt-2">
                        {category.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <PlayCircle className="size-3" />
                          <span>{category.count} MCQ</span>
                        </div>
                        <Lock className="size-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                শিক্ষার্থীরা কী বলছেন
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.name} className="border">
                  <CardHeader>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <CardDescription className="text-foreground/80 italic">
                      &quot;{t.text}&quot;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="border-b bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-md text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                সহজ ও সাশ্রয়ী মূল্য
              </h2>
              <p className="mt-2 text-muted-foreground">
                একটি মেম্বারশিপ — সব কিছু অন্তর্ভুক্ত।
              </p>
              <Card className="mt-8 border-primary/30 shadow-lg">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary w-fit">
                    সবচেয়ে জনপ্রিয়
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    bKash বা Nagad-এ পেমেন্ট
                  </p>
                  <CardTitle className="text-4xl font-bold mt-1">
                    ৳১৯০
                    <span className="text-lg font-normal text-muted-foreground">
                      {" "}
                      / মাস
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-sm">
                    {[
                      "সকল MCQ ও ভিডিও কন্টেন্ট",
                      "সাপ্তাহিক লাইভ সেশন",
                      "প্রাইভেট ফেসবুক কমিউনিটি",
                      "সব পরীক্ষার মডেল টেস্ট",
                      "পার্সোনালাইজড প্রগ্রেস ট্র্যাকিং",
                      "তাৎক্ষণিক ফলাফল ও ব্যাখ্যা",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    কোনো চুক্তি নেই। যেকোনো সময় বাতিল করুন।
                  </p>
                  <Button className="mt-6 w-full text-base" size="lg" asChild>
                    <Link href="/dashboard">
                      <Award className="size-4" />
                      এখনই শুরু করুন
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── About ── */}
        <section className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              আমাদের সম্পর্কে
            </h2>
            <div className="mt-6 max-w-2xl">
              <p className="text-lg font-medium">Farhan MCQ</p>
              <p className="text-sm text-muted-foreground">
                Farhan Software | প্রতিষ্ঠাতা: Mojnu Miah
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                প্রস্তুতির শুরুতেই সঠিক দিকনির্দেশনা পেলে সময় অনেকটাই বাঁচানো
                সম্ভব। Farhan MCQ আপনাকে শুরু থেকেই একটি পরিষ্কার roadmap দেয়।
                আমাদের লক্ষ্য — প্রতিটি শিক্ষার্থীকে এমনভাবে প্রস্তুত করা যেন
                তারা আত্মবিশ্বাসের সাথে যেকোনো পরীক্ষায় অংশ নিতে পারে।
              </p>
              <p className="mt-4 text-sm italic text-muted-foreground">
                কবি সুকান্ত ভট্টাচার্য আমাদের অনুপ্রেরণা —
                <br />
                <em>
                  &quot;ক্ষুধার রাজ্যে পৃথিবী গদ্যময়, পূর্ণিমার চাঁদ যেন ঝলসানো
                  রুটি&quot;
                </em>
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-b bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              সচরাচর জিজ্ঞাসা
            </h2>
            <div className="mt-8 max-w-2xl space-y-2">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group border-b pb-4 [&[open]>summary>svg]:rotate-180"
                >
                  <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium transition-colors hover:text-primary [&::-webkit-details-marker]:hidden list-none">
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

        {/* ── Final CTA ── */}
        <section className="border-b bg-primary text-primary-foreground">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <Clock className="mx-auto size-10 mb-4 opacity-80" />
            <h2 className="text-2xl font-bold sm:text-3xl">
              আজই শুরু করুন — দেরি না করাই ভালো!
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
              প্রতিদিন হাজার হাজার প্রার্থী প্রস্তুতি নিচ্ছে। আপনি কি পিছিয়ে
              থাকবেন?
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 text-base shadow-lg"
              asChild
            >
              <Link href="/dashboard">
                <LogInIcon />
                এখনই জয়েন করুন
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-semibold text-sm">Farhan MCQ</p>
            <p className="text-xs text-muted-foreground">
              © 2026 Farhan Software. All rights reserved.
            </p>
          </div>
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
