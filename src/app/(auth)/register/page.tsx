"use client";

import { BrandMark } from "@/components/brand-logo";
import { RegistrationClosedNotice } from "@/features/auth";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="flex flex-col items-center">
          <BrandMark />
          <h1 className="text-2xl font-semibold tracking-tight">Farhan MCQ</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            নতুন অ্যাকাউন্ট নিতে আমাদের সাথে যোগাযোগ করুন
          </p>
        </div>

        <div className="mt-8">
          <RegistrationClosedNotice />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-primary hover:underline">
            লগইন করুন
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            &larr; হোমে ফিরুন
          </Link>
        </p>
      </div>
    </div>
  );
}
