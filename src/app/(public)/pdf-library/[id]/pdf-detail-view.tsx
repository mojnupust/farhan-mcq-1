import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  docTypeLabel,
  formatCount,
  formatRelativeDate,
} from "@/features/pdfs/constants";
import type { PdfDocument } from "@/features/pdfs/types";
import { ArrowLeft, Download, Eye } from "lucide-react";
import Link from "next/link";
import { PdfDetailInteractive } from "./pdf-detail-interactive";

export function PdfDetailView({
  pdf,
  categoryName,
}: {
  pdf: PdfDocument;
  categoryName: string;
}) {
  const tags = pdf.tags ?? [];

  return (
    <article className="mx-auto max-w-4xl px-4 py-6 pb-12 sm:px-6 page-enter">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/pdf-library">
          <ArrowLeft className="mr-2 size-4" />
          পিডিএফ লাইব্রেরি
        </Link>
      </Button>

      <header className="mb-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{docTypeLabel(pdf.docType)}</Badge>
          <Badge variant="outline">{categoryName}</Badge>
          {pdf.isFree ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">ফ্রি</Badge>
          ) : (
            <Badge variant="secondary">প্রিমিয়াম</Badge>
          )}
        </div>
        <h1 className="text-xl font-bold leading-snug sm:text-2xl">
          {pdf.title}
        </h1>
        <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="size-3.5" />
            {formatCount(pdf.downloadCount)} ডাউনলোড
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {formatCount(pdf.viewCount)} দেখা
          </span>
          <time dateTime={pdf.updatedAt}>
            {formatRelativeDate(pdf.updatedAt)}
          </time>
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                #{t}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {pdf.description && (
        <div className="mb-5 rounded-xl border bg-muted/30 p-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {pdf.description}
          </p>
        </div>
      )}

      <PdfDetailInteractive pdfId={pdf.id} initialPdf={pdf} />
    </article>
  );
}
