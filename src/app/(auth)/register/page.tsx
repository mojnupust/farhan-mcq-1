"use client";

import { BrandMark } from "@/components/brand-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService, useAuth } from "@/features/auth";
import { digitsOnly, normalizeBdMobile } from "@/features/auth/lib/mobile";
import { AlertCircle, Eye, EyeOff, House, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Step = "mobile" | "otp" | "password";

function nextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: completeRegister } = useAuth();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  async function sendOtp() {
    setError("");
    if (mobile.length !== 11) {
      setError("মোবাইল নম্বর ১১ ডিজিটের হতে হবে");
      return;
    }
    setLoading(true);
    try {
      const result = await authService.sendOtp({ mobile });
      if (!result.isNewUser) {
        setError("এই নম্বরে অ্যাকাউন্ট আছে। লগইন করুন।");
        return;
      }
      setStep("otp");
      setResendIn(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP পাঠানো যায়নি");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length !== 4) {
      setError("OTP ৪ ডিজিটের হতে হবে");
      return;
    }
    setLoading(true);
    try {
      const result = await authService.verifyOtp({ mobile, code: otp });
      if (!result.isNewUser) {
        setError("এই নম্বরে অ্যাকাউন্ট আছে। লগইন করুন।");
        return;
      }
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP সঠিক নয়");
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে");
      return;
    }
    if (password !== confirm) {
      setError("পাসওয়ার্ড মিলছে না");
      return;
    }
    setLoading(true);
    try {
      await completeRegister({ mobile, password });
      router.push(nextPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "রেজিস্ট্রেশন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  const stepLabel =
    step === "mobile" ? "ধাপ ১ / ৩" : step === "otp" ? "ধাপ ২ / ৩" : "ধাপ ৩ / ৩";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-start px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 sm:justify-center sm:pt-6">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <Link
            href="/"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <BrandMark className="size-12" />
            <span className="sr-only">হোমে ফিরুন</span>
          </Link>
          <p className="mt-3 text-lg font-semibold tracking-tight">
            Farhan MCQ
          </p>
        </div>

        <Card className="gap-0 border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader className="px-0 text-center sm:px-6">
            <p className="text-xs font-medium text-muted-foreground">{stepLabel}</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              নতুন একাউন্ট
            </h1>
            <CardDescription>
              {step === "mobile"
                ? "মোবাইল নম্বরে OTP পাঠিয়ে রেজিস্ট্রেশন শুরু করুন"
                : step === "otp"
                  ? `${mobile} নম্বরে OTP পাঠানো হয়েছে`
                  : "পাসওয়ার্ড সেট করে অ্যাকাউন্ট খুলুন"}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6 sm:px-6">
            {step === "mobile" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendOtp();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="reg-mobile">মোবাইল নম্বর</Label>
                  <Input
                    id="reg-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className="h-11 text-base"
                    value={mobile}
                    onChange={(e) => setMobile(normalizeBdMobile(e.target.value))}
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    ১১ ডিজিট, যেমন 017XXXXXXXX
                  </p>
                </div>
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      {error}{" "}
                      {error.includes("অ্যাকাউন্ট আছে") ? (
                        <Link href="/login" className="font-medium underline">
                          লগইন
                        </Link>
                      ) : null}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-base"
                  disabled={loading || mobile.length !== 11}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      OTP পাঠানো হচ্ছে...
                    </>
                  ) : (
                    "OTP পাঠান"
                  )}
                </Button>
              </form>
            ) : null}

            {step === "otp" ? (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-otp">OTP কোড</Label>
                  <Input
                    id="reg-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="৪ ডিজিট"
                    maxLength={4}
                    className="h-11 text-center text-base tracking-[0.4em]"
                    value={otp}
                    onChange={(e) => setOtp(digitsOnly(e.target.value, 4))}
                    autoFocus
                  />
                </div>
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>
                      {error}{" "}
                      {error.includes("অ্যাকাউন্ট আছে") ? (
                        <Link href="/login" className="font-medium underline">
                          লগইন
                        </Link>
                      ) : null}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-base"
                  disabled={loading || otp.length !== 4}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      যাচাই হচ্ছে...
                    </>
                  ) : (
                    "যাচাই করুন"
                  )}
                </Button>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError("");
                      setOtp("");
                      setStep("mobile");
                    }}
                  >
                    নম্বর বদলান
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={loading || resendIn > 0}
                    onClick={() => void sendOtp()}
                  >
                    {resendIn > 0 ? `${resendIn} সে. পরে আবার` : "আবার OTP পাঠান"}
                  </Button>
                </div>
              </form>
            ) : null}

            {step === "password" ? (
              <form onSubmit={submitPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-password">পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="h-11 pr-11 text-base"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
                  <Input
                    id="reg-confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="পুনরায় পাসওয়ার্ড"
                    className="h-11 text-base"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      অ্যাকাউন্ট খোলা হচ্ছে...
                    </>
                  ) : (
                    "অ্যাকাউন্ট খুলুন"
                  )}
                </Button>
              </form>
            ) : null}
          </CardContent>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
            <span className="text-muted-foreground">অ্যাকাউন্ট আছে?</span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              লগইন করুন
            </Link>
          </div>
        </Card>
        <div className="flex w-full justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <House className="size-4" />
            হোমে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
