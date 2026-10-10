"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Switch } from "@/components/ui/switch";
import {
  rewardConfigService,
  type RewardConfig,
  type UpdateRewardConfigInput,
} from "@/features/reward-config";
import { formatBdt } from "@/features/wallet";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FormState = Omit<
  RewardConfig,
  "id" | "updatedBy" | "createdAt" | "updatedAt"
>;

function toForm(config: RewardConfig): FormState {
  return {
    streakRateMinorUnitsPerDay: config.streakRateMinorUnitsPerDay,
    streakFreeDays: config.streakFreeDays,
    streakPremiumDays: config.streakPremiumDays,
    streakActivityGateFromDay: config.streakActivityGateFromDay,
    streakGateMinQuestions: config.streakGateMinQuestions,
    streakGateMinSeconds: config.streakGateMinSeconds,
    streakFreezesFreePerMonth: config.streakFreezesFreePerMonth,
    streakFreezesPremiumPerMonth: config.streakFreezesPremiumPerMonth,
    withdrawalMinMinorUnits: config.withdrawalMinMinorUnits,
    withdrawalRequiresVerifiedPhone: config.withdrawalRequiresVerifiedPhone,
    monthlyBudgetMinorUnits: config.monthlyBudgetMinorUnits,
  };
}

export default function AdminRewardConfigPage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    rewardConfigService
      .get()
      .then((config) => setForm(toForm(config)))
      .catch((err) => {
        setLoadError(true);
        toast.error(err instanceof Error ? err.message : "লোড হয়নি");
      })
      .finally(() => setLoading(false));
  }, []);

  function setNumber(key: keyof FormState, value: string) {
    if (!form) return;
    setForm({ ...form, [key]: Number(value) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      const input: UpdateRewardConfigInput = { ...form };
      const saved = await rewardConfigService.update(input);
      setForm(toForm(saved));
      toast.success("রিওয়ার্ড কনফিগ সেভ হয়েছে");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "সেভ হয়নি");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <ContentSkeleton />
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <p className="text-sm text-muted-foreground">কনফিগ লোড করা যায়নি।</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          রিওয়ার্ড কনফিগ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          স্ট্রিক রেট, সাইকেল, অ্যাকটিভিটি গেট এবং মাসিক বাজেট — পরিমাণ পয়সায়
          (১০০ = ১ টাকা)।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">দৈনিক স্ট্রিক</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="প্রতি দিন রেট (পয়সা)"
              hint={formatBdt(form.streakRateMinorUnitsPerDay)}
              value={form.streakRateMinorUnitsPerDay}
              onChange={(v) => setNumber("streakRateMinorUnitsPerDay", v)}
            />
            <Field
              label="ফ্রি সাইকেল (দিন)"
              value={form.streakFreeDays}
              onChange={(v) => setNumber("streakFreeDays", v)}
            />
            <Field
              label="প্রিমিয়াম সাইকেল (দিন)"
              value={form.streakPremiumDays}
              onChange={(v) => setNumber("streakPremiumDays", v)}
            />
            <Field
              label="গেট শুরু (দিন নম্বর)"
              value={form.streakActivityGateFromDay}
              onChange={(v) => setNumber("streakActivityGateFromDay", v)}
            />
            <Field
              label="মিনিমাম প্রশ্ন"
              value={form.streakGateMinQuestions}
              onChange={(v) => setNumber("streakGateMinQuestions", v)}
            />
            <Field
              label="মিনিমাম সেকেন্ড"
              value={form.streakGateMinSeconds}
              onChange={(v) => setNumber("streakGateMinSeconds", v)}
            />
            <Field
              label="ফ্রি ফ্রিজ / মাস"
              value={form.streakFreezesFreePerMonth}
              onChange={(v) => setNumber("streakFreezesFreePerMonth", v)}
            />
            <Field
              label="প্রিমিয়াম ফ্রিজ / মাস"
              value={form.streakFreezesPremiumPerMonth}
              onChange={(v) => setNumber("streakFreezesPremiumPerMonth", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">বাজেট ও উইথড্রয়াল</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field
              label="মাসিক বাজেট (পয়সা)"
              hint={formatBdt(form.monthlyBudgetMinorUnits)}
              value={form.monthlyBudgetMinorUnits}
              onChange={(v) => setNumber("monthlyBudgetMinorUnits", v)}
            />
            <Field
              label="মিনিমাম উইথড্রয়াল (পয়সা)"
              hint={formatBdt(form.withdrawalMinMinorUnits)}
              value={form.withdrawalMinMinorUnits}
              onChange={(v) => setNumber("withdrawalMinMinorUnits", v)}
            />
            <div className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
              <div>
                <Label htmlFor="verified-phone">ভেরিফায়েড ফোন লাগবে</Label>
                <p className="text-xs text-muted-foreground">
                  উইথড্রয়ালের আগে মোবাইল ভেরিফিকেশন
                </p>
              </div>
              <Switch
                id="verified-phone"
                checked={form.withdrawalRequiresVerifiedPhone}
                onCheckedChange={(checked) =>
                  setForm({ ...form, withdrawalRequiresVerifiedPhone: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        step={1}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
