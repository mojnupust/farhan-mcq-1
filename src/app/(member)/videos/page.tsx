"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { VideoCard } from "@/features/videos/components/video-card";
import {
  VIDEO_CATEGORIES,
  VIDEO_SORT_OPTIONS,
} from "@/features/videos/constants";
import { videoService } from "@/features/videos";
import type { Video, VideoCategory, VideoFilter, VideoSort } from "@/features/videos/types";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function VideoCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export default function VideosPage() {
  const [featured, setFeatured] = useState<Video[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState<VideoCategory | "ALL">("ALL");
  const [sort, setSort] = useState<VideoSort>("newest");

  const loadFeatured = useCallback(async () => {
    try {
      const data = await videoService.getFeatured();
      setFeatured(data);
    } catch {
      setFeatured([]);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const filter: VideoFilter = {
        page,
        limit: PAGE_SIZE,
        sort,
        search: search || undefined,
        category: category === "ALL" ? undefined : category,
      };
      const result = await videoService.getAll(filter);
      setVideos(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setVideos([]);
      toast.error("ভিডিও লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  function applySearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("ALL");
    setSort("newest");
    setPage(1);
  }

  const hasActiveFilters = search || category !== "ALL" || sort !== "newest";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-12 sm:px-6 lg:px-8 page-enter">
      {/* Hero */}
      <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <VideoIcon className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ভিডিও লাইব্রেরি
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              বিসিএস, ব্যাংক, প্রাথমিক, NTRCA, সমাজসেবা ও আরও সরকারি চাকরির
              প্রস্তুতির YouTube লেকচার — এক জায়গায়।
            </p>
          </div>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && !hasActiveFilters && page === 1 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold">ফিচার্ড লেকচার</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((v) => (
              <VideoCard key={v.id} video={v} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={applySearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ভিডিও খুঁজুন — বিষয়, শিরোনাম..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit">খুঁজুন</Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-label="ফিল্টার"
          >
            <Filter className="size-4" />
          </Button>
        </form>

        <div
          className={`flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between ${filtersOpen ? "block" : "hidden lg:flex"}`}
        >
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={category === "ALL" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => {
                setCategory("ALL");
                setPage(1);
              }}
            >
              সব
            </Badge>
            {VIDEO_CATEGORIES.map((cat) => (
              <Badge
                key={cat.value}
                variant={category === cat.value ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
              >
                {cat.emoji} {cat.label}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as VideoSort);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="mr-1 size-4" />
                রিসেট
              </Button>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{total}টি ভিডিও পাওয়া গেছে</span>
            {search && (
              <Badge variant="secondary" className="gap-1">
                &quot;{search}&quot;
                <X
                  className="size-3 cursor-pointer"
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    setPage(1);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <VideoIcon className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">কোনো ভিডিও পাওয়া যায়নি</p>
          {hasActiveFilters && (
            <Button variant="link" onClick={resetFilters} className="mt-2">
              ফিল্টার সরান
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            পৃষ্ঠা {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
