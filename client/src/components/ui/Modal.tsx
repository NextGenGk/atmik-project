import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  kicker?: string;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, kicker, footer, size = "md", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-overlay p-0 backdrop-blur-sm sm:items-center sm:p-6 animate-[fade-in_0.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-modal animate-[spring-pop_0.25s_ease-out] sm:rounded-2xl",
          SIZES[size]
        )}
      >
        {(title || kicker) && (
          <div className="flex items-start justify-between gap-4 border-b border-line-subtle px-6 py-4">
            <div>
              {kicker && <p className="text-[11px] font-bold uppercase tracking-wider text-accent-500">{kicker}</p>}
              {title && (
                <h2 className="mt-0.5 font-display text-lg font-bold text-primary">{title}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-subtle hover:text-primary"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-line-subtle px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
