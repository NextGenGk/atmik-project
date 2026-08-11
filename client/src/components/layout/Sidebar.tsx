import { useState, useSyncExternalStore } from "react";
import { Boxes, LayoutDashboard, ScanLine, X, ChevronRight, PanelLeftClose } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { clerkEnabled } from "../../lib/auth";
import { UserButton, useUser } from "@clerk/clerk-react";
import { sidebarStore } from "./sidebarStore";

import { BookOpen } from "lucide-react";

interface NavItemDef {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  external?: boolean;
}

const NAV: NavItemDef[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "Asset Directory", icon: Boxes },
  { to: "/scanner", label: "Smart Scan", icon: ScanLine },
];

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
      <div className="flex shrink-0 items-center justify-center">
        <img
          src="/light-transparent-logo.png"
          alt="Atmik Logo"
          className="h-8 w-auto object-contain"
        />
      </div>
      <div className={cn("min-w-0", collapsed && "hidden")}>
        <p className="truncate font-display text-[15px] font-bold leading-tight tracking-tight text-primary">
          Atmik Bharat
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted truncate">
          Inventory Console
        </p>
      </div>
    </NavLink>
  );
}

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
      {NAV.map(({ to, label, icon: Icon, end, external }) => {
        if (external) {
          return (
            <a
              key={to}
              href={to}
              target="_blank"
              rel="noreferrer"
              title={label}
              className={cn(
                "group flex items-center justify-start gap-3 rounded-xl px-2 py-1.5 text-sm font-semibold transition-all duration-150",
                collapsed && "justify-center",
                "text-secondary hover:bg-subtle hover:text-primary"
              )}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors bg-subtle group-hover:bg-raised"
              >
                <Icon className="size-[18px]" />
              </span>
              <span className={cn("truncate", collapsed && "hidden")}>{label}</span>
            </a>
          );
        }

        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={label}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-start gap-3 rounded-xl px-2 py-1.5 text-sm font-semibold transition-all duration-150",
                collapsed && "justify-center",
                isActive
                  ? "bg-accent-600 text-on-accent shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                  : "text-secondary hover:bg-subtle hover:text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive ? "bg-white/15" : "bg-subtle group-hover:bg-raised"
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className={cn("truncate", collapsed && "hidden")}>{label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const collapsed = useSyncExternalStore(
    sidebarStore.subscribe,
    sidebarStore.isCollapsed
  );
  const { user } = useUser();

  return (
    <aside
      className={cn(
        "sticky top-0 z-20 hidden h-dvh shrink-0 flex-col border-r border-line-subtle bg-surface transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "md:w-16" : "md:w-64"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-line-subtle", collapsed ? "justify-center px-0" : "justify-between px-4")}>
        <Brand collapsed={collapsed} />
        <button
          onClick={() => sidebarStore.toggle()}
          className={cn(
            "flex items-center justify-center text-muted hover:bg-subtle hover:text-primary transition-colors",
            collapsed
              ? "absolute -right-3 top-5 size-6 rounded-full border border-line-subtle bg-surface shadow-sm z-10"
              : "rounded-lg p-1.5"
          )}
        >
          {collapsed ? <ChevronRight className="size-3" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col py-5">
        <NavItems collapsed={collapsed} />
      </div>

      <div className="border-t border-line-subtle p-3">
        <div className={cn("flex items-center gap-3 rounded-xl px-2 py-2", collapsed && "justify-center px-0")}>
          {clerkEnabled ? (
            <>
              <UserButton afterSignOutUrl="/" />
              <div className={cn("min-w-0", collapsed && "hidden")}>
                <p className="truncate text-xs font-bold text-primary">
                  {user?.fullName || user?.firstName || "Account"}
                </p>
                <p className="truncate text-[11px] text-muted">
                  {user?.primaryEmailAddress?.emailAddress || "Inventory Console"}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tint-accent text-xs font-bold text-accent-600">
                A
              </div>
              <div className={cn("min-w-0", collapsed && "hidden")}>
                <p className="truncate text-xs font-bold text-primary">Atmik Admin</p>
                <p className="truncate text-[11px] text-muted">Inventory Console</p>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div className={cn("fixed inset-0 z-[80] md:hidden", open ? "block" : "hidden")}>
      <div
        className="absolute inset-0 bg-overlay animate-[fade-in_0.15s_ease-out]"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 flex w-[280px] flex-col border-l border-line-subtle bg-surface animate-[scale-in_0.2s_ease-out]">
        <div className="flex h-16 items-center justify-between border-b border-line-subtle px-4">
          <Brand />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-muted hover:bg-subtle hover:text-primary transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col justify-between py-4">
          <NavItems collapsed={false} onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

export function useMobileNav() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
