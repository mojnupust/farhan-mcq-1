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
import {
  PasswordResetDialog,
  RegistrationClosedDialog,
  useAuth,
} from "@/features/auth";
import { normalizeBdMobile } from "@/features/auth/lib/mobile";
import { loginSchema } from "@/features/auth/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, House, Loader2 } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [resetMobile, setResetMobile] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: "", password: "" },
  });

  const mobileRegister = register("mobile");

  function openResetModal() {
    setResetMobile(getValues("mobile") ?? "");
    setShowResetModal(true);
  }

  async function onSubmit(data: LoginForm) {
    setError("");
    try {
      await login(data);
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/dashboard";
      router.push(safeNext);
    } catch (err) {
      setError(err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে");
    }
  }

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
            <h1 className="text-2xl font-semibold tracking-tight">লগইন</h1>
            <CardDescription>
              মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে আপনার অ্যাকাউন্টে প্রবেশ করুন
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6 sm:px-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">মোবাইল নম্বর</Label>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  className="h-11 text-base"
                  aria-invalid={!!errors.mobile}
                  aria-describedby={errors.mobile ? "mobile-error" : undefined}
                  {...mobileRegister}
                  onChange={(e) => {
                    e.target.value = normalizeBdMobile(e.target.value);
                    void mobileRegister.onChange(e);
                  }}
                />
                {errors.mobile ? (
                  <p id="mobile-error" className="text-sm text-destructive">
                    {errors.mobile.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    ১১ ডিজিট, যেমন 017XXXXXXXX
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  <button
                    type="button"
                    onClick={openResetModal}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    ভুলে গেছেন?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="আপনার পাসওয়ার্ড"
                    className="h-11 pr-11 text-base"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    {...register("password")}
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
                {errors.password ? (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    লগইন হচ্ছে...
                  </>
                ) : (
                  "লগইন করুন"
                )}
              </Button>
            </form>
          </CardContent>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm">
            <span className="text-muted-foreground">অ্যাকাউন্ট নেই?</span>
            <button
              type="button"
              onClick={() => setShowRegisterDialog(true)}
              className="font-medium text-primary hover:underline"
            >
              নতুন একাউন্ট খুলুন
            </button>
          </div>
        </Card>
        <div className="w-full flex justify-center px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <House className="size-4" />
            হোমে ফিরুন
          </Link>
        </div>
      </div>

      <RegistrationClosedDialog
        open={showRegisterDialog}
        onOpenChange={setShowRegisterDialog}
      />

      <PasswordResetDialog
        open={showResetModal}
        onOpenChange={setShowResetModal}
        initialMobile={resetMobile}
      />
    </div>
  );
}
