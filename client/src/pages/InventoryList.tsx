import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackagePlus, PackageSearch, Printer, SlidersHorizontal, X } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { SearchInput } from "../components/ui/SearchInput";
import { SkeletonTable } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Pagination } from "../components/ui/Pagination";
import { InventoryTable } from "../components/inventory/InventoryTable";
import { InventoryCards } from "../components/inventory/InventoryCards";
import { ItemFormModal } from "../components/inventory/ItemFormModal";
import { DeleteDialog } from "../components/inventory/DeleteDialog";
import { BarcodePrintModal } from "../features/barcode/BarcodePrintModal";
import { useDebounce } from "../hooks/useDebounce";
import { useInventory, useStats } from "../lib/queries";
import type { Item } from "../lib/api";

const LIMITS = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
];

const SORTS = [
  { value: "createdAt_desc", label: "Newest first" },
  { value: "createdAt_asc", label: "Oldest first" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
  { value: "qty_asc", label: "Quantity: low → high" },
  { value: "qty_desc", label: "Quantity: high → low" },
];

const STOCK_FILTERS = [
  { value: "all", label: "All Stock Status" },
  { value: "low", label: "Low Stock (≤ 10)" },
  { value: "out", label: "Out of Stock (= 0)" },
];

export function InventoryList() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    if (params.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      const next = new URLSearchParams(params);
      next.delete("new");
      setParams(next, { replace: true });
    }
  }, [params, setParams]);

  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const limit = (params.get("limit") ?? "10") as "10" | "25" | "50";
  const category = params.get("category") ?? "";
  const stockStatus = (params.get("stockStatus") ?? "all") as "all" | "low" | "out";
  const sort = params.get("sort") ?? "createdAt_desc";
  const search = params.get("search") ?? "";

  const debouncedSearch = useDebounce(searchInput, 350);

  const queryParams = useMemo(
    () => ({
      page,
      limit: Number(limit),
      search,
      category: category || undefined,
      stockStatus: stockStatus === "all" ? undefined : stockStatus,
      sort,
    }),
    [page, limit, search, category, stockStatus, sort]
  );

  const inventory = useInventory(queryParams);
  const stats = useStats();

  const updateParams = useCallback(
    (patch: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "" || value === undefined) next.delete(key);
        else next.set(key, String(value));
      }
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch.trim() || null, page: 1 });
    }
  }, [debouncedSearch, search, updateParams]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const commitSearch = (value: string) => {
    setSearchInput(value);
    updateParams({ search: value.trim() || null, page: 1 });
  };

  const categoryOptions = useMemo(() => {
    const cats = Object.keys(stats.data?.byCategory ?? {});
    return Array.from(new Set(["", ...cats])).map((c) => ({
      value: c,
      label: c ? c : "All categories",
    }));
  }, [stats.data]);

  const printItems = inventory.data?.data ?? [];

  const onOpenForm = (item: Item | null = null) => {
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <AppShell
      title="Asset Directory"
      subtitle={`${inventory.data?.pagination?.totalItems ?? "…"} assets · ${category || "all departments"}`}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commitSearch(searchInput)}
              onClear={() => {
                setSearchInput("");
                commitSearch("");
              }}
              loading={debouncedSearch !== searchInput}
              placeholder="Query asset database…"
              aria-label="Query asset database"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="hidden size-4 text-muted lg:block" />
            <Select
              value={category}
              onChange={(e) => updateParams({ category: e.target.value || null, page: 1 })}
              options={categoryOptions}
              className="min-w-[150px]"
              aria-label="Filter by category"
            />
            <Select
              value={stockStatus}
              onChange={(e) => updateParams({ stockStatus: e.target.value === "all" ? null : e.target.value, page: 1 })}
              options={STOCK_FILTERS}
              className="min-w-[150px]"
              aria-label="Filter by stock status"
            />
            <Select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value || null })}
              options={SORTS}
              className="min-w-[160px]"
              aria-label="Sort order"
            />
            <Select
              value={limit}
              onChange={(e) => updateParams({ limit: e.target.value, page: 1 })}
              options={LIMITS}
              className="min-w-[120px]"
              aria-label="Rows per page"
            />
            {(search || category || stockStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  updateParams({ search: null, category: null, stockStatus: null, page: 1 });
                }}
              >
                <X className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {inventory.isError ? (
          <ErrorState
            message={(inventory.error as Error).message}
            action={
              <Button variant="secondary" onClick={() => inventory.refetch()}>
                Retry
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            {inventory.isLoading || inventory.isFetching ? (
              <SkeletonTable rows={Math.min(Number(limit), 8)} cols={9} />
            ) : inventory.data?.data.length === 0 ? (
              <EmptyState
                icon={<PackageSearch className="size-6" />}
                title={search || category ? "No matching items" : "Inventory is empty"}
                description={
                  search || category
                    ? "Try a different search term or clear the filters."
                    : "Add your first item to start building your inventory."
                }
                action={
                  search || category ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearchInput("");
                        updateParams({ search: null, category: null, page: 1 });
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={() => onOpenForm(null)}>
                      <PackagePlus className="size-4" />
                      Add first item
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="hidden md:block">
                  <InventoryTable
                    items={inventory.data?.data ?? []}
                    onEdit={(item) => onOpenForm(item)}
                    onDelete={setDeleting}
                  />
                </div>
                <div className="md:hidden">
                  <InventoryCards
                    items={inventory.data?.data ?? []}
                    onEdit={(item) => onOpenForm(item)}
                    onDelete={setDeleting}
                  />
                </div>
                <div className="flex flex-col gap-2 border-t border-line-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted">
                    Showing {printItems.length} of {inventory.data?.pagination?.totalItems ?? 0} items
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setPrintOpen(true)}>
                    <Printer className="size-4" />
                    Print labels (this page)
                  </Button>
                </div>
                {inventory.data?.pagination && (
                  <Pagination
                    pagination={inventory.data.pagination}
                    onPageChange={(p) => updateParams({ page: p })}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      <ItemFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
        categories={categoryOptions.map((c) => c.value).filter(Boolean)}
      />
      <DeleteDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} item={deleting} />
      <BarcodePrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        items={printItems}
      />
    </AppShell>
  );
}
