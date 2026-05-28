"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale-up"
  | "blur-in";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  once?: boolean;
}

const variantStyles: Record<AnimationVariant, string> = {
  "fade-up": "translate-y-6 opacity-0",
  "fade-down": "-translate-y-6 opacity-0",
  "fade-left": "translate-x-6 opacity-0",
  "fade-right": "-translate-x-6 opacity-0",
  "scale-up": "scale-95 opacity-0",
  "blur-in": "opacity-0 blur-sm",
};

export function AnimateIn({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 500,
  once = true,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all will-change-transform",
        !isVisible && variantStyles[variant],
        isVisible && "translate-x-0 translate-y-0 scale-100 opacity-100 blur-0",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  variant?: AnimationVariant;
  duration?: number;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 80,
  variant = "fade-up",
  duration = 500,
}: StaggerChildrenProps) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {items.map((child, index) => (
        <AnimateIn
          key={index}
          variant={variant}
          delay={index * staggerDelay}
          duration={duration}
        >
          {child}
        </AnimateIn>
      ))}
    </div>
  );
}
