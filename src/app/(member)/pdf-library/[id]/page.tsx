"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth";
import { PdfHeroPreview } from "@/features/pdfs/components/pdf-hero-preview";
import {
  docTypeLabel,
  formatCount,
  formatRelativeDate,
  subExamCategoryLabel,
} from "@/features/pdfs/constants";
import { pdfService } from "@/features/pdfs/services/pdf.mock";
import type { PdfComment, PdfDocument } from "@/features/pdfs/types";
import {
  ArrowLeft,
  Download,
  Eye,
  Loader2,
  MessageCircle,
  Send,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PdfDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isAdmin } = useAuth();
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [comments, setComments] = useState<PdfComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadPdf = useCallback(async () => {
    try {
      const data = await pdfService.getById(id);
      setPdf(data);
      pdfService.recordView(id).catch(() => {});
    } catch {
      setPdf(null);
      toast.error("পিডিএফ পাওয়া যায়নি");
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    setCommentLoading(true);
    try {
      const result = await pdfService.getComments(id);
      setComments(result.data);
    } catch {
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPdf(), loadComments()]).finally(() => setLoading(false));
  }, [loadPdf, loadComments]);

  async function handleDownload() {
    if (!pdf) return;
    setDownloading(true);
    try {
      await pdfService.recordDownload(id);
      setPdf((p) => (p ? { ...p, downloadCount: p.downloadCount + 1 } : p));
      window.open(pdf.fileUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  async function handleLike() {
    if (!user) {
      toast.error("লাইক করতে লগইন করুন");
      return;
    }
    setLikeLoading(true);
    try {
      const result = await pdfService.toggleLike(id);
      setPdf((p) =>
        p ? { ...p, likeCount: result.likeCount, likedByMe: result.liked } : p,
      );
    } catch {
      toast.error("লাইক করা যায়নি");
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("মন্তব্য করতে লগইন করুন");
      return;
    }
    const text = commentText.trim();
    if (text.length < 2) return;

    setPosting(true);
    try {
      const comment = await pdfService.addComment(id, text);
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
      setPdf((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : p));
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
      await pdfService.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setPdf((p) =>
        p ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p,
      );
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <ContentSkeleton />
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">পিডিএফ পাওয়া যায়নি</p>
        <Button asChild className="mt-4">
          <Link href="/pdf-library">লাইব্রেরিতে ফিরুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-12 sm:px-6 page-enter">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/pdf-library">
          <ArrowLeft className="mr-2 size-4" />
          পিডিএফ লাইব্রেরি
        </Link>
      </Button>

      <PdfHeroPreview
        fileSizeKb={pdf.fileSizeKb}
        pageCount={pdf.pageCount}
        onDownload={handleDownload}
        downloading={downloading}
      />

      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{docTypeLabel(pdf.docType)}</Badge>
            <Badge variant="outline">
              {subExamCategoryLabel(pdf.subExamCategoryId)}
            </Badge>
          </div>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl">
            {pdf.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="size-3.5" />
              {formatCount(pdf.downloadCount)} ডাউনলোড
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {formatCount(pdf.viewCount)} দেখা
            </span>
            <span>{formatRelativeDate(pdf.updatedAt)}</span>
            {pdf.tags.length > 0 && (
              <span className="flex flex-wrap gap-1">
                {pdf.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    #{t}
                  </Badge>
                ))}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 size-4" />
            ডাউনলোড করুন
          </Button>
        </div>

        {pdf.description && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {pdf.description}
            </p>
          </div>
        )}
      </div>

      {/* Comments */}
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
    </div>
  );
}
