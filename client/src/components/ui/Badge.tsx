import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

const TONES: Record<Tone, { chip: string; dot: string }> = {
  neutral: { chip: "bg-subtle text-secondary border-line", dot: "bg-muted" },
  accent: { chip: "bg-tint-accent text-accent-400 border-line-accent", dot: "bg-accent-500" },
  success: { chip: "bg-tint-success text-success border-transparent", dot: "bg-success" },
  warning: { chip: "bg-tint-warning text-warning border-transparent", dot: "bg-warning" },
  danger: { chip: "bg-tint-danger text-danger border-transparent", dot: "bg-danger" },
  info: { chip: "bg-tint-info text-info border-transparent", dot: "bg-info" },
};

export function Badge({ tone = "neutral", dot, className, children, ...props }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        t.chip,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-full", t.dot)} />}
      {children}
    </span>
  );
}
