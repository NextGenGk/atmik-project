import { forwardRef, useId, useState, useRef, useEffect, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/cn";

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  options: Option[];
  placeholder?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  value?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, value, onChange, name, disabled, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((o) => o.value === value);

    const handleSelect = (val: string) => {
      onChange?.({ target: { value: val, name } });
      setOpen(false);
    };

    return (
      <div className="flex flex-col gap-1.5" ref={containerRef}>
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-semibold text-secondary">
            {label}
          </label>
        )}
        <div className="relative" ref={ref}>
          <button
            type="button"
            id={selectId}
            disabled={disabled}
            onClick={() => !disabled && setOpen((prev) => !prev)}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-lg border border-line bg-surface pl-3 pr-3 text-sm text-primary outline-none transition-colors",
              "focus-within:border-line-strong focus:border-line-strong",
              open && "border-line-strong ring-2 ring-accent-500/20",
              error && "border-danger",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...(props as any)}
          >
            <span className={cn("truncate", !selectedOption && placeholder && "text-muted")}>
              {selectedOption ? selectedOption.label : placeholder || ""}
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} />
          </button>
          
          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line-subtle bg-surface p-1 shadow-card animate-[fade-in_0.1s_ease-out]">
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => handleSelect(o.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors text-left",
                    value === o.value
                      ? "bg-accent-600/10 text-accent-700 font-bold"
                      : "text-secondary hover:bg-subtle hover:text-primary font-medium"
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {value === o.value && <Check className="size-4 shrink-0 text-accent-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        {!error && hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
