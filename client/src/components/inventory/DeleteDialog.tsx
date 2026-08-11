import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import type { Item } from "../../lib/api";
import { useDeleteItem } from "../../lib/queries";
import { useToast } from "../../hooks/useToast";

export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  item: Item | null;
  onDeleted?: () => void;
}

export function DeleteDialog({ open, onClose, item, onDeleted }: DeleteDialogProps) {
  const [confirm, setConfirm] = useState("");
  const del = useDeleteItem();
  const { toast } = useToast();

  const canDelete = confirm.trim().toUpperCase() === (item?.sku ?? "").toUpperCase();

  const run = async () => {
    if (!item || !canDelete) return;
    try {
      await del.mutateAsync(item.id);
      toast({
        title: "Item deleted",
        description: `${item.itemName} (${item.sku}) was removed.`,
        variant: "success",
      });
      setConfirm("");
      onClose();
      onDeleted?.();
    } catch (e) {
      toast({
        title: "Could not delete item",
        description: (e as Error).message,
        variant: "danger",
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirm("");
        onClose();
      }}
      size="sm"
      kicker="Danger zone"
      title="Delete item?"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setConfirm("");
              onClose();
            }}
            disabled={del.isPending}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={run} disabled={!canDelete} loading={del.isPending}>
            <Trash2 className="size-4" />
            Delete item
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-tint-danger p-3.5">
        <Trash2 className="mt-0.5 size-5 shrink-0 text-danger" />
        <p className="text-sm leading-relaxed text-secondary">
          This permanently removes <span className="font-semibold text-primary">{item?.itemName}</span>{" "}
          (<code className="font-mono text-xs">{item?.sku}</code>) from inventory. This action cannot
          be undone.
        </p>
      </div>
      <div className="mt-4">
        <label className="text-[13px] font-semibold text-secondary">
          Type <code className="font-mono text-xs text-accent-500">{item?.sku}</code> to confirm
        </label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={item?.sku}
          autoFocus
          className="mt-1.5 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-primary outline-none transition-colors placeholder:text-muted/70 focus:border-line-strong"
        />
      </div>
    </Modal>
  );
}
