import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  Flashlight,
  ImagePlus,
  ListChecks,
  Loader2,
  ScanLine,
  XCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import { StockBadge } from "../components/inventory/StockBadge";
import {
  decodeImageFromFile,
  useCameraScanner,
} from "../features/scanner/useCameraScanner";
import { cameraStore } from "../features/scanner/cameraStore";
import { useBarcodeLookup } from "../lib/queries";
import type { Item } from "../lib/api";
import { formatINR, timeAgo } from "../lib/format";
import { useToast } from "../hooks/useToast";

type ScanStatus = "scanning" | "matched" | "not-found" | "error";

interface ScanEntry {
  id: number;
  text: string;
  at: number;
  status: ScanStatus;
  item?: Item;
}

const SCAN_HISTORY_KEY = "atmik_scanned_items_history";

function loadSavedScans(): ScanEntry[] {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage parse error
  }
  return [];
}

export function Scanner() {
  const [manual, setManual] = useState("");
  const [active, setActive] = useState(true);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [scans, setScans] = useState<ScanEntry[]>(loadSavedScans);
  const [uploading, setUploading] = useState(false);

  const nextIdRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(scans));
    } catch {
      // Storage quota safety
    }
  }, [scans]);

  useEffect(() => {
    cameraStore.setOn(active);
    return () => cameraStore.setOn(false);
  }, [active]);

  useEffect(() => {
    return cameraStore.subscribe(() => {
      setActive((a) => (cameraStore.isOn() ? a : false));
    });
  }, []);

  const onScan = (text: string) => {
    const clean = text.trim().toUpperCase();
    if (!clean) return;
    setManual(clean);
    setScans((prev) => {
      const now = Date.now();
      const last = prev[0];
      if (last && last.text === clean && now - last.at < 3000) return prev;
      nextIdRef.current += 1;
      return [
        { id: nextIdRef.current, text: clean, at: now, status: "scanning" as const },
        ...prev,
      ].slice(0, 50);
    });
  };

  const {
    videoRef,
    status,
    error,
    torch,
    torchSupported,
    toggleTorch,
    lastResult,
    devices,
  } = useCameraScanner({ onResult: onScan, active, deviceId });

  const lookup = useBarcodeLookup(manual, manual.length >= 3);

  useEffect(() => {
    setScans((prev) => {
      let changed = false;
      const next = prev.map((s) => {
        if (lookup.isSuccess && lookup.data && s.status === "scanning" && s.text === lookup.data.sku) {
          changed = true;
          return { ...s, status: "matched" as const, item: lookup.data };
        }
        if (
          lookup.isError &&
          s.status === "scanning" &&
          s.text === manual.trim().toUpperCase()
        ) {
          changed = true;
          const err = lookup.error as { status?: number };
          return { ...s, status: (err.status === 404 ? "not-found" : "error") as ScanStatus };
        }
        return s;
      });
      return changed ? next : prev;
    });
  }, [lookup.isSuccess, lookup.isError, lookup.data, lookup.error, manual]);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const text = await decodeImageFromFile(file);
    setUploading(false);
    if (text) {
      onScan(text);
      toast({
        title: "Barcode decoded",
        description: text,
        variant: "success",
      });
    } else {
      toast({
        title: "No barcode found",
        description: "Could not read a barcode from that image.",
        variant: "warning",
      });
    }
  };

  const copySku = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast({ title: "Copied SKU", description: text, variant: "success" });
  };

  const item = lookup.data;
  const scanning = status === "scanning";
  const matchedCount = scans.filter((s) => s.status === "matched").length;

  const [bannerVisible, setBannerVisible] = useState(true);

  return (
    <AppShell title="Atmik Smart Scan" subtitle="Utilize optical recognition to instantly log or audit physical assets.">
      <div className="space-y-4">
        {/* Short Banner: Ready to Scan (Dismissable) */}
        {bannerVisible && (
          <Card className="relative flex flex-col gap-4 border-line-accent/30 bg-gradient-to-r from-tint-accent/20 via-surface to-surface p-4 shadow-sm">
            <button
              onClick={() => setBannerVisible(false)}
              aria-label="Dismiss banner"
              className="absolute top-3 right-3 rounded-lg p-1 text-muted hover:bg-subtle hover:text-primary transition-colors"
              title="Dismiss instructions"
            >
              <X className="size-4" />
            </button>

            <div className="space-y-1 pr-6 lg:pr-0">
              <div className="flex items-center gap-2">
                <ScanLine className="size-5 text-accent-500" />
                <h2 className="font-display text-base font-bold text-primary">Optical Scanner Initialization</h2>
              </div>
              <p className="text-xs text-secondary">
                Ensure target asset label is fully illuminated and aligned within the targeting reticle for automated capture.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 text-xs pr-6 lg:pr-0">
              <div className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 text-secondary">
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-on-accent">1</span>
                <span>Position barcode within viewfinder targeting frame</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 text-secondary">
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-on-accent">2</span>
                <span>Maintain steady focus for optical read</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 text-secondary">
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-on-accent">3</span>
                <span>Asset record automatically retrieved</span>
              </div>
            </div>
          </Card>
        )}

        {/* Main 2-Column Layout */}
        <div className="grid gap-5 lg:grid-cols-12 max-w-7xl mx-auto w-full">
          {/* Left Column: Spacious Camera Viewport & Search Bar */}
          <div className="space-y-4 lg:col-span-8">
            <Card className="overflow-hidden border-line-subtle shadow-card">
              {/* Header with Camera ON/OFF Switch */}
              <div className="flex items-center justify-between border-b border-line-subtle bg-subtle/40 px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <span
                    className={
                      active && scanning
                        ? "size-2 rounded-full bg-emerald-500 animate-pulse"
                        : "size-2 rounded-full bg-muted"
                    }
                  />
                  <span>{active ? (scanning ? "Camera Active" : "Starting Camera…") : "Camera Paused"}</span>
                </div>

                <div className="flex items-center gap-2">
                  {torchSupported && active && (
                    <button
                      type="button"
                      onClick={toggleTorch}
                      aria-label="Toggle flashlight"
                      className={`flex size-8 items-center justify-center rounded-md border text-xs transition-colors ${
                        torch ? "border-amber-500/50 bg-amber-500/10 text-amber-500" : "border-line bg-surface text-secondary hover:text-primary"
                      }`}
                    >
                      <Flashlight className="size-4" />
                    </button>
                  )}

                  <Button
                    variant={active ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => {
                      const next = !active;
                      setActive(next);
                      cameraStore.setOn(next);
                    }}
                  >
                    {active ? <CameraOff className="size-3.5" /> : <Camera className="size-3.5" />}
                    <span>{active ? "Turn Off Camera" : "Turn On Camera"}</span>
                  </Button>
                </div>
              </div>

              {/* Spacious Camera Viewport */}
              <div className="relative h-[340px] sm:h-[380px] lg:h-[400px] w-full bg-black/90">
                {active ? (
                  <>
                    <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />

                    {/* Corner Target Brackets */}
                    <div className="pointer-events-none absolute inset-6 border border-accent-500/25 rounded-xl">
                      <div className="absolute top-0 left-0 size-6 border-t-2 border-l-2 border-accent-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 size-6 border-t-2 border-r-2 border-accent-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 size-6 border-b-2 border-l-2 border-accent-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 size-6 border-b-2 border-r-2 border-accent-500 rounded-br-lg" />

                      {/* Laser Beam */}
                      {!error && scanning && (
                        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2">
                          <div className="h-24 rounded-lg border border-dashed border-accent-400/35 bg-accent-500/5" />
                          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-accent-400 to-transparent shadow-glow animate-[scanline_2.2s_ease-in-out_infinite]" />
                        </div>
                      )}
                    </div>

                    {/* Scan Match Pulse */}
                    {lastResult && (
                      <div
                        key={lastResult.time}
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 animate-[fade-in_0.15s_ease-out]"
                      >
                        <div className="flex items-center gap-2.5 rounded-full bg-emerald-500 px-5 py-2.5 text-on-accent shadow-glow animate-[spring-pop_0.2s_ease-out]">
                          <Check className="size-5 stroke-[3]" />
                          <span className="font-mono text-base font-extrabold tracking-wider">{lastResult.text}</span>
                        </div>
                      </div>
                    )}

                    {status === "starting" && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/75">
                        <Loader2 className="size-6 animate-spin text-accent-500" />
                        <span className="text-xs font-semibold text-muted">Opening camera stream…</span>
                      </div>
                    )}

                    {error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 p-6 text-center">
                        <CameraOff className="size-8 text-danger" />
                        <p className="max-w-xs text-xs text-secondary leading-relaxed">{error}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <ScanLine className="size-10 text-muted" />
                    <p className="text-sm font-semibold text-primary">Camera is turned off</p>
                    <Button variant="secondary" size="sm" onClick={() => setActive(true)}>
                      <Camera className="size-4" /> Turn On Camera
                    </Button>
                  </div>
                )}
              </div>

              {/* Input Bar */}
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end bg-surface border-t border-line-subtle">
                <Input
                  label="Barcode / SKU Input"
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="Enter SKU or scan barcode..."
                  leading={<ScanLine className="size-4" />}
                  containerClassName="flex-1"
                />

                {devices.length > 1 && active && (
                  <Select
                    value={deviceId ?? ""}
                    onChange={(e) => setDeviceId(e.target.value || undefined)}
                    placeholder="Default Camera"
                    options={devices.map((d, i) => ({
                      value: d.deviceId,
                      label: d.label || `Camera ${i + 1}`,
                    }))}
                    className="min-w-[150px]"
                    aria-label="Select camera device"
                  />
                )}

                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <Button
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="shrink-0"
                >
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                  <span>{uploading ? "Decoding…" : "Upload Image"}</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Matched Item (only when active/loading) & Spacious Scanned List */}
          <div className="space-y-4 lg:col-span-4 flex flex-col justify-start">
            {/* Matched Product Card — Rendered ONLY when searching or item matched */}
            {lookup.isLoading ? (
              <Card className="space-y-4 p-5 animate-pulse">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Skeleton className="h-14 rounded-lg" />
                  <Skeleton className="h-14 rounded-lg" />
                </div>
              </Card>
            ) : item ? (
              <Card className="p-5 border-line-accent bg-surface shadow-card animate-[fade-in_0.2s_ease-out]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent-500">{item.sku}</span>
                      <button
                        type="button"
                        onClick={() => copySku(item.sku)}
                        className="rounded p-0.5 text-muted hover:text-primary transition-colors"
                        title="Copy SKU"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                    <h2 className="mt-1 font-display text-lg font-bold text-primary">
                      {item.itemName}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StockBadge quantity={item.quantity} />
                      <span className="rounded-md bg-subtle px-2 py-0.5 text-xs font-semibold text-secondary">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <Link to={`/items/${item.id}`}>
                    <Button size="sm">
                      View Item
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line-subtle pt-4">
                  <div className="rounded-lg bg-subtle/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted">Stock Quantity</p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-primary">{item.quantity} units</p>
                  </div>
                  <div className="rounded-lg bg-subtle/60 p-3">
                    <p className="text-[10px] font-bold uppercase text-muted">Unit Price</p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums text-accent-500">
                      {formatINR(item.price)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-muted">Storage Location: {item.storageLocation}</p>
              </Card>
            ) : null}

            {/* Spacious Scanned List Register */}
            <Card className="flex-1 overflow-hidden border-line-subtle shadow-card flex flex-col">
              <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3 bg-subtle/30">
                <h3 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-primary">
                  <ListChecks className="size-4 text-accent-500" />
                  Session Audit Log ({matchedCount}/{scans.length})
                </h3>
                {scans.length > 0 && (
                  <button
                    onClick={() => {
                      setScans([]);
                      localStorage.removeItem(SCAN_HISTORY_KEY);
                    }}
                    className="text-xs font-semibold text-muted hover:text-danger transition-colors"
                  >
                    Clear log
                  </button>
                )}
              </div>

              {scans.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center min-h-[260px]">
                  <ScanLine className="size-8 text-muted/40" />
                  <p className="text-sm font-semibold text-primary">No scans recorded yet</p>
                  <p className="text-xs text-muted max-w-xs">
                    Barcodes scanned by camera, uploaded images, or entered manually will appear in this live log.
                  </p>
                </div>
              ) : (
                <ul className="flex-1 max-h-[460px] divide-y divide-line-subtle overflow-y-auto">
                  {scans.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-subtle/40 transition-colors">
                      <span className="shrink-0">
                        {s.status === "matched" && <CheckCircle2 className="size-4 text-emerald-500" />}
                        {s.status === "not-found" && <CircleAlert className="size-4 text-amber-500" />}
                        {s.status === "error" && <XCircle className="size-4 text-danger" />}
                        {s.status === "scanning" && <Loader2 className="size-4 animate-spin text-muted" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-mono text-xs font-bold text-primary">{s.text}</p>
                          {s.item && <StockBadge quantity={s.item.quantity} />}
                        </div>
                        <p className="truncate text-xs text-muted mt-0.5">
                          {s.item ? s.item.itemName : s.status === "not-found" ? "Not found in database" : "Checking…"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-mono text-muted">{timeAgo(new Date(s.at))}</p>
                        {s.item && (
                          <Link to={`/items/${s.item.id}`} className="text-xs font-bold text-accent-500 hover:underline">
                            View Item
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
