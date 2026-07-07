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

const DEFAULT_SUBTITLE = "সঠিক প্রস্তুতি, নিশ্চিত চাকরি";

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* background */}
      <rect width="80" height="80" rx="20" fill="#0a0a0a" />

      {/* stylized "F" (left bar + top bar) */}
      <path
        d="M26 20 H52
           M26 20 V60
           M26 40 H44"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* MCQ / success check circle */}
      <circle cx="56" cy="46" r="10" fill="white" />

      {/* check mark */}
      <path
        d="M51 46 L55 50 L62 40"
        stroke="#0a0a0a"
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
