import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import type { Item } from "../../lib/api";
import { formatINR, timeAgo } from "../../lib/format";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { StockBadge } from "../inventory/StockBadge";

export function RecentItems({
  items,
  loading,
}: {
  items: Item[];
  loading?: boolean;
}) {
  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
        <div>
          <h2 className="font-display text-sm font-bold text-primary">Recently Added</h2>
          <p className="text-xs text-muted">Latest items in the catalogue</p>
        </div>
        <Link
          to="/inventory"
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
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<Clock className="size-6" />}
            title="No items yet"
            description="Add your first inventory item to get started."
          />
        ) : (
          recent.map((item) => (
            <Link
              key={item.id}
              to={`/items/${item.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-subtle/60"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle font-mono text-xs font-bold text-secondary">
                {item.sku.slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">{item.itemName}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted">
                  <Clock className="size-3" />
                  {timeAgo(item.createdAt)} · {item.storageLocation}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-primary">
                  {formatINR(item.price)}
                </p>
                <p className="text-[11px] text-muted">× {item.quantity}</p>
              </div>
              <div className="hidden sm:block">
                <StockBadge quantity={item.quantity} />
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
