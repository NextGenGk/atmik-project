import { z } from "zod";

export const SKU_REGEX = /^[A-Z0-9][A-Z0-9-]{2,31}$/;

export function normalizeSku(value: string): string {
  return value.trim().toUpperCase();
}

const itemFormSchema = z.object({
  itemName: z
    .string()
    .trim()
    .min(3, "Item name must be at least 3 characters")
    .max(120, "Item name must be at most 120 characters"),
  sku: z
    .string()
    .trim()
    .toUpperCase()
    .regex(SKU_REGEX, "SKU: letters, numbers and hyphens only (A-Z, 0-9, -), 3–32 chars"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(50, "Category must be at most 50 characters"),
  price: z.coerce
    .number({ errorMap: () => ({ message: "Price must be a number" }) })
    .finite("Price must be a finite number")
    .min(0, "Price cannot be negative")
    .max(9_999_999_999, "Price is too large"),
  quantity: z.coerce
    .number({ errorMap: () => ({ message: "Quantity must be a number" }) })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative"),
  storageLocation: z
    .string()
    .trim()
    .min(2, "Storage location must be at least 2 characters")
    .max(60, "Storage location must be at most 60 characters"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

export { itemFormSchema };
