import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/cn";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-14 text-center shadow-card",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-tint-danger text-danger">
        <AlertTriangle className="size-6" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-primary">{title}</h3>
      {message && (
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-secondary">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
