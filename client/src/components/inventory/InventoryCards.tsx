import { Link } from "react-router-dom";
import { Pencil, Trash2, ScanBarcode } from "lucide-react";
import type { Item } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { StockBadge } from "./StockBadge";
import { Card } from "../ui/Card";

export interface InventoryCardsProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function InventoryCards({ items, onEdit, onDelete }: InventoryCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                to={`/items/${item.id}`}
                className="block truncate font-semibold text-primary transition-colors hover:text-accent-500"
              >
                {item.itemName}
              </Link>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <code className="font-mono font-medium">{item.sku}</code>
                <span>·</span>
                <span>{item.category}</span>
              </p>
              <p className="mt-1 truncate text-xs text-muted">📍 {item.storageLocation}</p>
            </div>
            <StockBadge quantity={item.quantity} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-subtle px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Qty</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-primary">{item.quantity}</p>
            </div>
            <div className="rounded-lg bg-subtle px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Price</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-primary">
                {formatINR(item.price)}
              </p>
            </div>
            <div className="rounded-lg bg-subtle px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Value</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-primary">
                {formatINR(item.price * item.quantity)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Link
              to={`/items/${item.id}`}
              className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line text-xs font-semibold text-secondary transition-colors hover:bg-subtle hover:text-primary"
            >
              <ScanBarcode className="size-3.5" />
              View
            </Link>
            <button
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.itemName}`}
              className="flex h-8 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-subtle hover:text-accent-500"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.itemName}`}
              className="flex h-8 w-9 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:bg-tint-danger hover:text-danger"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
