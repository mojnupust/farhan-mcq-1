"use client";

import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

interface AdminStatsBarProps {
  stats: StatItem[];
  className?: string;
}

export function AdminStatsBar({ stats, className }: AdminStatsBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-all hover:shadow-sm hover:border-primary/20",
            stat.color,
          )}
        >
          {stat.icon && (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {stat.icon}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {stat.label}
            </p>
            <p className="text-lg font-semibold tabular-nums leading-tight">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
