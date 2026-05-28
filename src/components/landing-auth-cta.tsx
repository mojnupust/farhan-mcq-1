"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth";
import { LayoutDashboard, LogInIcon } from "lucide-react";
import Link from "next/link";

// ── Hero CTA ─────────────────────────────────────────────────────────────────

export function HeroCTA() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-12 w-72 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button size="lg" className="text-base shadow-lg" asChild>
          <Link href="/dashboard">
            <LayoutDashboard />
            ড্যাশবোর্ডে যান
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          ✅ আপনি ইতোমধ্যে সদস্য। স্বাগতম!
        </p>
      </div>
    );
  }

  return (
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
  );
}

// ── Final CTA Button ──────────────────────────────────────────────────────────

export function FinalCTAButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-8 h-12 w-48 animate-pulse rounded-lg bg-primary-foreground/20 mx-auto" />
    );
  }

  if (user) {
    return (
      <Button
        size="lg"
        variant="secondary"
        className="mt-8 text-base shadow-lg"
        asChild
      >
        <Link href="/dashboard">
          <LayoutDashboard />
          ড্যাশবোর্ডে যান
        </Link>
      </Button>
    );
  }

  return (
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
  );
}

// ── Pricing CTA Button ────────────────────────────────────────────────────────

export function PricingCTAButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-6 h-12 w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  if (user) {
    return (
      <Button className="mt-6 w-full text-base" size="lg" asChild>
        <Link href="/dashboard">
          <LayoutDashboard className="size-4" />
          ড্যাশবোর্ডে যান
        </Link>
      </Button>
    );
  }

  return (
    <Button className="mt-6 w-full text-base" size="lg" asChild>
      <Link href="/dashboard">
        <LogInIcon className="size-4" />
        এখনই শুরু করুন
      </Link>
    </Button>
  );
}
