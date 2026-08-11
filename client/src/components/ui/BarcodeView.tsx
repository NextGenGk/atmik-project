import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { cn } from "../../lib/cn";

export interface BarcodeViewProps {
  value: string;
  height?: number;
  width?: number;
  fontSize?: number;
  className?: string;
}

export function BarcodeView({ value, height = 50, width = 2, fontSize = 13, className }: BarcodeViewProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        lineColor: "#0b0e13",
        width,
        height,
        displayValue: true,
        fontSize,
        font: "JetBrains Mono, monospace",
        margin: 2,
      });
    } catch {
      /* invalid barcode — render nothing */
    }
  }, [value, height, width, fontSize]);

  if (!value) return null;

  return (
    <svg
      ref={ref}
      data-barcode={value}
      className={cn("barcode-print-area block", className)}
      role="img"
      aria-label={`Barcode ${value}`}
    />
  );
}
