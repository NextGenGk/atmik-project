import { useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Menu, PackagePlus, ScanLine } from "lucide-react";
import { cameraStore } from "../../features/scanner/cameraStore";
import { sidebarStore } from "./sidebarStore";
import { ItemFormModal } from "../inventory/ItemFormModal";

export interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenu?: () => void;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, onMenu, actions }: TopbarProps) {
  const navigate = useNavigate();
  const cameraOn = useSyncExternalStore(cameraStore.subscribe, cameraStore.isOn);
  const sidebarCollapsed = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.isCollapsed
  );
  const [newItemOpen, setNewItemOpen] = useState(false);

  const handleScannerClick = () => {
    cameraStore.turnOn();
    navigate("/scanner");
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      onMenu?.();
    } else {
      sidebarStore.toggle();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line-subtle bg-glass px-4 backdrop-blur-md sm:px-6">

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex shrink-0 items-center justify-center md:hidden">
            <img
              src="/light-transparent-logo.png"
              alt="Atmik Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-base font-bold tracking-tight text-primary sm:text-lg">
              {title}
            </h1>
            {subtitle && <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {cameraOn && (
          <button
            onClick={() => cameraStore.turnOff()}
            title="Turn camera off"
            className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line-accent bg-tint-accent px-3 text-sm font-semibold text-accent-500 transition-colors hover:bg-accent-500 hover:text-on-accent"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent-500" />
            </span>
            <Camera className="size-4" />
            <span className="hidden md:inline">Camera on</span>
          </button>
        )}

        <button
          onClick={() => setNewItemOpen(true)}
          title="Register new organizational asset"
          className="hidden sm:flex h-9 shrink-0 items-center gap-2 rounded-lg bg-accent-600 px-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-500 shadow-sm"
        >
          <PackagePlus className="size-4" />
          <span className="hidden sm:inline">Register Asset</span>
        </button>

        <button
          onClick={handleScannerClick}
          title="Open Atmik Smart Scan"
          className="hidden sm:flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line-accent bg-tint-accent/40 px-3 text-sm font-semibold text-accent-500 transition-colors hover:bg-accent-500 hover:text-on-accent"
        >
          <ScanLine className="size-4" />
          <span className="hidden sm:inline">Smart Scan</span>
        </button>

        <button
          onClick={handleMenuClick}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle navigation menu"
          className="md:hidden flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-raised text-secondary transition-colors hover:bg-subtle hover:text-primary"
        >
          <Menu className="size-4.5" />
        </button>
      </header>

      {/* New Item Modal (Opens on current page without redirecting) */}
      <ItemFormModal open={newItemOpen} onClose={() => setNewItemOpen(false)} />
    </>
  );
}
