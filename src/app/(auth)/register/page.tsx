"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth";
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
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            MCQ প্ল্যাটফর্ম
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </p>
        </div>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {(["mobile", "otp", "password"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : i < ["mobile", "otp", "password"].indexOf(step)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="h-px w-8 bg-muted" />}
            </div>
          ))}
        </div>

        <div className="mt-8">
          {step === "mobile" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">মোবাইল নম্বর</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন
                </p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleSendOtp}
                disabled={loading || mobile.length !== 11}
                size="lg"
                className="w-full"
              >
                {loading ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
              </Button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">{mobile}</span>{" "}
                নম্বরে ৪ ডিজিটের OTP পাঠানো হয়েছে
              </p>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP কোড</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="● ● ● ●"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-[0.5em]"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 4}
                size="lg"
                className="w-full"
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
                className="w-full text-center text-sm text-primary hover:underline"
              >
                আবার OTP পাঠান
              </button>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                আপনার অ্যাকাউন্টের জন্য পাসওয়ার্ড সেট করুন
              </p>
              <div className="space-y-2">
                <Label htmlFor="password">পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="পুনরায় পাসওয়ার্ড"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleRegister}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading
                  ? "রেজিস্ট্রেশন হচ্ছে..."
                  : "রেজিস্ট্রেশন সম্পন্ন করুন"}
              </Button>
            </div>
          )}
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
