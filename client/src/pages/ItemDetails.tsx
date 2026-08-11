import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  Pencil,
  Printer,
  Trash2,
  Hash,
  Building2,
  Image,
  Download,
  Loader2,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { CopyButton } from "../components/ui/CopyButton";
import { BarcodeView } from "../components/ui/BarcodeView";
import { StockBadge } from "../components/inventory/StockBadge";
import { ItemFormModal } from "../components/inventory/ItemFormModal";
import { DeleteDialog } from "../components/inventory/DeleteDialog";
import { BarcodePrintModal } from "../features/barcode/BarcodePrintModal";
import { useItem } from "../lib/queries";
import { formatINR, formatDateTime } from "../lib/format";
import { useToast } from "../hooks/useToast";

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-right text-sm font-semibold text-primary">{value}</div>
    </div>
  );
}

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = useItem(id);
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);

  const barcodeBoxRef = useRef<HTMLDivElement>(null);

  const handleCopyBarcodeImage = async () => {
    const svgEl = barcodeBoxRef.current?.querySelector("svg");
    if (!svgEl) {
      toast({
        title: "Barcode not ready",
        description: "Barcode image is still rendering.",
        variant: "warning",
      });
      return;
    }
    setCopyingImage(true);
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to render barcode SVG"));
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const scale = 2; // High DPI output
      canvas.width = (img.naturalWidth || 320) * scale;
      canvas.height = (img.naturalHeight || 120) * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (blob && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast({
          title: "Barcode Image Copied!",
          description: "Image copied directly to your clipboard.",
          variant: "success",
        });
      } else {
        toast({
          title: "Clipboard copy not supported",
          description: "Your browser does not support image copying.",
          variant: "warning",
        });
      }
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy barcode image.",
        variant: "danger",
      });
    } finally {
      setCopyingImage(false);
    }
  };

  const handleDownloadBarcodeImage = async () => {
    const svgEl = barcodeBoxRef.current?.querySelector("svg");
    if (!svgEl || !item.data) return;
    try {
      const xml = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to render barcode SVG"));
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      const scale = 2; // High resolution
      canvas.width = (img.naturalWidth || 320) * scale;
      canvas.height = (img.naturalHeight || 120) * scale;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${item.data.sku}-barcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast({
        title: "Barcode Image Downloaded",
        description: `Saved ${item.data.sku}-barcode.png`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Could not download barcode image.",
        variant: "danger",
      });
    }
  };

  return (
    <AppShell
      title="Item Details"
      subtitle="Full record and barcode"
      actions={
        <Link to="/inventory">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="size-4" />
            Back to inventory
          </Button>
        </Link>
      }
    >
      {item.isLoading ? (
        <Card className="space-y-4 p-6">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </Card>
      ) : item.isError || !item.data ? (
        <ErrorState
          title="Item not found"
          message={(item.error as Error).message ?? "This item may have been deleted."}
          action={
            <Link to="/inventory">
              <Button variant="secondary">Back to inventory</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-accent-500">{item.data.sku}</p>
                  <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-primary">
                    {item.data.itemName}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StockBadge quantity={item.data.quantity} />
                    <Badge>{item.data.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPrintOpen(true)}>
                    <Printer className="size-4" />
                    Label
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteOpen(true)}
                    aria-label="Delete item"
                    className="text-danger hover:bg-tint-danger"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 divide-y divide-line-subtle border-t border-line-subtle">
                <DetailRow
                  icon={<Hash className="size-4" />}
                  label="Quantity in stock"
                  value={
                    <span className={item.data.quantity <= 0 ? "text-danger" : undefined}>
                      {item.data.quantity}
                    </span>
                  }
                />
                <DetailRow
                  icon={<IndianRupee className="size-4" />}
                  label="Unit price"
                  value={formatINR(item.data.price)}
                />
                <DetailRow
                  icon={<Hash className="size-4" />}
                  label="Stock value"
                  value={formatINR(item.data.price * item.data.quantity)}
                />
                <DetailRow
                  icon={<MapPin className="size-4" />}
                  label="Storage location"
                  value={item.data.storageLocation}
                />
                <DetailRow
                  icon={<Building2 className="size-4" />}
                  label="Category"
                  value={item.data.category}
                />
                <DetailRow
                  icon={<Hash className="size-4" />}
                  label="Created"
                  value={formatDateTime(item.data.createdAt)}
                />
                <DetailRow
                  icon={<Hash className="size-4" />}
                  label="Last updated"
                  value={formatDateTime(item.data.updatedAt)}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Barcode · Code 128
              </p>
              <div
                ref={barcodeBoxRef}
                className="mt-3 flex justify-center rounded-lg border border-dashed border-line-strong bg-white py-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <BarcodeView value={item.data.sku} height={48} fontSize={12} />
                  <p className="font-mono text-xs font-semibold text-[#0b0e13]">{item.data.sku}</p>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted">
                Barcode value equals the SKU.
              </p>

              {/* 4 Actions: Copy SKU | Copy Img | Download Img | Print */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <CopyButton value={item.data.sku} label="Copy SKU" />

                <Button
                  variant="secondary"
                  onClick={handleCopyBarcodeImage}
                  disabled={copyingImage}
                  title="Copy barcode image to clipboard"
                  className="px-2 text-xs"
                >
                  {copyingImage ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Image className="size-3.5" />
                  )}
                  <span>Copy Img</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleDownloadBarcodeImage}
                  title="Download barcode PNG image"
                  className="px-2 text-xs"
                >
                  <Download className="size-3.5" />
                  <span>Download Img</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setPrintOpen(true)}
                  className="px-2 text-xs"
                >
                  <Printer className="size-3.5" />
                  <span>Print</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <ItemFormModal open={editOpen} onClose={() => setEditOpen(false)} item={item.data ?? null} />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        item={item.data ?? null}
        onDeleted={() => navigate("/inventory")}
      />
      <BarcodePrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        items={item.data ? [item.data] : []}
      />
    </AppShell>
  );
}
