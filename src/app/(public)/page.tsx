import { BrandLogo } from "@/components/brand-logo";

import { FinalCTAButton, HeroCTA } from "@/components/landing-auth-cta";
import { LandingFooter } from "@/components/landing-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimateIn } from "@/components/ui/animate-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  ListChecks,
  Lock,
  MessageCircle,
  PlayCircle,
  Radio,
  Star,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
  Video,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Pricing from "./Pricing";

export const metadata: Metadata = {
  title: "Farhan MCQ — সঠিক প্রস্তুতি, নিশ্চিত চাকরি",
  description:
    "BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA সহ সকল সরকারি চাকরির MCQ প্রস্তুতি নিন।",
  alternates: { canonical: "https://www.farhanmcq.com" },
  openGraph: {
    title: "Farhan MCQ — সঠিক প্রস্তুতি, নিশ্চিত চাকরি",
    description:
      "BCS, ব্যাংক ও প্রাইমারি শিক্ষক নিয়োগসহ সকল সরকারি চাকরির MCQ অনুশীলন করুন।",
    url: "https://www.farhanmcq.com",
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
  { id: 1, name: "সেন্ট্রাল জব সল্যুশন", slug: "central-job-solution", icon: "📖", count: "৫০০০+" },
  {
    id: 2,
    name: "সমাজসেবা অধিদপ্তর নিয়োগ প্রস্ততি",
    slug: "somaj-seba-niyog-prostuti",
    icon: "👩🏻‍💼",
    count: "১৫০০+",
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
    text: "মাত্র ৳৩৯/মাসে এত সুন্দর একটি প্ল্যাটফর্ম! কমিউনিটির সবাই অনেক সহযোগিতামূলক।",
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
      "bKash বা Nagad এর মাধ্যমে পেমেন্ট করা যায়। Phone Number দিয়ে সাইন ইন করার পর অ্যাডমিনের সাথে যোগাযোগ করলেই হবে — সম্পূর্ণ সহজ প্রক্রিয়া।",
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

const steps = [
  {
    icon: UserPlus,
    title: "Phone Number দিয়ে সাইন ইন করুন",
    description: "02 ধাপে আপনার অ্যাকাউন্ট তৈরি হবে।",
  },
  {
    icon: ListChecks,
    title: "আপনার পরীক্ষা বেছে নিন",
    description:
      "BCS, ব্যাংক, শিক্ষক নিয়োগ বা জব সলিউশন — যেটির প্রস্তুতি নিচ্ছেন সেটি নির্বাচন করুন।",
  },
  {
    icon: Trophy,
    title: "পরীক্ষা দিন, ফলাফল দেখুন",
    description:
      "লাইভ পরীক্ষা ও মডেল টেস্টে অংশ নিন এবং সাথে সাথে ব্যাখ্যাসহ উত্তর জানুন।",
  },
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Farhan MCQ",
    url: "https://www.farhanmcq.com",
    description: "সরকারি চাকরির MCQ প্রস্তুতি প্ল্যাটফর্ম",
    publisher: {
      "@type": "Organization",
      name: "Farhan Software",
      founder: { "@type": "Person", name: "Mojnu Miah" },
    },
    offers: {
      "@type": "Offer",
      price: "39",
      priceCurrency: "BDT",
      url: "https://www.farhanmcq.com/dashboard",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main id="main-content">
        {/* ── Hero ── */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-background to-background"
        >
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl animate-float-delayed" />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="max-w-2xl">
                <AnimateIn variant="fade-up" delay={50} duration={500}>
                  <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium text-foreground/80 shadow-sm">
                    <span
                      className="relative size-2 rounded-full bg-green-500"
                      aria-hidden="true"
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-75" />
                    </span>
                    ৪৫+ শিক্ষার্থী এখন প্রস্তুতি নিচ্ছেন
                  </p>
                </AnimateIn>

                <AnimateIn variant="fade-up" delay={100} duration={600}>
                  <h1
                    id="hero-heading"
                    className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]"
                  >
                    পরীক্ষার হলের মতো করেই প্রস্তুতি নিন
                  </h1>
                </AnimateIn>

                <AnimateIn variant="fade-up" delay={200} duration={600}>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                    BCS, ব্যাংক, প্রাইমারি শিক্ষক নিয়োগ ও NTRCA — সব পরীক্ষার
                    জন্য MCQ প্র্যাকটিস, লাইভ পরীক্ষা, মডেল টেস্ট এবং অভিজ্ঞ
                    মেন্টরের গাইডলাইন, একটিমাত্র প্ল্যাটফর্মে।
                  </p>
                </AnimateIn>

                <AnimateIn variant="fade-up" delay={300} duration={600}>
                  <HeroCTA />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Phone Number দিয়ে সাইন ইন করে এখনই শুরু করুন ·{" "}
                    <a
                      href="#pricing"
                      className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                    >
                      প্যাকেজ দেখুন
                    </a>
                  </p>
                </AnimateIn>
              </div>

              {/* Image + sample question */}
              <AnimateIn variant="fade-up" delay={350} duration={700}>
                <div className="relative mx-auto w-full max-w-md pb-2 lg:max-w-none sm:pb-10">
                  <div className="relative overflow-hidden rounded-2xl border bg-background shadow-xl">
                    <Image
                      src="/images/hero-illustration.png"
                      alt="Farhan MCQ প্ল্যাটফর্মে পরীক্ষার প্রস্তুতি"
                      width={640}
                      height={640}
                      priority
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  <figure className="relative -mt-12 mx-3 rounded-xl border bg-card p-4 shadow-lg sm:absolute sm:-bottom-2 sm:-left-6 sm:mx-0 sm:mt-0 sm:w-80">
                    <figcaption className="text-xs font-medium text-muted-foreground">
                      নমুনা প্রশ্ন
                    </figcaption>
                    <p className="mt-1 text-sm font-semibold leading-snug">
                      জাতীয় সংসদ ভবনের স্থপতি কে?
                    </p>
                    <ol className="mt-3 space-y-1.5 text-sm" type="A">
                      {[
                        { t: "মাজহারুল ইসলাম", ok: false },
                        { t: "লুই আই. কান", ok: true },
                        { t: "রবার্ট বয়েড", ok: false },
                      ].map((o, i) => (
                        <li
                          key={o.t}
                          className={
                            o.ok
                              ? "flex items-center gap-2 rounded-md border border-green-600/40 bg-green-500/10 px-2.5 py-1.5 font-medium"
                              : "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-muted-foreground"
                          }
                        >
                          <span
                            className={
                              o.ok
                                ? "flex size-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-[11px] text-white"
                                : "flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px]"
                            }
                            aria-hidden="true"
                          >
                            {["ক", "খ", "গ"][i]}
                          </span>
                          {o.t}
                          {o.ok ? (
                            <span className="sr-only"> (সঠিক উত্তর)</span>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Zap
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      />
                      উত্তর দিলেই সাথে সাথে ব্যাখ্যা পাবেন
                    </p>
                  </figure>
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section
          aria-label="Farhan MCQ এক নজরে"
          className="border-b bg-primary text-primary-foreground"
        >
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dd className="order-first text-2xl font-bold sm:text-3xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-sm opacity-80">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── How it works ── */}
        <section aria-labelledby="steps-heading" className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <AnimateIn variant="fade-up" duration={500}>
              <div className="mx-auto max-w-xl text-center">
                <h2
                  id="steps-heading"
                  className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  শুরু করতে লাগে মাত্র তিনটি ধাপ
                </h2>
                <p className="mt-2 text-muted-foreground">
                  অ্যাকাউন্ট খুলে আজই আপনার প্রথম পরীক্ষা দিন।
                </p>
              </div>
            </AnimateIn>

            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border bg-card p-6"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {["১", "২", "৩"][index]}
                    </span>
                    <step.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── MCQ Library ── */}
        <section
          aria-labelledby="library-heading"
          className="border-b bg-muted/40"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <AnimateIn variant="fade-up" duration={500}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2
                    id="library-heading"
                    className="text-2xl font-semibold tracking-tight sm:text-3xl"
                  >
                    আপনার পরীক্ষার MCQ লাইব্রেরি
                  </h2>
                  <p className="mt-1 text-muted-foreground">
                    ক্যাটাগরি বেছে নিন, সাইন ইন করুন এবং প্র্যাকটিস শুরু করুন।
                  </p>
                </div>
                <BookOpen
                  className="hidden size-8 text-muted-foreground sm:block"
                  aria-hidden="true"
                />
              </div>
            </AnimateIn>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/exams/${category.slug}`}
                    className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Card className="h-full transition-colors group-hover:border-primary/50">
                      <CardHeader className="pb-3">
                        <span
                          className="inline-block text-3xl transition-transform duration-300 group-hover:scale-110"
                          aria-hidden="true"
                        >
                          {category.icon}
                        </span>
                        <CardTitle className="mt-2 text-base">
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <PlayCircle className="size-4" aria-hidden="true" />
                            {category.count} MCQ
                          </span>
                          <span className="flex items-center gap-1 text-xs">
                            <Lock className="size-3.5" aria-hidden="true" />
                            সাইন ইন প্রয়োজন
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section aria-labelledby="benefits-heading" className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <AnimateIn variant="fade-up" duration={500}>
              <div className="mx-auto max-w-xl text-center">
                <h2
                  id="benefits-heading"
                  className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                  সদস্য হলে যা যা পাবেন
                </h2>
                <p className="mt-2 text-muted-foreground">
                  সরকারি চাকরির প্রস্তুতির সবকিছু এক জায়গায়।
                </p>
              </div>
            </AnimateIn>

            <ul className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <benefit.icon
                      className="size-5 text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section
          aria-labelledby="testimonials-heading"
          className="border-b bg-muted/40"
        >
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <AnimateIn variant="fade-up" duration={500}>
              <h2
                id="testimonials-heading"
                className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                শিক্ষার্থীরা কী বলছেন
              </h2>
            </AnimateIn>

            <ul className="mt-10 grid gap-6 sm:grid-cols-3">
              {testimonials.map((t) => (
                <li key={t.name}>
                  <figure className="flex h-full flex-col rounded-2xl border bg-card p-6">
                    <div
                      className="flex gap-0.5"
                      role="img"
                      aria-label={`${t.stars} স্টার রেটিং`}
                    >
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star
                          key={i}
                          className="size-4 fill-yellow-400 text-yellow-400"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="mt-3 flex-1 leading-relaxed text-foreground/90">
                      &quot;{t.text}&quot;
                    </blockquote>
                    <figcaption className="mt-5 border-t pt-4">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Pricing ── */}
        <Pricing />

        {/* ── About ── */}
        <section aria-labelledby="about-heading" className="border-b">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <AnimateIn variant="fade-up" duration={500}>
              <h2
                id="about-heading"
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                আমাদের সম্পর্কে
              </h2>
              <div className="mt-6 max-w-2xl">
                <BrandLogo
                  orientation="stacked"
                  showSubtitle
                  iconClassName="size-12"
                  titleClassName="text-xl"
                  subtitleClassName="max-w-md text-sm"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Farhan Software | প্রতিষ্ঠাতা: Mojnu Miah
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  প্রস্তুতির শুরুতেই সঠিক দিকনির্দেশনা পেলে সময় অনেকটাই বাঁচানো
                  সম্ভব। Farhan MCQ আপনাকে শুরু থেকেই একটি পরিষ্কার roadmap
                  দেয়। আমাদের লক্ষ্য — প্রতিটি শিক্ষার্থীকে এমনভাবে প্রস্তুত
                  করা যেন তারা আত্মবিশ্বাসের সাথে যেকোনো পরীক্ষায় অংশ নিতে
                  পারে।
                </p>
                <blockquote className="mt-5 border-l-2 border-primary/40 pl-4 text-sm italic text-muted-foreground">
                  <p>
                    &quot;ক্ষুধার রাজ্যে পৃথিবী গদ্যময়, পূর্ণিমার চাঁদ যেন
                    ঝলসানো রুটি&quot;
                  </p>
                  <footer className="mt-1 not-italic">
                    — কবি সুকান্ত ভট্টাচার্য, আমাদের অনুপ্রেরণা
                  </footer>
                </blockquote>
              </div>
            </AnimateIn>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section aria-labelledby="faq-heading" className="bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
            <h2
              id="faq-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              সাধারণ প্রশ্নের উত্তর
            </h2>
            <p className="mt-2 text-muted-foreground">
              সাইন আপ করার আগে যা জানতে চাইতে পারেন।
            </p>
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

        {/* ── Final CTA ── */}
        <section
          aria-labelledby="cta-heading"
          className="relative overflow-hidden border-y bg-primary text-primary-foreground"
        >
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-20 -right-20 size-60 rounded-full bg-white/5 blur-2xl animate-float" />
            <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-white/5 blur-2xl animate-float-delayed" />
          </div>
          <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <AnimateIn variant="scale-up" duration={600}>
              <Clock
                className="mx-auto mb-4 size-10 opacity-80"
                aria-hidden="true"
              />
              <h2 id="cta-heading" className="text-2xl font-bold sm:text-3xl">
                আজই অ্যাকাউন্ট খুলুন, আজই প্রথম পরীক্ষা দিন
              </h2>
              <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
                প্রতিটি দিনের প্রস্তুতি আপনাকে চাকরির এক ধাপ কাছে নিয়ে যায়।
              </p>
              <FinalCTAButton />
            </AnimateIn>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
