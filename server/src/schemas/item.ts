import { z } from "zod";

export const skuRegex = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export const createItemSchema = z.object({
  itemName: z
    .string({ message: "Item name is required" })
    .trim()
    .min(3, "At least 3 characters")
    .max(120, "At most 120 characters"),
  sku: z
    .string({ message: "SKU is required" })
    .trim()
    .toUpperCase()
    .regex(skuRegex, "Letters, numbers and hyphens only (A-Z, 0-9, -)"),
  category: z
    .string({ message: "Category is required" })
    .trim()
    .min(1, "Category is required")
    .max(50, "At most 50 characters"),
  price: z
    .number({ message: "Price is required" })
    .finite("Price must be a finite number")
    .min(0, "Price cannot be negative")
    .max(9_999_999_999, "Price is too large"),
  quantity: z
    .number({ message: "Quantity is required" })
    .int("Whole number only")
    .min(0, "Quantity cannot be negative"),
  storageLocation: z
    .string({ message: "Storage location is required" })
    .trim()
    .min(2, "At least 2 characters")
    .max(60, "At most 60 characters"),
});

export const updateItemSchema = createItemSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, {
    message: "Provide at least one field to update",
  });

export const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .pipe(z.union([z.literal(10), z.literal(25), z.literal(50)]))
    .default(10),
  search: z.string().trim().max(50, "Search term too long").optional(),
  category: z.string().trim().max(50, "Category too long").optional(),
  stockStatus: z.enum(["all", "low", "out"]).optional(),
  sort: z
    .enum([
      "name_asc",
      "name_desc",
      "price_asc",
      "price_desc",
      "qty_asc",
      "qty_desc",
      "createdAt_desc",
      "createdAt_asc",
    ])
    .default("createdAt_desc"),
});

export const idParamsSchema = z.object({
  id: z.string().length(24, "Invalid id"),
});

export const skuParamsSchema = z.object({
  sku: z.string().trim().toUpperCase().regex(skuRegex, "Invalid SKU format"),
});

export const barcodeParamsSchema = z.object({
  barcode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(skuRegex, "Invalid barcode / SKU format"),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type QueryInput = z.infer<typeof querySchema>;
