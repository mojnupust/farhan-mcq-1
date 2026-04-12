"use client";

import { Badge } from "@/components/ui/badge";
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
import { subscriptionService, useSubscription } from "@/features/subscriptions";
import type { UserProfileDto } from "@/features/subscriptions/types";
import { Package, User } from "lucide-react";
import { useEffect, useState } from "react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const { activePackage } = useSubscription();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await subscriptionService.getProfile();
      setProfile(data);
      setName(data.name ?? "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await subscriptionService.updateProfile({ name });
      setProfile(updated);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "আপডেট ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">প্রোফাইল লোড করা যায়নি</p>
      </div>
    );
  }

  console.log("Rendering profile page", { profile, activePackage });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">প্রোফাইল</h1>
      <p className="text-sm text-muted-foreground">
        আপনার অ্যাকাউন্ট তথ্য দেখুন ও পরিবর্তন করুন
      </p>

      {/* Account Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <User className="size-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>{profile.name ?? "নাম নেই"}</CardTitle>
              <CardDescription>{profile.mobile}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">ইউজার ID</p>
              <p className="mt-1 font-mono text-xs">{profile.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">রোল</p>
              <Badge variant="secondary" className="mt-1">
                {profile.role === "ADMIN" ? "অ্যাডমিন" : "সদস্য"}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">যোগদান</p>
              <p className="mt-1 font-medium">
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Package */}
      {activePackage ? (
        <Card className="mt-4 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Package className="size-5 text-green-600" />
              <div>
                <p className="font-medium">{activePackage.packageName}</p>
                <p className="text-sm text-muted-foreground">
                  মেয়াদ: {formatDate(activePackage.startDate)} —{" "}
                  {formatDate(activePackage.endDate)}
                  {activePackage.packageLiveQuota && (
                    <span>
                      {" "}
                      · লাইভ: {activePackage.liveUsed}/
                      {activePackage.packageLiveQuota}
                    </span>
                  )}
                  {activePackage.packageArchiveQuota && (
                    <span>
                      {" "}
                      · আর্কাইভ: {activePackage.archiveUsed}/
                      {activePackage.packageArchiveQuota}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              কোনো সক্রিয় প্যাকেজ নেই। সাবস্ক্রিপশন পাতা থেকে প্যাকেজ কিনুন।
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Name */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">তথ্য পরিবর্তন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">নাম</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম"
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
