import type { ReactNode } from "react";
import { Sidebar, MobileDrawer, useMobileNav } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileBottomNav } from "./MobileBottomNav";

export interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const { open, setOpen } = useMobileNav();

  return (
    <div className="flex min-h-dvh bg-base">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenu={() => setOpen(true)}
          actions={actions}
        />
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-line-subtle px-6 py-4 text-center text-xs text-muted mb-16 md:mb-0">
          &copy; {new Date().getFullYear()} Atmik Bharat Inventory Console
        </footer>
      </div>
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
      <MobileBottomNav />
    </div>
  );
}
