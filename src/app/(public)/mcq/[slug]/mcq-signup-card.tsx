"use client";

import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// শুধু কোডে যাচাইকৃত সুবিধা: ব্যাখ্যা, লাইভ পরীক্ষা + র‍্যাংকিং, /earn স্ট্রিক।
const GUEST_BENEFITS = [
  "প্রতিটি প্রশ্নের ব্যাখ্যাসহ উত্তর",
  "রুটিন অনুযায়ী লাইভ পরীক্ষা ও র‍্যাংকিং",
  "দৈনিক চেক-ইন স্ট্রিক ও ওয়ালেট",
] as const;

type McqSignupCardProps = {
  /** যেমন "৪৭তম বিসিএস" — দিলে কপি পেজ-সচেতন হয়, না দিলে সাধারণ কপি। */
  subExamName?: string;
  /** লগইন করা ইউজারের CTA-র গন্তব্য; না দিলে ড্যাশবোর্ড। */
  subExamHref?: string;
};

export function McqSignupCard({
  subExamName,
  subExamHref,
}: McqSignupCardProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");

  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="লোড হচ্ছে"
        className="h-[28rem] animate-pulse rounded-xl bg-muted"
      />
    );
  }

  const href = user
    ? (subExamHref ?? ROUTES.dashboard)
    : `${ROUTES.register}?next=${next}`;

  return (
    <section
      aria-labelledby="mcq-signup-heading"
      className="flex w-full flex-col gap-4 rounded-xl p-4 text-white shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25)]"
      style={{
        background: "linear-gradient(160deg, #0D1B2E 0%, #0F4C4F 100%)",
      }}
    >
      <figure className="m-0 overflow-hidden rounded-lg">
        <Image
          src="/images/mcq-signup-card.webp"
          alt="হাসিমুখে শিক্ষিকা ও তিন শিক্ষার্থী ল্যাপটপ-ট্যাবলেটে MCQ সমাধান করছে"
          width={1200}
          height={600}
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 480px, 100vw"
          className="h-40 w-full object-cover object-center"
        />
      </figure>

      <div className="text-center">
        {!user ? (
          <p className="mb-2 inline-block rounded-full bg-[#F49E0B]/15 px-3 py-0.5 text-xs font-semibold text-[#F49E0B]">
            ফ্রি অ্যাকাউন্ট
          </p>
        ) : null}
        <h2
          id="mcq-signup-heading"
          className="text-xl font-bold leading-snug text-balance"
        >
          {user
            ? "আজকের অনুশীলন চালিয়ে যান"
            : "উত্তর তো দেখলেন — এবার নিজে পরীক্ষা দিয়ে যাচাই করুন"}
        </h2>
        <p className="mt-2 text-sm font-medium text-white/85">
          {user
            ? "লাইভ পরীক্ষা, ব্যাখ্যা ও দৈনিক স্ট্রিক — সব ড্যাশবোর্ডে এক জায়গায়।"
            : subExamName
              ? `${subExamName}-এর MCQ, লাইভ পরীক্ষা ও ব্যাখ্যা — এক অ্যাকাউন্টেই।`
              : "BCS, ব্যাংক ও শিক্ষক নিয়োগের MCQ, লাইভ পরীক্ষা ও ব্যাখ্যা — এক অ্যাকাউন্টেই।"}
        </p>
      </div>

      {!user ? (
        <ul className="flex flex-col gap-2 text-sm font-medium">
          {GUEST_BENEFITS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-[#F49E0B]"
                strokeWidth={3}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col items-center gap-2">
        <Link
          href={href}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#F49E0B] px-4 text-sm font-bold text-[#0D1B2E] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.2)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {user ? "ড্যাশবোর্ডে যান" : "ফ্রি অ্যাকাউন্ট খুলুন"}
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
        <p className="text-center text-xs font-medium text-white/80">
          {user ? (
            <Link href={ROUTES.earn} className="underline underline-offset-2">
              আজকের চেক-ইন করুন
            </Link>
          ) : (
            "মোবাইল নম্বর ও OTP দিয়েই খুলুন"
          )}
        </p>
      </div>
    </section>
  );
}
