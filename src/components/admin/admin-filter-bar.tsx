"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface AdminFilterBarProps {
  filters: FilterConfig[];
  className?: string;
  children?: React.ReactNode;
}

export function AdminFilterBar({
  filters,
  className,
  children,
}: AdminFilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border bg-card/50 p-4 animate-in fade-in duration-200",
        className,
      )}
    >
      {filters.map((filter) => (
        <div key={filter.id} className="flex-1 min-w-[180px] max-w-xs">
          <Label
            htmlFor={filter.id}
            className="text-xs font-medium text-muted-foreground mb-1.5 block"
          >
            {filter.label}
          </Label>
          <Select value={filter.value} onValueChange={filter.onChange}>
            <SelectTrigger id={filter.id} className="h-9">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.icon ? `${opt.icon} ` : ""}
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {children}
    </div>
  );
}
