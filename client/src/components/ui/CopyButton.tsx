import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "../../lib/cn";

export interface CopyButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  value: string;
  label?: string;
}

export function CopyButton({ value, label = "Copy", className, size = "sm", ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }, [value]);

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      onClick={copy}
      className={cn(className)}
      {...props}
    >
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
