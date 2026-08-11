import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import type { Item } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { StockBadge } from "./StockBadge";
import { cn } from "../../lib/cn";

export interface InventoryTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-subtle text-[11px] font-bold uppercase tracking-wider text-muted">
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-right">Qty</th>
            <th className="px-4 py-3 text-right">Unit Price</th>
            <th className="px-4 py-3 text-right">Stock Value</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="group border-b border-line-subtle transition-colors last:border-b-0 hover:bg-subtle/60"
            >
              <td className="max-w-[260px] px-4 py-3.5">
                <Link
                  to={`/items/${item.id}`}
                  className="block truncate font-semibold text-primary transition-colors hover:text-accent-500"
                >
                  {item.itemName}
                </Link>
              </td>
              <td className="px-4 py-3.5">
                <code className="font-mono text-[13px] font-medium text-secondary">
                  {item.sku}
                </code>
              </td>
              <td className="px-4 py-3.5">
                <span className="rounded-md bg-subtle px-2 py-0.5 text-xs font-medium text-secondary">
                  {item.category}
                </span>
              </td>
              <td
                className={cn(
                  "px-4 py-3.5 text-right font-semibold tabular-nums",
                  item.quantity <= 0 ? "text-danger" : "text-primary"
                )}
              >
                {item.quantity}
              </td>
              <td className="px-4 py-3.5 text-right font-medium tabular-nums text-secondary">
                {formatINR(item.price)}
              </td>
              <td className="px-4 py-3.5 text-right tabular-nums text-primary">
                {formatINR(item.price * item.quantity)}
              </td>
              <td className="px-4 py-3.5">
                <StockBadge quantity={item.quantity} />
              </td>
              <td className="px-4 py-3.5 text-xs whitespace-nowrap text-muted">
                {item.storageLocation}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.itemName}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-subtle hover:text-accent-500"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${item.itemName}`}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-tint-danger hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
