"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { formatFileSize } from "../constants";

interface PdfHeroPreviewProps {
  fileSizeKb?: number;
  pageCount?: number;
  onDownload: () => void;
  downloading?: boolean;
  lockReason?: "login" | "subscription" | null;
  loginHref?: string;
}

export function PdfHeroPreview({
  fileSizeKb,
  pageCount,
  onDownload,
  downloading,
  lockReason,
  loginHref = "/login",
}: PdfHeroPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card px-6 py-12 text-center sm:py-16">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        {lockReason ? (
          <Lock className="size-10" />
        ) : (
          <FileText className="size-10" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {formatFileSize(fileSizeKb)}
        {pageCount ? ` · ${pageCount} পৃষ্ঠা` : ""}
      </p>
      {lockReason === "login" && (
        <p className="max-w-sm text-sm text-amber-600">
          শুধু লগইন করা ব্যবহারকারী এই পিডিএফ ডাউনলোড করতে পারবেন।
        </p>
      )}
      {lockReason === "subscription" && (
        <p className="max-w-sm text-sm text-amber-600">
          এই পিডিএফটি পেইড — শুধু সক্রিয় সাবস্ক্রিপশনধারী ব্যবহারকারী ডাউনলোড
          করতে পারবেন।
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="lg" onClick={onDownload} disabled={downloading}>
          <Download className="mr-2 size-4" />
          {downloading ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড করুন"}
        </Button>
        {lockReason === "login" && (
          <Button size="lg" variant="outline" asChild>
            <Link href={loginHref}>লগইন করুন</Link>
          </Button>
        )}
        {lockReason === "subscription" && (
          <Button size="lg" variant="outline" asChild>
            <Link href="/subscriptions">সাবস্ক্রিপশন নিন</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
