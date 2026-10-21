"use client";

import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function McqSignupCard() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname || "/");
  const href = user
    ? ROUTES.dashboard
    : `${ROUTES.register}?next=${next}`;

  if (isLoading) {
    return (
      <div
        className="h-80 animate-pulse rounded-md bg-muted"
        aria-hidden
      />
    );
  }

  return (
    <section
      aria-labelledby="mcq-signup-heading"
      className="flex w-full flex-col gap-5 rounded-md p-5 text-white shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25)]"
      style={{
        background: "linear-gradient(180deg, #EA0039 0%, #2B07A3 100%)",
      }}
    >
      <div className="overflow-hidden rounded-md bg-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative promo art */}
        <img
          src="/images/mcq-signup-card.png"
          alt="Farhan MCQ-তে MCQ অনুশীলন"
          className="h-40 w-full object-cover"
        />
      </div>

      <div className="text-center">
        <h2
          id="mcq-signup-heading"
          className="text-[1.35rem] font-bold leading-snug"
        >
          {user
            ? "আরও প্রশ্নে অনুশীলন চালিয়ে যান"
            : "ফ্রি অ্যাকাউন্ট খুলে পুরো প্রশ্নব্যাংক খুলুন"}
        </h2>
        <p className="mt-2 text-sm font-medium text-white/90">
          {user
            ? "লাইভ পরীক্ষা, ব্যাখ্যা ও দৈনিক স্ট্রিক — সব ড্যাশবোর্ডে।"
            : "BCS, ব্যাংক ও শিক্ষক নিয়োগের MCQ, লাইভ পরীক্ষা ও ব্যাখ্যা — এক অ্যাকাউন্টে।"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <Link
          href={href}
          className="inline-flex h-10 min-w-40 items-center justify-center bg-white px-4 text-sm font-semibold text-[#0E101A] shadow-[inset_0_-4px_8px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90"
        >
          {user ? "ড্যাশবোর্ডে যান" : "আজই ফ্রি শুরু করুন"}
        </Link>
        {!user ? (
          <p className="text-center text-xs font-medium text-white/90">
            কার্ড লাগবে না · মোবাইলে OTP দিয়ে খুলুন
          </p>
        ) : null}
      </div>
    </section>
  );
}
