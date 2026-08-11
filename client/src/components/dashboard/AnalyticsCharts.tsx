import { Link } from "react-router-dom";
import { PieChart, BarChart3, FileSpreadsheet } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import type { Stats, Item } from "../../lib/api";

const CATEGORY_COLORS = [
  "#2563eb", // Royal Blue
  "#059669", // Emerald Green
  "#7c3aed", // Deep Purple
  "#d97706", // Amber
  "#db2777", // Pink
  "#0891b2", // Cyan
  "#ea580c", // Orange
  "#4f46e5", // Indigo
];

interface AnalyticsChartsProps {
  stats: Stats;
  items: Item[];
  categoryFilter?: React.ReactNode;
}

export function AnalyticsCharts({ stats, items, categoryFilter }: AnalyticsChartsProps) {

  // Compute category data
  const categoryEntries = Object.entries(stats.byCategory || {});
  const totalCategoryItems = categoryEntries.reduce((sum, [, count]) => sum + count, 0);

  // Compute category values from items array
  const categoryValueMap: Record<string, number> = {};
  items.forEach((item) => {
    const val = item.price * item.quantity;
    categoryValueMap[item.category] = (categoryValueMap[item.category] || 0) + val;
  });

  // Prepare Donut chart slices
  let cumulativeAngle = 0;
  const chartSlices = categoryEntries.map(([category, count], idx) => {
    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
    const valueRatio = totalCategoryItems > 0 ? count / totalCategoryItems : 0;
    const angle = valueRatio * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    return {
      category,
      count,
      color,
      percentage: Math.round(valueRatio * 100),
      startAngle,
      angle,
    };
  });

  // Calculate SVG arc paths for donut
  function getCoordinatesForAngle(angle: number, radius = 40) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(rad),
      y: 50 + radius * Math.sin(rad),
    };
  }

  // Stock status breakdown logic
  const inStockCount = Math.max(0, stats.totalItems - stats.lowStockCount - stats.outOfStockCount);
  const stockLevels = [
    { label: "Healthy Stock", count: inStockCount, color: "#10b981", path: "/inventory" },
    { label: "Low Stock Alert", count: stats.lowStockCount, color: "#f59e0b", path: "/inventory?stockStatus=low" },
    { label: "Out of Stock", count: stats.outOfStockCount, color: "#ef4444", path: "/inventory?stockStatus=out" },
  ];
  const maxStockCount = Math.max(...stockLevels.map((s) => s.count), 1);

  // Export CSV functionality
  const handleDownloadCSV = () => {
    let csv = "Category,Item Count,Total Value (INR)\n";
    categoryEntries.forEach(([category, count]) => {
      const val = categoryValueMap[category] || 0;
      csv += `"${category}",${count},${val.toFixed(2)}\n`;
    });
    csv += `\nStock Status,Count\n`;
    stockLevels.forEach((sl) => {
      csv += `"${sl.label}",${sl.count}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `atmik-inventory-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <Card className="p-6">
      {/* Header bar with controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line-subtle pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="size-5 text-accent-500" />
            <h2 className="font-display text-base font-bold text-primary">Atmik Stock Intelligence</h2>
          </div>
          <p className="text-xs text-muted mt-0.5">Visual stock metrics & departmental allocation</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {categoryFilter && (
            <div className="w-full sm:w-48">
              {categoryFilter}
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCSV}
            title="Export CSV data report"
            className="text-xs w-full justify-center sm:w-auto"
          >
            <FileSpreadsheet className="size-3.5" />
            <span>CSV Data</span>
          </Button>
        </div>
      </div>

      {/* Main Grid Visuals */}
      <div className="mt-4 grid gap-6 lg:grid-cols-12">
        {/* Donut Chart Visual */}
        <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-subtle/30 p-4 lg:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Departmental Allocation
            </h3>
            <span className="text-xs font-bold text-accent-500">
              {stats.totalItems} Items
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-3 sm:flex-row sm:justify-around">
            {/* SVG Donut */}
            <div className="relative size-44 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                {chartSlices.map((slice) => {
                  if (slice.angle <= 0) return null;
                  const startCoord = getCoordinatesForAngle(slice.startAngle);
                  const endCoord = getCoordinatesForAngle(slice.startAngle + slice.angle - 0.01);
                  const largeArcFlag = slice.angle > 180 ? 1 : 0;
                  const pathData = [
                    `M ${startCoord.x} ${startCoord.y}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${endCoord.x} ${endCoord.y}`,
                  ].join(" ");

                  return (
                    <path
                      key={slice.category}
                      d={pathData}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="12"
                      className="transition-all duration-300 hover:opacity-80"
                    />
                  );
                })}
              </svg>

              {/* Donut Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Total Categories
                </span>
                <span className="font-display text-xl font-extrabold text-primary">
                  {chartSlices.length}
                </span>
              </div>
            </div>

            {/* Category Breakdown Table Legend */}
            <div className="w-full space-y-1.5 sm:w-auto">
              {chartSlices.slice(0, 5).map((cs) => (
                <Link
                  key={cs.category}
                  to={`/inventory?category=${encodeURIComponent(cs.category)}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-xs transition-colors hover:bg-subtle/80"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: cs.color }} />
                    <span className="truncate font-medium text-secondary">{cs.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono">
                    <span className="font-bold text-primary">
                      {cs.percentage}%
                    </span>
                    <span className="text-[10px] text-muted">
                      [{cs.count}]
                    </span>
                  </div>
                </Link>
              ))}
              {chartSlices.length > 5 && (
                <p className="text-center text-[10px] italic text-muted">
                  + {chartSlices.length - 5} more categories
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Status Bar Graph */}
        <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-subtle/30 p-4 lg:col-span-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Stock Health Status
            </h3>
            <div className="flex items-center gap-1">
              <BarChart3 className="size-3.5 text-muted" />
              <span className="text-xs font-mono text-muted">Distribution</span>
            </div>
          </div>

          <div className="space-y-4 py-2">
            {stockLevels.map((sl) => {
              const widthPct = Math.round((sl.count / maxStockCount) * 100);
              return (
                <Link
                  key={sl.label}
                  to={sl.path}
                  className="block space-y-1.5 rounded-lg p-1.5 transition-colors hover:bg-subtle/60"
                >
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <span className="font-medium text-secondary truncate">{sl.label}</span>
                    <span className="font-mono text-[11px] font-bold text-primary shrink-0">
                      {sl.count} items <span className="text-muted">({Math.round((sl.count / Math.max(1, stats.totalItems)) * 100)}%)</span>
                    </span>
                  </div>

                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-surface p-0.5 border border-line-subtle">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(widthPct, 4)}%`,
                        backgroundColor: sl.color,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-line-subtle pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
            <span>Threshold: Low ≤ 10 units</span>
            <span>Total: {stats.totalItems} items tracked</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
