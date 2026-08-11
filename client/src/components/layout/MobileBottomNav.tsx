import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Boxes, ScanLine, Plus } from "lucide-react";
import { cn } from "../../lib/cn";
import { cameraStore } from "../../features/scanner/cameraStore";
import { ItemFormModal } from "../inventory/ItemFormModal";

export function MobileBottomNav() {
  const [newItemOpen, setNewItemOpen] = useState(false);

  const handleScannerClick = () => {
    cameraStore.turnOn();
  };

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around border-t border-line-subtle bg-surface/95 px-2 backdrop-blur-lg md:hidden shadow-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors",
              isActive ? "text-accent-500 font-bold" : "text-muted hover:text-primary"
            )
          }
        >
          <LayoutDashboard className="size-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors",
              isActive ? "text-accent-500 font-bold" : "text-muted hover:text-primary"
            )
          }
        >
          <Boxes className="size-5" />
          <span>Inventory</span>
        </NavLink>

        {/* Center Floating Action Button for New Item */}
        <button
          onClick={() => setNewItemOpen(true)}
          className="flex size-11 items-center justify-center rounded-full bg-accent-600 text-on-accent shadow-glow transition-transform active:scale-95"
          title="Add New Item"
        >
          <Plus className="size-6" />
        </button>

        <NavLink
          to="/scanner"
          onClick={handleScannerClick}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-colors",
              isActive ? "text-accent-500 font-bold" : "text-muted hover:text-primary"
            )
          }
        >
          <ScanLine className="size-5" />
          <span>Scanner</span>
        </NavLink>
      </nav>

      {/* New Item Modal (No redirect) */}
      <ItemFormModal open={newItemOpen} onClose={() => setNewItemOpen(false)} />
    </>
  );
}
