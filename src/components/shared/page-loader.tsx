import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  className?: string;
}

export function PageLoader({
  label = "লোড হচ্ছে...",
  className,
}: PageLoaderProps) {
  return (
    <div className={cn("ui-shell flex items-center justify-center p-6", className)}>
      <div className="ui-content absolute inset-0 grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="loading-shimmer h-24 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>

      <div className="ui-content glass-strong rounded-2xl px-8 py-6 text-center shadow-violet-900/20">
        <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-600" />
        <p className="text-xl font-bold gradient-text">{label}</p>
      </div>
    </div>
  );
}
