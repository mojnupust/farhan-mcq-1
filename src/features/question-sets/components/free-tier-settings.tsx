"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { questionSetService } from "../index";
import type { AppSettings } from "../types";

export function FreeTierSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [freeLiveLimit, setFreeLiveLimit] = useState(3);
  const [freeArchiveLimit, setFreeArchiveLimit] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await questionSetService.getAppSettings();
        setSettings(data);
        setFreeLiveLimit(data.freeLiveLimit);
        setFreeArchiveLimit(data.freeArchiveLimit);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const updated = await questionSetService.updateAppSettings({
        freeLiveLimit,
        freeArchiveLimit,
      });
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <Card className="mt-6">
        <CardContent className="py-6 text-center text-muted-foreground">
          লোড হচ্ছে...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">ফ্রি টিয়ার সেটিংস</CardTitle>
        <CardDescription>
          প্রতিটি সদস্য বিনামূল্যে কতটি লাইভ ও আর্কাইভ পরীক্ষায় অংশ নিতে পারবে
          তা নির্ধারণ করুন। পৃথকভাবে &quot;ফ্রি&quot; চিহ্নিত প্রশ্নসেটগুলো এই
          সীমার বাইরে সর্বদা বিনামূল্যে।
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="free-live">ফ্রি লাইভ পরীক্ষা সীমা</Label>
              <Input
                id="free-live"
                type="number"
                min={0}
                value={freeLiveLimit}
                onChange={(e) =>
                  setFreeLiveLimit(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                সদস্য সর্বোচ্চ এতগুলো নন-ফ্রি লাইভ পরীক্ষায় অংশ নিতে পারবে
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="free-archive">ফ্রি আর্কাইভ পরীক্ষা সীমা</Label>
              <Input
                id="free-archive"
                type="number"
                min={0}
                value={freeArchiveLimit}
                onChange={(e) =>
                  setFreeArchiveLimit(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                সদস্য সর্বোচ্চ এতগুলো নন-ফ্রি আর্কাইভ পরীক্ষায় অংশ নিতে পারবে
              </p>
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving
              ? "সংরক্ষণ হচ্ছে..."
              : saved
                ? "সংরক্ষিত ✓"
                : "সংরক্ষণ করুন"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
