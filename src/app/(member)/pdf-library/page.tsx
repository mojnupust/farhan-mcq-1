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
import { PdfCard } from "@/features/pdfs/components/pdf-card";
import {
  PDF_DOC_TYPES,
  PDF_SORT_OPTIONS,
  SUB_EXAM_CATEGORIES,
} from "@/features/pdfs/constants";
import { pdfService } from "@/features/pdfs/services/pdf.mock";
import type { PdfDocType, PdfDocument, PdfSort } from "@/features/pdfs/types";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 12;

function PdfCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/3] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export default function PdfLibraryPage() {
  const [featured, setFeatured] = useState<PdfDocument[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [docType, setDocType] = useState<PdfDocType | "ALL">("ALL");
  const [subExam, setSubExam] = useState<string>("ALL");
  const [sort, setSort] = useState<PdfSort>("newest");
  const [freeOnly, setFreeOnly] = useState(false);

  const loadFeatured = useCallback(async () => {
    try {
      const data = await pdfService.getFeatured();
      setFeatured(data);
    } catch {
      setFeatured([]);
    }
  }, []);

  const loadPdfs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await pdfService.getAll({
        page,
        limit: PAGE_SIZE,
        sort,
        search: search || undefined,
        docType: docType === "ALL" ? undefined : docType,
        subExamCategoryId: subExam === "ALL" ? undefined : subExam,
        freeOnly: freeOnly || undefined,
      });
      setPdfs(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch {
      setPdfs([]);
      toast.error("পিডিএফ লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, docType, subExam, freeOnly]);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    loadPdfs();
  }, [loadPdfs]);

  function applySearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setDocType("ALL");
    setSubExam("ALL");
    setSort("newest");
    setFreeOnly(false);
    setPage(1);
  }

  const hasActiveFilters =
    !!search ||
    docType !== "ALL" ||
    subExam !== "ALL" ||
    sort !== "newest" ||
    freeOnly;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-12 sm:px-6 lg:px-8 page-enter">
      {/* Hero */}
      <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <FileText className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              পিডিএফ লাইব্রেরি
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              সিলেবাস, রুটিন, প্রশ্নব্যাংক, বিগত প্রশ্ন সমাধান ও রিভিশন নোট —
              বিসিএস, NTRCA, ব্যাংক ও অন্যান্য সরকারি চাকরির প্রস্তুতির জন্য,
              প্রিন্টযোগ্য PDF আকারে।
            </p>
          </div>
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && !hasActiveFilters && page === 1 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold">ফিচার্ড পিডিএফ</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 3).map((p) => (
              <PdfCard key={p.id} pdf={p} variant="featured" />
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
              placeholder="পিডিএফ খুঁজুন — বিষয়, শিরোনাম..."
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
              variant={docType === "ALL" ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => {
                setDocType("ALL");
                setPage(1);
              }}
            >
              সব
            </Badge>
            {PDF_DOC_TYPES.map((c) => (
              <Badge
                key={c.value}
                variant={docType === c.value ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => {
                  setDocType(c.value);
                  setPage(1);
                }}
              >
                {c.emoji} {c.label}
              </Badge>
            ))}
            <Badge
              variant={freeOnly ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => {
                setFreeOnly((f) => !f);
                setPage(1);
              }}
            >
              শুধু ফ্রি
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={subExam}
              onValueChange={(v) => {
                setSubExam(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="বিভাগ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">সব বিভাগ</SelectItem>
                {SUB_EXAM_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as PdfSort);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="সাজান" />
              </SelectTrigger>
              <SelectContent>
                {PDF_SORT_OPTIONS.map((o) => (
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
            <span>{total}টি পিডিএফ পাওয়া গেছে</span>
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
            <PdfCardSkeleton key={i} />
          ))}
        </div>
      ) : pdfs.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <FileText className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">কোনো পিডিএফ পাওয়া যায়নি</p>
          {hasActiveFilters && (
            <Button variant="link" onClick={resetFilters} className="mt-2">
              ফিল্টার সরান
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pdfs.map((p) => (
            <PdfCard key={p.id} pdf={p} />
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
