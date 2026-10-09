"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { docxService, type DocxExportResult } from "@/features/docs";
import { apiClient } from "@/lib/api-client";
import { downloadBlob } from "@/lib/download-blob";
import {
  toastErrorAfterCommit,
  toastSuccessAfterCommit,
} from "@/lib/safe-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Columns,
  Download,
  FileText,
  Layers,
  ListChecks,
  Loader2,
  MoreVertical,
  PenLine,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface DocxPreviewProps {
  documentId: string;
  /** Route to go back to the generator. */
  backRoute: string;
  /** Route to start over with a new style (usually same as backRoute). */
  newStyleRoute: string;
  /** Only real admins can delete — public/anonymous users don't get this button. */
  showDelete?: boolean;
  showDonationBanner?: boolean;
  /** Content wrapper max-width, e.g. "max-w-5xl" on the public site to match the header. */
  maxWidthClassName?: string;
}

export function DocxPreview({
  documentId,
  backRoute,
  newStyleRoute,
  showDelete = true,
  showDonationBanner = false,
  maxWidthClassName = "max-w-2xl",
}: DocxPreviewProps) {
  const [data, setData] = useState<DocxExportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadExport = useCallback(async () => {
    setLoading(true);
    try {
      const result = await docxService.getExport(documentId);
      setData(result);
    } catch {
      setData(null);
      toast.error("Docx তথ্য লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadExport();
  }, [loadExport]);

  const filename = useMemo(() => {
    if (!data) return "";
    return data.document.setCount === 1
      ? `${data.document.questionSetIds[0]}-questions.docx`
      : `farhan-mcq-${data.document.setCount}-sets.docx`;
  }, [data]);

  async function downloadDocx() {
    setDownloading(true);
    let ok = false;
    try {
      const blob = await apiClient.getBlob(
        docxService.downloadPath(documentId),
      );
      if (
        blob.type === "application/json" ||
        blob.size < 100 ||
        (!blob.type.includes("word") && !blob.type.includes("octet"))
      ) {
        const peek = await blob.slice(0, 4).arrayBuffer();
        const sig = new Uint8Array(peek);
        const isZip = sig[0] === 0x50 && sig[1] === 0x4b;
        if (!isZip) throw new Error("Invalid docx response");
      }
      downloadBlob(blob, filename);
      ok = true;
    } catch {
      toastErrorAfterCommit("Docx ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloading(false);
      if (ok) toastSuccessAfterCommit("Docx ডাউনলোড হয়েছে");
    }
  }

  async function deleteExport() {
    if (
      !confirm(
        "এই Docx ফাইল মুছে ফেলতে চান? নতুন স্টাইলে আবার তৈরি করতে পারবেন।",
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await docxService.deleteExport(documentId);
      toastSuccessAfterCommit("Docx মুছে ফেলা হয়েছে");
      window.location.href = backRoute;
    } catch {
      toastErrorAfterCommit("Docx মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClassName}`}>
        <ContentSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`mx-auto px-4 py-6 text-center ${maxWidthClassName}`}>
        <p className="text-muted-foreground">Docx পাওয়া যায়নি।</p>
        <Button asChild className="mt-4">
          <Link href={backRoute}>আবার তৈরি করুন</Link>
        </Button>
      </div>
    );
  }

  const { document: doc, styleConfig } = data;

  return (
    <div
      className={`mx-auto px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8 page-enter ${maxWidthClassName}`}
    >
      <div className="mb-5 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href={backRoute}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">তৈরি Docx</h1>
          <p className="text-sm text-muted-foreground">
            {doc.setCount}টি প্রশ্নসেট · {doc.questionCount}টি প্রশ্ন
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreVertical className="size-4" />
              <span className="sr-only">আরও অপশন</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={loadExport}>
              <RefreshCw className="mr-2 size-4" />
              রিফ্রেশ
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={newStyleRoute}>
                <PenLine className="mr-2 size-4" />
                নতুন স্টাইলে তৈরি
              </Link>
            </DropdownMenuItem>
            {showDelete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={deleteExport}
                disabled={deleting || downloading}
              >
                <Trash2 className="mr-2 size-4" />
                মুছুন
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Primary CTA — made large and visually distinct so the download link is impossible to miss */}
      <Card className="mb-6 border-primary/40 bg-primary/4 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{filename}</p>
              <p className="text-xs text-muted-foreground">
                Microsoft Word (.docx) · {doc.setCount}টি প্রশ্নসেট
              </p>
            </div>
          </div>
          <Button
            onClick={downloadDocx}
            disabled={downloading}
            size="lg"
            className="w-full gap-2 sm:w-auto"
          >
            {downloading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Download className="size-5" />
            )}
            ডাউনলোড (.docx)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="size-5" />
            ফাইল বিবরণ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <Layers className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">
                  প্রশ্নসেট সংখ্যা
                </dt>
                <dd className="font-medium">{doc.setCount}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">মোট প্রশ্ন</dt>
                <dd className="font-medium">{doc.questionCount}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Columns className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">কলাম</dt>
                <dd className="font-medium">{styleConfig.columnCount}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2 col-span-2 sm:col-span-1">
              <div className="mt-0.5 shrink-0">
                <Badge variant="secondary" className="font-normal">
                  {styleConfig.templateStyle === "COLORFUL"
                    ? "রঙিন টেমপ্লেট"
                    : "সাদা-কালো টেমপ্লেট"}
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">ব্যাখ্যা</dt>
                <dd className="font-medium">
                  {styleConfig.showExplanation ? "চালু" : "বন্ধ"}
                </dd>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2 sm:col-span-3">
              <RefreshCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-xs text-muted-foreground">তৈরির সময়</dt>
                <dd className="font-medium">
                  {new Date(doc.createdAt).toLocaleString("bn-BD", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
        <Button
          onClick={downloadDocx}
          disabled={downloading}
          size="lg"
          className="w-full gap-2"
        >
          {downloading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Download className="size-5" />
          )}
          ডাউনলোড (.docx)
        </Button>
      </div>
    </div>
  );
}
