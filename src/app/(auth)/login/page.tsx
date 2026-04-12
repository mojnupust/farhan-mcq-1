"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, useAuth } from "@/features/auth";
import { loginSchema } from "@/features/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
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

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            MCQ প্ল্যাটফর্ম
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনার অ্যাকাউন্টে লগইন করুন
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mobile">মোবাইল নম্বর</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="01XXXXXXXXX"
              maxLength={11}
              {...register("mobile")}
            />
            {errors.mobile && (
              <p className="text-sm text-destructive">
                {errors.mobile.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input
              id="password"
              type="password"
              placeholder="আপনার পাসওয়ার্ড"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "লগইন হচ্ছে..." : "লগইন"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-sm text-primary hover:underline"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="text-primary hover:underline">
            রেজিস্ট্রেশন করুন
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            &larr; হোমে ফিরুন
          </Link>
        </p>
      </div>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">পাসওয়ার্ড রিসেট</h2>

            {resetStep === "mobile" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>মোবাইল নম্বর</Label>
                  <Input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    value={resetMobile}
                    onChange={(e) => setResetMobile(e.target.value)}
                  />
                </div>
                {resetError && (
                  <p className="text-sm text-destructive">{resetError}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
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
                    className="flex-1"
                  >
                    {resetLoading ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
                  </Button>
                </div>
              </div>
            )}

            {resetStep === "otp" && (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {resetMobile} নম্বরে OTP পাঠানো হয়েছে
                </p>
                <div className="space-y-2">
                  <Label>OTP কোড</Label>
                  <Input
                    type="text"
                    placeholder="৪ ডিজিট OTP"
                    maxLength={4}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                  />
                </div>
                {resetError && (
                  <p className="text-sm text-destructive">{resetError}</p>
                )}
                <Button
                  onClick={handleResetVerifyOtp}
                  disabled={resetLoading || resetOtp.length !== 4}
                  className="w-full"
                >
                  {resetLoading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
                </Button>
              </div>
            )}

            {resetStep === "password" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>নতুন পাসওয়ার্ড</Label>
                  <Input
                    type="password"
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <Input
                    type="password"
                    placeholder="পুনরায় পাসওয়ার্ড"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                  />
                </div>
                {resetError && (
                  <p className="text-sm text-destructive">{resetError}</p>
                )}
                <Button
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                  className="w-full"
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
