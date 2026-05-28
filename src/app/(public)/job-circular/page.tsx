"use client";

import { LandingHeader } from "@/components/landing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import type {
  CircularStatus,
  JobCircular,
  JobCircularFilter,
  JobCircularFilterOptions,
  OrgType,
} from "@/features/job-circular";
import { jobCircularService } from "@/features/job-circular";
import {
  Briefcase,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  LayoutDashboard,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  GOVERNMENT: "সরকারি",
  PRIVATE: "বেসরকারি",
  AUTONOMOUS: "স্বায়ত্তশাসিত",
  NGO: "এনজিও",
};

const STATUS_LABELS: Record<CircularStatus, string> = {
  LIVE: "সক্রিয়",
  UPCOMING: "আসছে",
  EXPIRED: "মেয়াদোত্তীর্ণ",
};

const STATUS_COLORS: Record<CircularStatus, string> = {
  LIVE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  UPCOMING: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  EXPIRED: "bg-muted text-muted-foreground",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function daysLeft(deadline: string | null): string | null {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / 86_400_000,
  );
  if (diff < 0) return "মেয়াদ শেষ";
  if (diff === 0) return "আজই শেষ দিন";
  return `${diff} দিন বাকি`;
}

function formatDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

// ─── Skeleton Card ────────────────────────────────────────────────────────

function CircularCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="size-14 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Circular Card ────────────────────────────────────────────────────────

function CircularCard({ circular }: { circular: JobCircular }) {
  const remaining = daysLeft(circular.deadline);
  const isExpired = circular.status === "EXPIRED";
  const isUrgent =
    remaining &&
    !isExpired &&
    parseInt(remaining) <= 3 &&
    remaining !== "আজই শেষ দিন";

  const handleView = () => {
    jobCircularService.recordView(circular.id).catch(() => {});
  };

  return (
    <Card
      className={`group overflow-hidden transition-all hover:shadow-md hover:border-primary/30 ${isExpired ? "opacity-70" : ""}`}
    >
      <CardContent className="p-0">
        <div className="flex gap-0">
          {/* Org Logo / Icon sidebar */}
          <div className="flex items-center justify-center w-16 shrink-0 bg-muted/50 border-r">
            {circular.logoUrl ? (
              <Image
                src={circular.logoUrl}
                alt={circular.organizationName}
                width={48}
                height={48}
                className="size-12 object-contain p-1"
                unoptimized
              />
            ) : (
              <Building2 className="size-8 text-muted-foreground/40" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Org Name + Job ID */}
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {circular.organizationName}
                  </p>
                  {circular.gjobId && (
                    <span className="text-xs text-muted-foreground/60 font-mono">
                      #{circular.gjobId}
                    </span>
                  )}
                </div>
                {/* Title */}
                <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {circular.title}
                </h3>
              </div>

              {/* Status badge */}
              <Badge
                className={`shrink-0 text-xs border-0 ${STATUS_COLORS[circular.status]}`}
              >
                {STATUS_LABELS[circular.status]}
              </Badge>
            </div>

            {/* Meta row */}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {circular.totalPosts > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {circular.totalPosts} পদ
                </span>
              )}
              {circular.deadline && (
                <span
                  className={`flex items-center gap-1 ${isUrgent ? "text-destructive font-medium" : ""} ${remaining === "আজই শেষ দিন" ? "text-orange-500 font-semibold" : ""}`}
                >
                  <Clock className="size-3" />
                  {remaining}
                </span>
              )}
              {circular.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(circular.deadline)}
                </span>
              )}
              {circular.category && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-xs font-normal"
                >
                  {circular.category}
                </Badge>
              )}
              <span className="flex items-center gap-1 ml-auto">
                <Eye className="size-3" />
                {circular.viewCount.toLocaleString("bn-BD")}
              </span>
            </div>

            {/* Action row */}
            <div className="mt-3 flex items-center gap-2">
              {circular.applicationUrl ? (
                <a
                  href={circular.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleView}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  আবেদন করুন
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">
                  আবেদন লিংক নেই
                </span>
              )}
              {circular.source && (
                <a
                  href={circular.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground ml-2"
                >
                  বিজ্ঞপ্তি দেখুন ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page numbers to show: always first, last, current ±1
  const pages = new Set(
    [1, totalPages, page, page - 1, page + 1].filter(
      (p) => p >= 1 && p <= totalPages,
    ),
  );
  const sorted = Array.from(pages).sort((a, b) => a - b);

  const items: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push("...");
    items.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button
        size="icon"
        variant="outline"
        className="size-8"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      {items.map((item, i) =>
        item === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            size="sm"
            variant={item === page ? "default" : "outline"}
            className="size-8 px-0 text-xs"
            onClick={() => onPage(item)}
          >
            {item}
          </Button>
        ),
      )}
      <Button
        size="icon"
        variant="outline"
        className="size-8"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

const LIMIT = 20;

export default function JobCircularPage() {
  const [circulars, setCirculars] = useState<JobCircular[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] =
    useState<JobCircularFilterOptions | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [orgType, setOrgType] = useState<OrgType | "">("");
  const [status, setStatus] = useState<CircularStatus | "">("");
  const [category, setCategory] = useState("");
  const [ministry, setMinistry] = useState("");
  const [deadlineFrom, setDeadlineFrom] = useState("");
  const [deadlineTo, setDeadlineTo] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(v);
      setPage(1);
    }, 350);
  };

  const buildFilter = useCallback((): JobCircularFilter => {
    const f: JobCircularFilter = { page, limit: LIMIT };
    if (search) f.search = search;
    if (orgType) f.orgType = orgType as OrgType;
    if (status) f.status = status as CircularStatus;
    if (category) f.category = category;
    if (ministry) f.ministry = ministry;
    if (deadlineFrom) f.deadlineFrom = deadlineFrom;
    if (deadlineTo) f.deadlineTo = deadlineTo;
    return f;
  }, [
    page,
    search,
    orgType,
    status,
    category,
    ministry,
    deadlineFrom,
    deadlineTo,
  ]);

  // Load circulars
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    jobCircularService
      .getAll(buildFilter())
      .then((res) => {
        if (cancelled) return;
        setCirculars(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [buildFilter]);

  // Load filter options once
  useEffect(() => {
    jobCircularService
      .getFilterOptions()
      .then(setFilterOptions)
      .catch(console.error);
  }, []);

  const resetFilters = () => {
    setSearch("");
    setSearchInput("");
    setOrgType("");
    setStatus("");
    setCategory("");
    setMinistry("");
    setDeadlineFrom("");
    setDeadlineTo("");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    orgType ||
    status ||
    category ||
    ministry ||
    deadlineFrom ||
    deadlineTo;

  const handlePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="size-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">
                সরকারি চাকরির বিজ্ঞপ্তি
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {total > 0
                ? `মোট ${total.toLocaleString("bn-BD")} টি নিয়োগ বিজ্ঞপ্তি পাওয়া গেছে`
                : "বাংলাদেশের সকল সরকারি নিয়োগ বিজ্ঞপ্তি"}
            </p>
          </div>
          <Link
            href={ROUTES.dashboard}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 transition-all duration-150 shrink-0"
          >
            <LayoutDashboard className="size-4" />
            ড্যাশবোর্ড
          </Link>
        </div>

        {/* Search + Quick Filters */}
        <div className="space-y-3 mb-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="অধিদপ্তর বা পদের নাম খুঁজুন..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Quick filter row */}
          <div className="flex flex-wrap gap-2">
            <Select
              value={orgType || "all"}
              onValueChange={(v) => {
                setOrgType(v === "all" ? "" : (v as OrgType));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="প্রতিষ্ঠান ধরন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব ধরন</SelectItem>
                {(Object.entries(ORG_TYPE_LABELS) as [OrgType, string][]).map(
                  ([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select
              value={status || "all"}
              onValueChange={(v) => {
                setStatus(v === "all" ? "" : (v as CircularStatus));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="অবস্থা" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব অবস্থা</SelectItem>
                {(
                  Object.entries(STATUS_LABELS) as [CircularStatus, string][]
                ).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterOptions && filterOptions.categories.length > 0 && (
              <Select
                value={category || "all"}
                onValueChange={(v) => {
                  setCategory(v === "all" ? "" : v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="ক্যাটাগরি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                  {filterOptions.categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setShowAdvanced((p) => !p)}
            >
              <Filter className="size-3" />
              অতিরিক্ত ফিল্টার
              {showAdvanced && <X className="size-3" />}
            </Button>

            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
                onClick={resetFilters}
              >
                <RotateCcw className="size-3" />
                রিসেট
              </Button>
            )}
          </div>

          {/* Advanced filters (collapsible) */}
          {showAdvanced && (
            <Card className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ministry filter */}
                {filterOptions && filterOptions.ministries.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      মন্ত্রণালয়
                    </label>
                    <Select
                      value={ministry || "all"}
                      onValueChange={(v) => {
                        setMinistry(v === "all" ? "" : v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="মন্ত্রণালয় নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব মন্ত্রণালয়</SelectItem>
                        {filterOptions.ministries.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Deadline range */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    শেষ তারিখ (থেকে)
                  </label>
                  <Input
                    type="date"
                    value={deadlineFrom}
                    onChange={(e) => {
                      setDeadlineFrom(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    শেষ তারিখ (পর্যন্ত)
                  </label>
                  <Input
                    type="date"
                    value={deadlineTo}
                    onChange={(e) => {
                      setDeadlineTo(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {search && (
              <FilterChip
                label={`"${search}"`}
                onRemove={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
              />
            )}
            {orgType && (
              <FilterChip
                label={ORG_TYPE_LABELS[orgType as OrgType]}
                onRemove={() => {
                  setOrgType("");
                  setPage(1);
                }}
              />
            )}
            {status && (
              <FilterChip
                label={STATUS_LABELS[status as CircularStatus]}
                onRemove={() => {
                  setStatus("");
                  setPage(1);
                }}
              />
            )}
            {category && (
              <FilterChip
                label={category}
                onRemove={() => {
                  setCategory("");
                  setPage(1);
                }}
              />
            )}
            {ministry && (
              <FilterChip
                label={ministry}
                onRemove={() => {
                  setMinistry("");
                  setPage(1);
                }}
              />
            )}
            {deadlineFrom && (
              <FilterChip
                label={`থেকে: ${deadlineFrom}`}
                onRemove={() => {
                  setDeadlineFrom("");
                  setPage(1);
                }}
              />
            )}
            {deadlineTo && (
              <FilterChip
                label={`পর্যন্ত: ${deadlineTo}`}
                onRemove={() => {
                  setDeadlineTo("");
                  setPage(1);
                }}
              />
            )}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <CircularCardSkeleton key={i} />
            ))}
          </div>
        ) : circulars.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="mx-auto size-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                কোনো নিয়োগ বিজ্ঞপ্তি পাওয়া যায়নি
              </p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={resetFilters}
                >
                  ফিল্টার রিসেট করুন
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {circulars.map((c) => (
              <CircularCard key={c.id} circular={c} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPage={handlePage} />
      </main>
    </>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-primary/60">
        <X className="size-3" />
      </button>
    </span>
  );
}
