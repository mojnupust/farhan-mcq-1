"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth";
import { YoutubePlayer } from "@/features/videos/components/youtube-player";
import {
  categoryLabel,
  formatRelativeDate,
  formatViewCount,
} from "@/features/videos/constants";
import { videoService } from "@/features/videos";
import type { Video, VideoComment } from "@/features/videos/types";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MessageCircle,
  Send,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isAdmin } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadVideo = useCallback(async () => {
    try {
      const data = await videoService.getById(id);
      setVideo(data);
      videoService.recordView(id).catch(() => {});
    } catch {
      setVideo(null);
      toast.error("ভিডিও পাওয়া যায়নি");
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    setCommentLoading(true);
    try {
      const result = await videoService.getComments(id, 1, 50);
      setComments(result.data);
    } catch {
      setComments([]);
    } finally {
      setCommentLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadVideo(), loadComments()]).finally(() => setLoading(false));
  }, [loadVideo, loadComments]);

  async function handleLike() {
    if (!user) {
      toast.error("লাইক করতে লগইন করুন");
      return;
    }
    setLikeLoading(true);
    try {
      const result = await videoService.toggleLike(id);
      setVideo((v) =>
        v
          ? {
              ...v,
              likeCount: result.likeCount,
              likedByMe: result.liked,
            }
          : v,
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
      const comment = await videoService.addComment(id, text);
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
      setVideo((v) =>
        v ? { ...v, commentCount: v.commentCount + 1 } : v,
      );
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
      await videoService.deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setVideo((v) =>
        v ? { ...v, commentCount: Math.max(0, v.commentCount - 1) } : v,
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

  if (!video) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-muted-foreground">ভিডিও পাওয়া যায়নি</p>
        <Button asChild className="mt-4">
          <Link href={ROUTES.videos}>লাইব্রেরিতে ফিরুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-12 sm:px-6 page-enter">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={ROUTES.videos}>
          <ArrowLeft className="mr-2 size-4" />
          ভিডিও লাইব্রেরি
        </Link>
      </Button>

      <YoutubePlayer videoId={video.youtubeVideoId} title={video.title} />

      <div className="mt-5 space-y-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            {categoryLabel(video.category)}
          </Badge>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl">
            {video.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{formatViewCount(video.viewCount)} দেখা</span>
            <span>{formatRelativeDate(video.publishedAt)}</span>
            {video.tags.length > 0 && (
              <span className="flex flex-wrap gap-1">
                {video.tags.map((t) => (
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
            variant={video.likedByMe ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            disabled={likeLoading}
          >
            {likeLoading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <ThumbsUp
                className={`mr-2 size-4 ${video.likedByMe ? "fill-current" : ""}`}
              />
            )}
            {video.likeCount} পছন্দ
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 size-4" />
              YouTube-এ দেখুন
            </a>
          </Button>
        </div>

        {video.description && (
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {video.description}
            </p>
          </div>
        )}
      </div>

      {/* Comments */}
      <section className="mt-10 border-t pt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="size-5" />
          মন্তব্য ({video.commentCount})
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
          <Button type="submit" disabled={!user || posting || !commentText.trim()}>
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
