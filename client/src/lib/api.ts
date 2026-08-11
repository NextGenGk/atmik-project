import axios, { type AxiosError } from "axios";
import { apiBaseUrl } from "./auth";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: Record<string, string>;
}

export interface Item {
  id: string;
  itemName: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  storageLocation: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemInput = Pick<
  Item,
  "itemName" | "sku" | "category" | "price" | "quantity" | "storageLocation"
>;

export interface InventoryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  stockStatus?: "all" | "low" | "out";
  sort?: string;
}

export interface Stats {
  totalItems: number;
  totalSkus: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
  byCategory: Record<string, number>;
}

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(getter: () => Promise<string | null> | string | null) {
  tokenGetter = async () => {
    const t = await getter();
    return typeof t === "string" ? t : t;
  };
}

http.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const message =
      payload?.message ??
      (status === 0 ? "Cannot reach server" : "Something went wrong");
    return Promise.reject(new ApiClientError(message, status, payload?.errors));
  }
);

function unwrap<T>(res: { data: ApiEnvelope<T> }): { data: T; pagination?: PaginationMeta } {
  return { data: res.data.data, pagination: res.data.pagination };
}

export async function fetchInventory(
  params: InventoryParams = {}
): Promise<{ data: Item[]; pagination?: PaginationMeta }> {
  const res = await http.get<ApiEnvelope<Item[]>>("/inventory", {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      category: params.category || undefined,
      stockStatus: params.stockStatus || undefined,
      sort: params.sort || undefined,
    },
  });
  return unwrap(res);
}

export async function fetchItem(id: string): Promise<Item> {
  const res = await http.get<ApiEnvelope<Item>>(`/inventory/${id}`);
  return unwrap(res).data;
}

export async function fetchStats(category?: string): Promise<Stats> {
  const res = await http.get<ApiEnvelope<Stats>>("/inventory/stats", {
    params: { category: category || undefined },
  });
  return unwrap(res).data;
}

export async function fetchSkuCheck(sku: string): Promise<boolean> {
  const res = await http.get<ApiEnvelope<{ available: boolean }>>(
    `/inventory/sku/${encodeURIComponent(sku)}/check`
  );
  return unwrap(res).data.available;
}

export async function fetchByBarcode(barcode: string): Promise<Item> {
  const res = await http.get<ApiEnvelope<Item>>(`/barcode/${encodeURIComponent(barcode)}`);
  return unwrap(res).data;
}

export async function createItem(input: ItemInput): Promise<Item> {
  const res = await http.post<ApiEnvelope<Item>>("/inventory", input);
  return unwrap(res).data;
}

export async function updateItem(id: string, input: Partial<ItemInput>): Promise<Item> {
  const res = await http.put<ApiEnvelope<Item>>(`/inventory/${id}`, input);
  return unwrap(res).data;
}

export async function deleteItem(id: string): Promise<{ id: string }> {
  const res = await http.delete<ApiEnvelope<{ id: string }>>(`/inventory/${id}`);
  return unwrap(res).data;
}
