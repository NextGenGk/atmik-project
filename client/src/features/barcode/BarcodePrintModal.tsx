import { Printer } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import type { Item } from "../../lib/api";
import { BarcodeLabel } from "./BarcodeLabel";

export interface BarcodePrintModalProps {
  open: boolean;
  onClose: () => void;
  items: Item[];
  title?: string;
}

export function BarcodePrintModal({
  open,
  onClose,
  items,
  title = "Print barcode labels",
}: BarcodePrintModalProps) {
  const print = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      kicker={`${items.length} label${items.length === 1 ? "" : "s"}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={print} disabled={items.length === 0}>
            <Printer className="size-4" />
            Print labels
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-secondary">
        Only the barcode labels will be printed. Use <kbd className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs">Ctrl/⌘ + P</kbd> if the browser dialog does not open.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <BarcodeLabel key={item.id} item={item} />
        ))}
      </div>
    </Modal>
  );
}
