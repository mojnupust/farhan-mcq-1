"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { ROUTES } from "@/config/routes";
import { docxService, type DocxExportResult } from "@/features/docs";
import { apiClient } from "@/lib/api-client";
import { downloadBlob } from "@/lib/download-blob";
import { toastErrorAfterCommit, toastSuccessAfterCommit } from "@/lib/safe-toast";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function DocsPreviewPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
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

  async function downloadDocx() {
    setDownloading(true);
    let ok = false;
    try {
      const blob = await apiClient.getBlob(docxService.downloadPath(documentId));
      if (
        blob.type === "application/json" ||
        blob.size < 100 ||
        !blob.type.includes("word") && !blob.type.includes("octet")
      ) {
        const peek = await blob.slice(0, 4).arrayBuffer();
        const sig = new Uint8Array(peek);
        const isZip = sig[0] === 0x50 && sig[1] === 0x4b;
        if (!isZip) throw new Error("Invalid docx response");
      }
      const filename =
        data!.document.setCount === 1
          ? `${data!.document.questionSetIds[0]}-questions.docx`
          : `farhan-mcq-${data!.document.setCount}-sets.docx`;
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
      window.location.href = ROUTES.docs;
    } catch {
      toastErrorAfterCommit("Docx মুছে ফেলা যায়নি");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <ContentSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 text-center">
        <p className="text-muted-foreground">Docx পাওয়া যায়নি।</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.docs}>আবার তৈরি করুন</Link>
        </Button>
      </div>
    );
  }

  const { document: doc, styleConfig } = data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8 page-enter">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.docs}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">তৈরি Docx</h1>
          <p className="text-sm text-muted-foreground">
            {doc.setCount}টি প্রশ্নসেট · {doc.questionCount}টি প্রশ্ন
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="outline" size="sm" onClick={loadExport}>
            <RefreshCw className="mr-2 size-4" />
            রিফ্রেশ
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.docs}>
              <RefreshCw className="mr-2 size-4" />
              নতুন স্টাইলে তৈরি
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteExport}
            disabled={deleting || downloading}
          >
            {deleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 size-4" />
            )}
            মুছুন
          </Button>
          <Button onClick={downloadDocx} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            ডাউনলোড (.docx)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-5" />
            ফাইল বিবরণ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">প্রশ্নসেট সংখ্যা</p>
            <p>{doc.setCount}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">মোট প্রশ্ন</p>
            <p>{doc.questionCount}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">টেমপ্লেট</p>
            <p>{styleConfig.templateStyle === "COLORFUL" ? "রঙিন" : "সাদা-কালো"}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">কলাম</p>
            <p>{styleConfig.columnCount}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">ব্যাখ্যা</p>
            <p>{styleConfig.showExplanation ? "চালু" : "বন্ধ"}</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">তৈরির সময়</p>
            <p>
              {new Date(doc.createdAt).toLocaleString("bn-BD", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
        <Button onClick={downloadDocx} disabled={downloading} className="w-full">
          {downloading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Download className="mr-2 size-4" />
          )}
          ডাউনলোড (.docx)
        </Button>
      </div>
    </div>
  );
}
