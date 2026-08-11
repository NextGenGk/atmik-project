import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: "accent" | "success" | "warning" | "danger" | "info" | "neutral";
  sub?: string;
  pulse?: boolean;
}

const TONES = {
  accent: { icon: "bg-tint-accent text-accent-500", bar: "bg-accent-500" },
  success: { icon: "bg-tint-success text-success", bar: "bg-success" },
  warning: { icon: "bg-tint-warning text-warning", bar: "bg-warning" },
  danger: { icon: "bg-tint-danger text-danger", bar: "bg-danger" },
  info: { icon: "bg-tint-info text-info", bar: "bg-info" },
  neutral: { icon: "bg-subtle text-secondary", bar: "bg-muted" },
} as const;

export function StatCard({ label, value, icon, tone = "accent", sub, pulse }: StatCardProps) {
  const t = TONES[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-3.5 sm:p-5 shadow-card">
      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs sm:text-[13px] font-medium text-secondary">{label}</p>
          <p className="mt-1.5 truncate font-display text-lg sm:text-[26px] font-bold leading-none tracking-tight text-primary">
            {value}
          </p>
          {sub && <p className="mt-1.5 truncate text-[10px] sm:text-xs text-muted">{sub}</p>}
        </div>
        <div
          className={cn(
            "flex size-7 sm:size-10 shrink-0 items-center justify-center rounded-lg",
            t.icon,
            pulse && "animate-[pulse-glow_2.6s_ease-in-out_infinite]"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
