import { forwardRef, type InputHTMLAttributes } from "react";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  loading?: boolean;
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ loading, onClear, className, value, ...props }, ref) => (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-surface px-3 transition-colors focus-within:border-line-strong",
        className
      )}
    >
      {loading ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-muted" />
      ) : (
        <Search className="size-4 shrink-0 text-muted" />
      )}
      <input
        ref={ref}
        value={value}
        className="w-full bg-transparent text-sm text-primary outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 placeholder:text-muted/70"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="rounded p-0.5 text-muted transition-colors hover:bg-subtle hover:text-primary"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
);

SearchInput.displayName = "SearchInput";
