import { Skeleton } from "@/components/ui/skeleton";

/**
 * Full page loading skeleton for layouts (admin/member)
 */
export function PageLoadingSkeleton() {
  return (
    <div className="flex min-h-dvh animate-in fade-in duration-300">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex w-64 flex-col border-r p-4 gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-auto">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Table loading skeleton for admin pages with tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3">
      {/* Table header */}
      <div className="flex gap-4 px-2 py-3 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-2 py-3"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Card grid loading skeleton
 */
export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="animate-in fade-in duration-300 grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border p-5 space-y-3"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * List loading skeleton for notification-style pages
 */
export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="animate-in fade-in duration-300 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border p-4 space-y-2"
          style={{ animationDelay: `${i * 75}ms` }}
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/**
 * Content area skeleton for pages loading data
 */
export function ContentSkeleton() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Exam/Question set loading skeleton
 */
export function ExamSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-4">
      {/* Progress indicator */}
      <Skeleton className="h-2 w-full rounded-full" />
      {/* Question */}
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Profile page skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
