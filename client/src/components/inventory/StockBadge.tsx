import { stockStatus } from "../../lib/format";
import { Badge } from "../ui/Badge";

const LABEL = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
} as const;

const TONE = {
  "in-stock": "success",
  "low-stock": "warning",
  "out-of-stock": "danger",
} as const;

export function StockBadge({ quantity }: { quantity: number }) {
  const status = stockStatus(quantity);
  return (
    <Badge tone={TONE[status]} dot>
      {LABEL[status]}
    </Badge>
  );
}
