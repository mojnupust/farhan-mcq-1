"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import { formatFileSize } from "../constants";

interface PdfPreviewProps {
  fileUrl: string;
  title?: string;
  fileSizeKb?: number;
  pageCount?: number;
}

// There's no backend to generate a real first-page thumbnail yet, so this
// renders a lightweight file card instead of an <iframe> preview — good
// enough to confirm the link looks right before saving.
export function PdfPreview({
  fileUrl,
  title,
  fileSizeKb,
  pageCount,
}: PdfPreviewProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
        <FileText className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title || "PDF ফাইল"}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileSizeKb)}
          {pageCount ? ` · ${pageCount} পৃষ্ঠা` : ""}
        </p>
      </div>
      <Button asChild variant="outline" size="sm" type="button">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1.5 size-3.5" />
          দেখুন
        </a>
      </Button>
    </div>
  );
}
