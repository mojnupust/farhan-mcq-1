"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  count?: number;
  countLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  icon,
  count,
  countLabel = "টি আইটেম",
  children,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {count !== undefined && (
              <Badge
                variant="secondary"
                className="text-xs font-normal tabular-nums"
              >
                {count} {countLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
