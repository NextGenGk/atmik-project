import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <AppShell title="Page not found" subtitle="404">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-subtle text-muted">
          <Compass className="size-8" />
        </div>
        <p className="mt-6 font-mono text-sm font-bold text-accent-500">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary">
          This page doesn't exist
        </h1>
        <p className="mt-2 max-w-sm text-sm text-secondary">
          The link may be broken or the page may have been moved.
        </p>
        <Link to="/" className="mt-6">
          <Button>
            <Home className="size-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
