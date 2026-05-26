"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "mobile" | "otp" | "password";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    setError("");
    if (mobile.length !== 11 || !/^01[3-9]\d{8}$/.test(mobile)) {
      setError("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp({ mobile });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError("");
    if (otp.length !== 4) {
      setError("৪ ডিজিটের OTP দিন");
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp({ mobile, code: otp });
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP সঠিক নয়");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setError("");
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }
    setLoading(true);
    try {
      await authService.register({ mobile, password });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ui-shell flex items-center justify-center bg-gradient-to-br from-violet-900 via-blue-900 to-slate-900 px-4 py-10">
      <div className="absolute -left-8 top-20 size-72 rounded-full bg-purple-500/20 blur-3xl animate-float" />
      <div className="absolute right-0 top-0 size-80 rounded-full bg-blue-500/15 blur-3xl animate-float [animation-delay:500ms]" />
      <div className="absolute bottom-0 left-1/2 size-72 -translate-x-1/2 rounded-full bg-green-400/10 blur-3xl animate-float [animation-delay:900ms]" />

      <div className="glass-strong ui-content relative mx-auto w-full max-w-sm rounded-2xl p-8 shadow-2xl">
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
          <p className="mt-2 text-sm text-violet-100/80">নতুন অ্যাকাউন্ট তৈরি করুন</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {(["mobile", "otp", "password"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white"
                    : i < ["mobile", "otp", "password"].indexOf(step)
                      ? "bg-emerald-500/80 text-white"
                      : "bg-white/15 text-violet-100"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="h-px w-8 bg-white/20" />}
            </div>
          ))}
        </div>

        <div className="mt-8">
          {step === "mobile" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-violet-100">
                  মোবাইল নম্বর
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  autoFocus
                  className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-violet-100/70">
                  ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন
                </p>
              </div>
              {error && <p className="text-sm text-red-200">{error}</p>}
              <Button
                onClick={handleSendOtp}
                disabled={loading || mobile.length !== 11}
                size="lg"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
              >
                {loading ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
              </Button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-violet-100/80">
                <span className="font-medium text-white">{mobile}</span> নম্বরে ৪ ডিজিটের
                OTP পাঠানো হয়েছে
              </p>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-violet-100">
                  OTP কোড
                </Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="● ● ● ●"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="h-12 rounded-xl border-white/30 bg-white/10 text-center text-2xl tracking-[0.5em] text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-200">{error}</p>}
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 4}
                size="lg"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
              >
                {loading ? "যাচাই হচ্ছে..." : "যাচাই করুন"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setOtp("");
                  setError("");
                  handleSendOtp();
                }}
                className="w-full text-center text-sm text-violet-100 underline-offset-4 transition hover:underline"
              >
                আবার OTP পাঠান
              </button>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-violet-100/80">
                আপনার অ্যাকাউন্টের জন্য পাসওয়ার্ড সেট করুন
              </p>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-violet-100">
                  পাসওয়ার্ড
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-violet-100">
                  পাসওয়ার্ড নিশ্চিত করুন
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="পুনরায় পাসওয়ার্ড"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-violet-100/70 focus:ring-2 focus:ring-violet-500"
                />
              </div>
              {error && <p className="text-sm text-red-200">{error}</p>}
              <Button
                onClick={handleRegister}
                disabled={loading}
                size="lg"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500"
              >
                {loading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন সম্পন্ন করুন"}
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-violet-100/80">
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-white transition hover:text-violet-200">
            লগইন করুন
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-violet-100/80">
          <Link href="/" className="transition hover:text-white">
            &larr; হোমে ফিরুন
          </Link>
        </p>
      </div>
    </div>
  );
}
