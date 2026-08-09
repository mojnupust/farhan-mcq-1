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
  locked?: boolean;
}

// There's no real thumbnail/first-page render pipeline yet, so this is a
// deliberately simple centerpiece — icon + meta + the one action that
// actually matters (download) — rather than a broken iframe pointed at a
// placeholder URL.
export function PdfHeroPreview({
  fileSizeKb,
  pageCount,
  onDownload,
  downloading,
  locked,
}: PdfHeroPreviewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card px-6 py-12 text-center sm:py-16">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        {locked ? (
          <Lock className="size-10" />
        ) : (
          <FileText className="size-10" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {formatFileSize(fileSizeKb)}
        {pageCount ? ` · ${pageCount} পৃষ্ঠা` : ""}
      </p>
      {locked ? (
        <>
          <p className="max-w-xs text-sm text-amber-600">
            এই পিডিএফটি প্রিমিয়াম — ডাউনলোড করতে সাবস্ক্রিপশন লাগবে।
          </p>
          <Button size="lg" asChild>
            <Link href="/subscriptions">সাবস্ক্রিপশন নিন</Link>
          </Button>
        </>
      ) : (
        <Button size="lg" onClick={onDownload} disabled={downloading}>
          <Download className="mr-2 size-4" />
          {downloading ? "ডাউনলোড হচ্ছে..." : "ডাউনলোড করুন"}
        </Button>
      )}
    </div>
  );
}
