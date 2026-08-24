"use client";

import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth";
import { videoService } from "@/features/videos";
import { formatRelativeDate } from "@/features/videos/constants";
import type { Video, VideoComment } from "@/features/videos/types";
import { Loader2, MessageCircle, Send, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function VideoDetailInteractive({
  videoId,
  initialVideo,
}: {
  videoId: string;
  initialVideo: Video;
}) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [video, setVideo] = useState<Video>(initialVideo);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const loginHref = `/login?next=${encodeURIComponent(`/videos/${videoId}`)}`;

  const refreshVideo = useCallback(async () => {
    try {
      const data = await videoService.getById(videoId);
      setVideo(data);
    } catch {
      /* keep SSR payload */
    }
  }, [videoId]);

  useEffect(() => {
    videoService.recordView(videoId).catch(() => {});
    videoService
      .getComments(videoId, 1, 50)
      .then((result) => setComments(result.data))
      .catch(() => setComments([]))
      .finally(() => setCommentLoading(false));
  }, [videoId]);

  useEffect(() => {
    if (authLoading) return;
    refreshVideo();
  }, [authLoading, user?.id, refreshVideo]);

  async function handleLike() {
    if (!user) {
      toast.error("লাইক করতে লগইন করুন");
      return;
    }
    setLikeLoading(true);
    try {
      const result = await videoService.toggleLike(videoId);
      setVideo((v) => ({
        ...v,
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
      toast.error("মন্তব্য করতে লগইন করুন");
      return;
    }
    const text = commentText.trim();
    if (text.length < 2) return;

    setPosting(true);
    try {
      const comment = await videoService.addComment(videoId, text);
      setComments((prev) => [comment, ...prev]);
      setCommentText("");
      setVideo((v) => ({ ...v, commentCount: v.commentCount + 1 }));
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
      await videoService.deleteComment(videoId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setVideo((v) => ({
        ...v,
        commentCount: Math.max(0, v.commentCount - 1),
      }));
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
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
        {!user && (
          <Button variant="outline" size="sm" asChild>
            <Link href={loginHref}>লগইন করুন</Link>
          </Button>
        )}
      </div>

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
    </>
  );
}
