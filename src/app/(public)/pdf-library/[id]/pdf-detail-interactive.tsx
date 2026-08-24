"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth";
import { pdfService } from "@/features/pdfs";
import { PdfHeroPreview } from "@/features/pdfs/components/pdf-hero-preview";
import { formatRelativeDate } from "@/features/pdfs/constants";
import type { PdfComment, PdfDocument } from "@/features/pdfs/types";
import { apiClient } from "@/lib/api-client";
import { downloadBlob } from "@/lib/download-blob";
import { Download, Loader2, MessageCircle, Send, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function PdfDetailInteractive({
  pdfId,
  initialPdf,
}: {
  pdfId: string;
  initialPdf: PdfDocument;
}) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [pdf, setPdf] = useState<PdfDocument>(initialPdf);
  const [comments, setComments] = useState<PdfComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [downloadGate, setDownloadGate] = useState<"login" | "paid" | null>(
    null,
  );

  const loginHref = `/login?next=${encodeURIComponent(`/pdf-library/${pdfId}`)}`;

  const refreshPdf = useCallback(async () => {
    try {
      const data = await pdfService.getById(pdfId);
      setPdf(data);
    } catch {
      /* keep SSR payload */
    }
  }, [pdfId]);

  useEffect(() => {
    pdfService.recordView(pdfId).catch(() => {});
    pdfService
      .getComments(pdfId)
      .then((result) => setComments(result.data))
      .catch(() => setComments([]))
      .finally(() => setCommentLoading(false));
  }, [pdfId]);

  useEffect(() => {
    if (authLoading) return;
    refreshPdf();
  }, [authLoading, user?.id, refreshPdf]);

  function requestDownload() {
    if (!user) {
      setDownloadGate("login");
      return;
    }
    if (!pdf.isFree && pdf.canDownload === false) {
      setDownloadGate("paid");
      return;
    }
    void startDownload();
  }

  async function startDownload() {
    setDownloading(true);
    try {
      const blob = await apiClient.getBlob(pdfService.downloadPath(pdfId));
      downloadBlob(blob, pdf.fileName || `${pdf.title}.pdf`);
      setPdf((p) => ({ ...p, downloadCount: p.downloadCount + 1 }));
    } catch {
      if (!pdf.isFree) {
        setDownloadGate("paid");
      } else {
        toast.error("ডাউনলোড ব্যর্থ হয়েছে — আবার চেষ্টা করুন");
      }
    } finally {
      setDownloading(false);
    }
  }

  async function handleLike() {
    if (!user) {
      setDownloadGate("login");
      return;
    }
    setLikeLoading(true);
    try {
      const result = await pdfService.toggleLike(pdfId);
      setPdf((p) => ({
        ...p,
        likeCount: result.likeCount,
        likedByMe: result.liked,
      }));
    } catch {
      toast.error("লাইক করা যায়নি");
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setDownloadGate("login");
      return;
    }
    const text = commentText.trim();
    if (text.length < 2) return;

    setPosting(true);
    try {
      const comment = await pdfService.addComment(pdfId, text);
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
      setPdf((p) => ({ ...p, commentCount: p.commentCount + 1 }));
      toast.success("মন্তব্য যোগ হয়েছে");
    } catch {
      toast.error("মন্তব্য পোস্ট করা যায়নি");
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("মন্তব্য মুছে ফেলতে চান?")) return;
    try {
      await pdfService.deleteComment(pdfId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPdf((p) => ({
        ...p,
        commentCount: Math.max(0, p.commentCount - 1),
      }));
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  }

  const lockReason = !user
    ? "login"
    : !pdf.isFree && pdf.canDownload === false
      ? "subscription"
      : null;

  return (
    <>
      <PdfHeroPreview
        fileSizeKb={pdf.fileSizeKb}
        pageCount={pdf.pageCount}
        onDownload={requestDownload}
        downloading={downloading}
        lockReason={lockReason}
        loginHref={loginHref}
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant={pdf.likedByMe ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          disabled={likeLoading}
        >
          {likeLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <ThumbsUp
              className={`mr-2 size-4 ${pdf.likedByMe ? "fill-current" : ""}`}
            />
          )}
          {pdf.likeCount} পছন্দ
        </Button>
        <Button variant="outline" size="sm" onClick={requestDownload}>
          <Download className="mr-2 size-4" />
          ডাউনলোড করুন
        </Button>
      </div>

      <section className="mt-10 border-t pt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="size-5" />
          মন্তব্য ({pdf.commentCount})
        </h2>

        <form onSubmit={handleComment} className="mb-6 space-y-3">
          <Textarea
            placeholder={
              user ? "আপনার মন্তব্য লিখুন..." : "মন্তব্য করতে লগইন করুন"
            }
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={!user || posting}
            rows={3}
            maxLength={2000}
          />
          <Button
            type="submit"
            disabled={!user || posting || !commentText.trim()}
          >
            {posting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            পোস্ট করুন
          </Button>
        </form>

        {commentLoading ? (
          <ContentSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            এখনো কোনো মন্তব্য নেই — প্রথম মন্তব্য করুন!
          </p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {c.userName ?? "ব্যবহারকারী"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(c.createdAt)}
                    </span>
                    {(user?.id === c.userId || isAdmin) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{c.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog
        open={downloadGate !== null}
        onOpenChange={(open) => {
          if (!open) setDownloadGate(null);
        }}
      >
        <DialogContent>
          {downloadGate === "login" ? (
            <>
              <DialogHeader>
                <DialogTitle>লগইন প্রয়োজন</DialogTitle>
                <DialogDescription>
                  শুধু লগইন করা ব্যবহারকারী পিডিএফ ডাউনলোড করতে পারবেন। অ্যাকাউন্ট
                  খুলুন বা লগইন করুন, তারপর আবার ডাউনলোড করুন।
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDownloadGate(null)}>
                  পরে
                </Button>
                <Button asChild>
                  <Link href={loginHref}>লগইন করুন</Link>
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>পেইড পিডিএফ</DialogTitle>
                <DialogDescription>
                  এই পিডিএফটি পেইড। লগইন করা থাকলেও শুধু সক্রিয় সাবস্ক্রিপশনধারী
                  ব্যবহারকারী এটি ডাউনলোড করতে পারবেন।
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDownloadGate(null)}>
                  পরে
                </Button>
                <Button asChild>
                  <Link href="/subscriptions">সাবস্ক্রিপশন নিন</Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
