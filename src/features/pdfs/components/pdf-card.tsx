"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Download, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { docTypeLabel, formatCount, formatFileSize } from "../constants";
import type { PdfDocument } from "../types";

interface PdfCardProps {
  pdf: PdfDocument;
  variant?: "default" | "featured";
}

export function PdfCard({ pdf, variant = "default" }: PdfCardProps) {
  return (
    <Link
      href={`/pdf-library/${pdf.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/30 hover:shadow-md",
        variant === "featured" && "sm:flex-row",
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5",
          variant === "featured"
            ? "aspect-[4/3] sm:aspect-auto sm:w-40"
            : "aspect-[4/3]",
        )}
      >
        <FileText className="size-10 text-primary/60" />
        <div className="absolute left-2 top-2 flex gap-1">
          {pdf.isFree && (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">ফ্রি</Badge>
          )}
        </div>
        {pdf.isFeatured && (
          <Badge className="absolute right-2 top-2 gap-1 bg-amber-500 hover:bg-amber-500">
            <Sparkles className="size-3" />
            ফিচার্ড
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge variant="secondary" className="w-fit text-xs">
          {docTypeLabel(pdf.docType)}
        </Badge>
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
          {pdf.title}
        </h3>
        {pdf.subject && (
          <p className="text-xs text-muted-foreground">{pdf.subject}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="size-3.5" />
            {formatCount(pdf.downloadCount)}
          </span>
          <span>{formatFileSize(pdf.fileSizeKb)}</span>
          {pdf.pageCount ? <span>{pdf.pageCount} পৃষ্ঠা</span> : null}
        </div>
      </div>
    </Link>
  );
}
