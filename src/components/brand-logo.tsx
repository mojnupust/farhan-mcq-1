import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  orientation?: "horizontal" | "stacked";
};

const DEFAULT_SUBTITLE = "সরকারি চাকরিতে সফল হওয়ার সবচেয়ে স্মার্ট উপায়";

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("size-10 shrink-0", className)}
    >
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="15"
        fill="url(#farhanmcq-bg)"
      />
      <path
        fill="#F8FAFC"
        d="M20 18.5C20 16.567 21.567 15 23.5 15H40.5C42.433 15 44 16.567 44 18.5C44 20.433 42.433 22 40.5 22H27V28H36.5C38.433 28 40 29.567 40 31.5C40 33.433 38.433 35 36.5 35H27V45.5C27 47.433 25.433 49 23.5 49C21.567 49 20 47.433 20 45.5V18.5Z"
      />
      <path
        d="M37 39.5L42 44.5L51 33.5"
        stroke="#F59E0B"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="farhanmcq-bg"
          x1="11"
          y1="10"
          x2="53"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E293B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandLogo({
  className,
  iconClassName,
  titleClassName,
  subtitleClassName,
  showSubtitle = false,
  subtitle = DEFAULT_SUBTITLE,
  orientation = "horizontal",
}: BrandLogoProps) {
  const isStacked = orientation === "stacked";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        isStacked && "flex-col items-start gap-4",
        className,
      )}
    >
      <BrandMark className={iconClassName} />
      <div className={cn("min-w-0", isStacked && "w-full")}>
        <p
          className={cn(
            "text-lg font-semibold tracking-tight text-foreground",
            !isStacked && "truncate",
            titleClassName,
          )}
        >
          Farhan MCQ
        </p>
        {showSubtitle ? (
          <p
            className={cn(
              "mt-0.5 text-xs leading-tight text-muted-foreground",
              subtitleClassName,
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
