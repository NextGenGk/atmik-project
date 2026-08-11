import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { StatCards } from "../components/dashboard/StatCards";
import { AnalyticsCharts } from "../components/dashboard/AnalyticsCharts";
import { LowStockList } from "../components/dashboard/LowStockList";
import { RecentItems } from "../components/dashboard/RecentItems";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import { useInventory, useStats } from "../lib/queries";

export function Dashboard() {
  const allStats = useStats();
  const categories = useMemo(
    () => Object.keys(allStats.data?.byCategory ?? {}).sort(),
    [allStats.data]
  );

  const [category, setCategory] = useState("");
  const stats = useStats(category || undefined);
  const inventory = useInventory({
    page: 1,
    limit: 50,
    category: category || undefined,
  });

  return (
    <AppShell
      title="Dashboard Overview"
      subtitle="Real-time insights and operational metrics for Atmik Bharat facilities."
    >
      <div className="space-y-6">

        {stats.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[118px] rounded-xl" />
            ))}
          </div>
        ) : stats.isError ? (
          <Card className="p-5 text-sm text-danger">
            Could not load stats — {stats.error instanceof Error ? stats.error.message : "unknown error"}
          </Card>
        ) : (
          <>
            <StatCards stats={stats.data!} />
            <AnalyticsCharts 
              stats={stats.data!} 
              items={inventory.data?.data ?? []} 
              categoryFilter={
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: "", label: "All Departments" },
                    ...categories.map((c) => ({ value: c, label: c })),
                  ]}
                  className="w-full"
                />
              }
            />
          </>
        )}

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecentItems items={inventory.data?.data ?? []} loading={inventory.isLoading} />
          </div>
          <div className="lg:col-span-2">
            <LowStockList items={inventory.data?.data ?? []} loading={inventory.isLoading} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
