import type { Item } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { BarcodeView } from "../../components/ui/BarcodeView";

export interface BarcodeLabelProps {
  item: Item;
  width?: number;
}

export function BarcodeLabel({ item, width = 2 }: BarcodeLabelProps) {
  const value = item.sku;
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-white p-3 text-center">
      <p className="w-full truncate px-1 text-[11px] font-semibold text-[#0b0e13]">
        {item.itemName}
      </p>
      <BarcodeView value={value} width={width} height={42} fontSize={11} />
      <p className="w-full truncate px-1 font-mono text-[10px] font-semibold text-[#475467]">
        {item.sku} · {formatINR(item.price)}
      </p>
    </div>
  );
}
