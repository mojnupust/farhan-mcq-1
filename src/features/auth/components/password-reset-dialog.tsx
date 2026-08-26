"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastSuccessAfterCommit } from "@/lib/safe-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { digitsOnly, normalizeBdMobile } from "../lib/mobile";
import { apiAuthService } from "../services/auth.api";
import { mockAuthService } from "../services/auth.mock";
import type { AuthService } from "../services/auth.service";

const authService: AuthService =
  process.env.USE_MOCKS === "true" ? mockAuthService : apiAuthService;

type ResetStep = "mobile" | "otp" | "password";

const STEP_META: Record<
  ResetStep,
  { title: string; description: string; index: number }
> = {
  mobile: {
    title: "পাসওয়ার্ড রিসেট",
    description: "আপনার অ্যাকাউন্টের মোবাইল নম্বরে OTP পাঠানো হবে।",
    index: 1,
  },
  otp: {
    title: "OTP যাচাই",
    description: "মেসেজে পাওয়া ৪ ডিজিটের কোডটি লিখুন।",
    index: 2,
  },
  password: {
    title: "নতুন পাসওয়ার্ড",
    description: "কমপক্ষে ৬ অক্ষরের একটি নতুন পাসওয়ার্ড দিন।",
    index: 3,
  },
};

type PasswordResetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMobile?: string;
};

export function PasswordResetDialog({
  open,
  onOpenChange,
  initialMobile = "",
}: PasswordResetDialogProps) {
  const [step, setStep] = useState<ResetStep>("mobile");
  const [mobile, setMobile] = useState(initialMobile);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("mobile");
      setMobile(normalizeBdMobile(initialMobile));
      setOtp("");
      setPassword("");
      setConfirm("");
      setShowPassword(false);
      setError("");
      setLoading(false);
    }
  }, [open, initialMobile]);

  function close() {
    onOpenChange(false);
  }

  async function sendOtp() {
    setError("");
    if (mobile.length !== 11) {
      setError("মোবাইল নম্বর ১১ ডিজিটের হতে হবে");
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

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.length !== 4) {
      setError("OTP ৪ ডিজিটের হতে হবে");
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

  async function handleResetPassword(e: React.FormEvent) {
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
      await authService.resetPassword({ mobile, password });
      close();
      toastSuccessAfterCommit(
        "পাসওয়ার্ড পরিবর্তন হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "পাসওয়ার্ড রিসেট ব্যর্থ");
    } finally {
      setLoading(false);
    }
  }

  const meta = STEP_META[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90dvh,100%)] w-full max-w-sm overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        aria-describedby="reset-password-description"
      >
        <DialogHeader className="text-left">
          <p className="text-xs font-medium text-muted-foreground">
            ধাপ {meta.index} / ৩
          </p>
          <DialogTitle>{meta.title}</DialogTitle>
          <DialogDescription id="reset-password-description">
            {step === "otp"
              ? `${mobile} নম্বরে OTP পাঠানো হয়েছে। ${meta.description}`
              : meta.description}
          </DialogDescription>
        </DialogHeader>

        {step === "mobile" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="reset-mobile">মোবাইল নম্বর</Label>
              <Input
                id="reset-mobile"
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
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={close}>
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={loading || mobile.length !== 11}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    পাঠানো হচ্ছে...
                  </>
                ) : (
                  "OTP পাঠান"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-otp">OTP কোড</Label>
              <Input
                id="reset-otp"
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
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full"
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
                disabled={loading}
                onClick={() => void sendOtp()}
              >
                আবার OTP পাঠান
              </Button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">নতুন পাসওয়ার্ড</Label>
              <div className="relative">
                <Input
                  id="reset-password"
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
              <Label htmlFor="reset-confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <Input
                id="reset-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="পুনরায় পাসওয়ার্ড"
                className="h-11 text-base"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  রিসেট হচ্ছে...
                </>
              ) : (
                "পাসওয়ার্ড সেট করুন"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
