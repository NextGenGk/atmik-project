import type { ReactNode } from "react";
import { Sidebar, MobileDrawer, useMobileNav } from "./Sidebar";
import { Topbar } from "./Topbar";

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
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenu={() => setOpen(true)}
          actions={actions}
        />
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-line-subtle px-6 py-4 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Atmik Bharat Inventory Console
        </footer>
      </div>
      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
