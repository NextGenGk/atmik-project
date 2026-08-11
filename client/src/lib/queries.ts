import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createItem,
  deleteItem,
  fetchByBarcode,
  fetchInventory,
  fetchItem,
  fetchSkuCheck,
  fetchStats,
  updateItem,
  type InventoryParams,
  type Item,
  type ItemInput,
  type PaginationMeta,
  type Stats,
} from "./api";
import { SKU_REGEX } from "./schemas";

export const queryKeys = {
  inventory: (params: InventoryParams) => ["inventory", params] as const,
  item: (id: string) => ["item", id] as const,
  stats: (category?: string) => ["stats", category ?? "all"] as const,
  sku: (sku: string) => ["sku", sku] as const,
};

const ITEM_CACHE_STALE = 1000 * 60 * 5;

export function useInventory(params: InventoryParams) {
  return useQuery({
    queryKey: queryKeys.inventory(params),
    queryFn: () => fetchInventory(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
    refetchInterval: 15_000,
  });
}

export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.item(id ?? ""),
    queryFn: () => fetchItem(id as string),
    enabled: Boolean(id),
    staleTime: ITEM_CACHE_STALE,
  });
}

export function useStats(category?: string) {
  return useQuery({
    queryKey: queryKeys.stats(category),
    queryFn: () => fetchStats(category),
    staleTime: 1000 * 30,
    refetchInterval: 15_000,
  });
}

export function useSkuCheck(sku: string, enabled = true) {
  const valid = SKU_REGEX.test(sku);
  return useQuery({
    queryKey: queryKeys.sku(sku.toUpperCase()),
    queryFn: () => fetchSkuCheck(sku.toUpperCase()),
    enabled: enabled && valid,
    retry: false,
    staleTime: 0,
  });
}

function invalidateInventory(client: QueryClient) {
  void client.invalidateQueries({ queryKey: ["inventory"] });
  void client.invalidateQueries({ queryKey: queryKeys.stats() });
}

export function useCreateItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => createItem(input),
    onSuccess: (item) => {
      invalidateInventory(client);
      client.setQueryData(queryKeys.item(item.id), item);
    },
  });
}

export function useUpdateItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ItemInput> }) =>
      updateItem(id, input),
    onSuccess: (item) => {
      invalidateInventory(client);
      client.setQueryData(queryKeys.item(item.id), item);
    },
  });
}

export function useDeleteItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: (_data, id) => {
      invalidateInventory(client);
      client.removeQueries({ queryKey: queryKeys.item(id) });
    },
  });
}

export function useBarcodeLookup(barcode: string, enabled = true) {
  const client = useQueryClient();
  const clean = barcode.trim().toUpperCase();
  return useQuery({
    queryKey: ["barcode", clean],
    queryFn: async () => {
      const item = await fetchByBarcode(clean);
      client.setQueryData(queryKeys.item(item.id), item);
      return item;
    },
    enabled: enabled && clean.length >= 3,
    retry: false,
    staleTime: ITEM_CACHE_STALE,
  });
}

export type { Item, ItemInput, PaginationMeta, Stats, InventoryParams };
