import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Item } from "../../lib/api";
import { LOW_STOCK_THRESHOLD, formatINR } from "../../lib/format";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";

export function LowStockList({
  items,
  loading,
}: {
  items: Item[];
  loading?: boolean;
}) {
  const low = items
    .filter((i) => i.quantity < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-bold text-primary">Low Stock Alerts</h2>
          <p className="text-xs text-muted">Items at or below {LOW_STOCK_THRESHOLD} units</p>
        </div>
        <Link
          to="/inventory?stockStatus=low"
          className="flex items-center gap-1 text-xs font-semibold text-accent-500 transition-colors hover:text-accent-600"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="divide-y divide-line-subtle">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : low.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="size-6" />}
            title="All stocked up"
            description="No items are below the low-stock threshold right now."
          />
        ) : (
          low.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-subtle/60"
            >
              <div
                className={
                  "flex size-9 shrink-0 items-center justify-center rounded-lg " +
                  (item.quantity <= 0
                    ? "bg-tint-danger text-danger"
                    : "bg-tint-warning text-warning")
                }
              >
                <AlertTriangle className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">{item.itemName}</p>
                <p className="truncate font-mono text-xs text-muted">{item.sku}</p>
              </div>
              <div className="text-right">
                <p
                  className={
                    "text-sm font-bold tabular-nums " +
                    (item.quantity <= 0 ? "text-danger" : "text-warning")
                  }
                >
                  {item.quantity}
                </p>
                <p className="text-[11px] text-muted">{formatINR(item.price)}</p>
              </div>
              <div className="hidden sm:block">
                <Badge tone={item.quantity <= 0 ? "danger" : "warning"}>
                  {item.quantity <= 0 ? "Out" : "Low"}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
