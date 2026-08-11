import { Link } from "react-router-dom";
import { Package, Wallet, Bell, XCircle } from "lucide-react";
import { StatCard } from "../ui/StatCard";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import type { Stats } from "../../lib/api";
import { formatINR, formatINRCompact, formatNumber } from "../../lib/format";

export function StatCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Link to="/inventory" className="block transition-transform hover:-translate-y-0.5">
        <StatCard
          label="Total Tracked Assets"
          value={<AnimatedNumber value={stats.totalItems} format={formatNumber} />}
          sub={`${formatNumber(stats.totalSkus)} unique SKUs`}
          icon={<Package className="size-5" />}
          tone="accent"
        />
      </Link>

      <Link to="/inventory" className="block transition-transform hover:-translate-y-0.5">
        <StatCard
          label="Gross Asset Valuation"
          value={<AnimatedNumber value={stats.inventoryValue} format={formatINRCompact} />}
          sub={formatINR(stats.inventoryValue)}
          icon={<Wallet className="size-5" />}
          tone="info"
        />
      </Link>

      <Link to="/inventory?stockStatus=low" className="block transition-transform hover:-translate-y-0.5">
        <StatCard
          label="Depletion Warnings"
          value={<AnimatedNumber value={stats.lowStockCount} format={formatNumber} />}
          sub="Click to review depletion warnings"
          icon={<Bell className="size-5" />}
          tone="warning"
        />
      </Link>

      <Link to="/inventory?stockStatus=out" className="block transition-transform hover:-translate-y-0.5">
        <StatCard
          label="Critical Shortages"
          value={<AnimatedNumber value={stats.outOfStockCount} format={formatNumber} />}
          sub="Click to review critical shortages"
          icon={<XCircle className="size-5" />}
          tone="danger"
        />
      </Link>
    </div>
  );
}
