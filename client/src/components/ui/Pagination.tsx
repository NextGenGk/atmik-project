import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "../../lib/api";
import { cn } from "../../lib/cn";

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

function pageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" aria-label="Pagination">
      <p className="text-xs text-muted">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          className="flex size-8 items-center justify-center rounded-lg border border-line bg-raised text-secondary transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-1 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "size-8 rounded-lg text-sm font-semibold transition-colors",
                p === page
                  ? "bg-accent-600 text-on-accent"
                  : "text-secondary hover:bg-subtle hover:text-primary"
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="flex size-8 items-center justify-center rounded-lg border border-line bg-raised text-secondary transition-colors hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
