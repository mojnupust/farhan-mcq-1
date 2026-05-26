"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, useAuth } from "@/features/auth";
import { loginSchema } from "@/features/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMobile, setResetMobile] = useState("");
  const [resetStep, setResetStep] = useState<"mobile" | "otp" | "password">(
    "mobile",
  );
  const [resetOtp, setResetOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setError("");
    try {
      await login(data);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে");
    }
  }

  async function handleResetSendOtp() {
    setResetError("");
    setResetLoading(true);
    try {
      await authService.sendOtp({ mobile: resetMobile });
      setResetStep("otp");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "OTP পাঠানো যায়নি");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleResetVerifyOtp() {
    setResetError("");
    setResetLoading(true);
    try {
      await authService.verifyOtp({ mobile: resetMobile, code: resetOtp });
      setResetStep("password");
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "OTP সঠিক নয়");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleResetPassword() {
    setResetError("");
    if (resetPassword.length < 6) {
      setResetError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setResetError("পাসওয়ার্ড মিলছে না");
      return;
    }
    setResetLoading(true);
    try {
      await authService.resetPassword({
        mobile: resetMobile,
        password: resetPassword,
      });
      setShowResetModal(false);
      setResetStep("mobile");
      setResetMobile("");
      setResetOtp("");
      setResetPassword("");
      setResetConfirm("");
    } catch (err) {
      setResetError(
        err instanceof Error ? err.message : "পাসওয়ার্ড রিসেট ব্যর্থ",
      );
    } finally {
      setResetLoading(false);
    }
  }

  const steps = ["mobile", "otp", "password"] as const;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900 via-blue-900 to-slate-900 px-4 py-10">
      <div className="absolute -left-8 top-20 size-72 rounded-full bg-purple-500/20 blur-3xl animate-float" />
      <div className="absolute right-0 top-0 size-80 rounded-full bg-blue-500/15 blur-3xl animate-float [animation-delay:500ms]" />
      <div className="absolute bottom-0 left-1/2 size-72 -translate-x-1/2 rounded-full bg-green-400/10 blur-3xl animate-float [animation-delay:900ms]" />

      <div className="glass relative mx-auto w-full max-w-sm rounded-2xl p-8 shadow-2xl">
        <div className="text-center text-white">
          <p className="inline-flex items-center gap-2 text-lg font-black">
            <Sparkles className="size-4 text-violet-300" />
            <span className="bg-gradient-to-r from-violet-200 to-blue-100 bg-clip-text text-transparent">
              Farhan MCQ
            </span>
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            MCQ প্ল্যাটফর্ম
          </h1>
          <p className="mt-2 text-sm text-violet-100/80">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-violet-100">
              মোবাইল নম্বর
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="01XXXXXXXXX"
              maxLength={11}
              className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
              {...register("mobile")}
            />
            {errors.mobile && (
              <p className="text-sm text-red-200">{errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-violet-100">
              পাসওয়ার্ড
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="আপনার পাসওয়ার্ড"
              className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-200">{errors.password.message}</p>
            )}
          </div>

          {error && <p className="text-center text-sm text-red-200">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
            disabled={isSubmitting}
          >
            <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-white/25 blur-md transition-transform duration-500 group-hover:translate-x-[320%]" />
            {isSubmitting ? "লগইন হচ্ছে..." : "লগইন"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-sm text-violet-100 underline-offset-4 transition hover:underline"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-violet-100/80">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="text-white transition hover:text-violet-200">
            রেজিস্ট্রেশন করুন
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-violet-100/80">
          <Link href="/" className="transition hover:text-white">
            &larr; হোমে ফিরুন
          </Link>
        </p>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="glass w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white">পাসওয়ার্ড রিসেট</h2>

            <div className="mt-4 flex items-center justify-center gap-2">
              {steps.map((step, index) => {
                const current = steps.indexOf(resetStep);
                const active = step === resetStep;
                const done = index < current;
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                        active
                          ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white"
                          : done
                            ? "bg-emerald-500/80 text-white"
                            : "bg-white/15 text-violet-100"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < 2 && <div className="h-px w-8 bg-white/20" />}
                  </div>
                );
              })}
            </div>

            {resetStep === "mobile" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-violet-100">মোবাইল নম্বর</Label>
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    value={resetMobile}
                    className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                    onChange={(e) => setResetMobile(e.target.value)}
                  />
                </div>
                {resetError && <p className="text-sm text-red-200">{resetError}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetStep("mobile");
                      setResetError("");
                    }}
                  >
                    বাতিল
                  </Button>
                  <Button
                    onClick={handleResetSendOtp}
                    disabled={resetLoading || resetMobile.length !== 11}
                    className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
                  >
                    {resetLoading ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
                  </Button>
                </div>
              </div>
            )}

            {resetStep === "otp" && (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-violet-100/80">
                  {resetMobile} নম্বরে OTP পাঠানো হয়েছে
                </p>
                <div className="space-y-2">
                  <Label className="text-violet-100">OTP কোড</Label>
                  <Input
                    type="text"
                    placeholder="৪ ডিজিট OTP"
                    maxLength={4}
                    value={resetOtp}
                    className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                    onChange={(e) => setResetOtp(e.target.value)}
                  />
                </div>
                {resetError && <p className="text-sm text-red-200">{resetError}</p>}
                <Button
                  onClick={handleResetVerifyOtp}
                  disabled={resetLoading || resetOtp.length !== 4}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
                >
                  {resetLoading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
                </Button>
              </div>
            )}

            {resetStep === "password" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-violet-100">নতুন পাসওয়ার্ড</Label>
                  <Input
                    type="password"
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    value={resetPassword}
                    className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-violet-100">পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <Input
                    type="password"
                    placeholder="পুনরায় পাসওয়ার্ড"
                    value={resetConfirm}
                    className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                    onChange={(e) => setResetConfirm(e.target.value)}
                  />
                </div>
                {resetError && <p className="text-sm text-red-200">{resetError}</p>}
                <Button
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
                >
                  {resetLoading ? "রিসেট হচ্ছে..." : "পাসওয়ার্ড রিসেট করুন"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
