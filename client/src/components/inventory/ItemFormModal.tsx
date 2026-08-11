import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select, type Option } from "../ui/Select";
import { useCreateItem, useSkuCheck, useUpdateItem } from "../../lib/queries";
import { itemFormSchema, type ItemFormValues } from "../../lib/schemas";
import type { Item } from "../../lib/api";
import { useToast } from "../../hooks/useToast";

const CATEGORY_PRESETS = [
  "Fasteners",
  "Bearings",
  "Electrical",
  "Hardware",
  "Consumables",
  "Packaging",
];

type FormState = {
  itemName: string;
  sku: string;
  category: string;
  customCategory: string;
  price: string;
  quantity: string;
  storageLocation: string;
};

const EMPTY: FormState = {
  itemName: "",
  sku: "",
  category: "Fasteners",
  customCategory: "",
  price: "",
  quantity: "",
  storageLocation: "",
};

function toForm(item: Item): FormState {
  const isPreset = CATEGORY_PRESETS.includes(item.category);
  return {
    itemName: item.itemName,
    sku: item.sku,
    category: isPreset ? item.category : "CUSTOM",
    customCategory: isPreset ? "" : item.category,
    price: String(item.price),
    quantity: String(item.quantity),
    storageLocation: item.storageLocation,
  };
}

export interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  item?: Item | null;
  categories?: string[];
}

export function ItemFormModal({ open, onClose, item, categories = [] }: ItemFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const isEdit = Boolean(item);
  const create = useCreateItem();
  const update = useUpdateItem();
  const { toast } = useToast();
  const busy = create.isPending || update.isPending;

  useEffect(() => {
    if (open) {
      setForm(item ? toForm(item) : EMPTY);
      setErrors({});
    }
  }, [open, item]);

  const skuValid = itemFormSchema.shape.sku.safeParse(form.sku).success;
  const skuCheck = useSkuCheck(form.sku, !isEdit && skuValid);
  const skuTaken = !isEdit && skuCheck.isSuccess && skuCheck.data === false;
  const showSkuHint =
    !isEdit && skuValid && skuCheck.isSuccess && skuCheck.data === true && skuCheck.isFetched;

  const set = (key: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const categoryOptions: Option[] = useMemo(() => {
    const combined = Array.from(new Set([...CATEGORY_PRESETS, ...categories])).sort();
    const opts: Option[] = combined.map((cat) => ({ value: cat, label: cat }));
    opts.push({ value: "CUSTOM", label: "+ Custom Category..." });
    return opts;
  }, [categories]);

  const handleGenerateSku = () => {
    const prefix = (form.category && form.category !== "CUSTOM" ? form.category.slice(0, 3) : "SKU").toUpperCase();
    const num = Math.floor(1000 + Math.random() * 9000);
    set("sku")(`${prefix}-${num}`);
  };

  const onSubmit = async () => {
    const finalCategory =
      form.category === "CUSTOM" ? form.customCategory.trim() : form.category;

    const payloadToValidate = {
      ...form,
      category: finalCategory,
    };

    const parsed = itemFormSchema.safeParse(payloadToValidate);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        itemName: flat.itemName?.[0],
        sku: flat.sku?.[0],
        category: flat.category?.[0],
        price: flat.price?.[0],
        quantity: flat.quantity?.[0],
        storageLocation: flat.storageLocation?.[0],
      });
      return;
    }

    const v = parsed.data as ItemFormValues;
    const input = {
      itemName: v.itemName,
      sku: v.sku,
      category: v.category,
      price: v.price,
      quantity: v.quantity,
      storageLocation: v.storageLocation,
    };

    try {
      if (item) {
        await update.mutateAsync({ id: item.id, input });
        toast({ title: "Item updated", description: `${input.itemName} was saved.`, variant: "success" });
      } else {
        await create.mutateAsync(input);
        toast({ title: "Item created", description: `${input.itemName} added to inventory.`, variant: "success" });
      }
      onClose();
    } catch (e) {
      const err = e as { message?: string; fieldErrors?: Record<string, string> };
      if (err.fieldErrors) {
        setErrors({
          itemName: err.fieldErrors.itemName,
          sku: err.fieldErrors.sku,
          category: err.fieldErrors.category,
          price: err.fieldErrors.price,
          quantity: err.fieldErrors.quantity,
          storageLocation: err.fieldErrors.storageLocation,
        });
      }
      toast({
        title: isEdit ? "Could not update item" : "Could not create item",
        description: err.message,
        variant: "danger",
      });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      kicker={isEdit ? "Edit item" : "New inventory item"}
      title={isEdit ? item?.itemName ?? "Edit item" : "Add to inventory"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={onSubmit} loading={busy} disabled={skuTaken}>
            {isEdit ? "Save changes" : "Create item"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Row 1: Item Name & SKU */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Item Name"
              value={form.itemName}
              onChange={(e) => set("itemName")(e.target.value)}
              error={errors.itemName}
              placeholder="e.g. M8 Hex Bolt, Zinc Plated"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-secondary mb-1">SKU</label>
              {!isEdit && (
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="flex items-center gap-1 text-[11px] font-bold text-accent-500 hover:underline transition-colors"
                >
                  <Sparkles className="size-3" /> Auto-Generate
                </button>
              )}
            </div>
            <Input
              value={form.sku}
              onChange={(e) => set("sku")(e.target.value.toUpperCase())}
              error={errors.sku}
              placeholder="e.g. BR-6203-2RS"
              hint={showSkuHint ? "SKU is available" : undefined}
            />
            {skuTaken && (
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-danger">
                <AlertCircle className="size-3.5" />
                This SKU is already in use.
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Category Select Dropdown */}
        <div>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => set("category")(e.target.value)}
            error={errors.category}
            options={categoryOptions}
            placeholder="Select a category"
          />

          {form.category === "CUSTOM" && (
            <div className="mt-2 animate-[fade-in_0.15s_ease-out]">
              <Input
                label="Custom Category Name"
                value={form.customCategory}
                onChange={(e) => set("customCategory")(e.target.value)}
                error={errors.category}
                placeholder="Type custom category name..."
              />
            </div>
          )}
        </div>

        {/* Row 3: Price & Quantity */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (INR)"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => set("price")(e.target.value)}
            error={errors.price}
            placeholder="0.00"
            leading="₹"
          />
          <Input
            label="Quantity"
            type="number"
            min={0}
            step={1}
            value={form.quantity}
            onChange={(e) => set("quantity")(e.target.value)}
            error={errors.quantity}
            placeholder="0"
          />
        </div>

        {/* Row 4: Storage Location */}
        <div>
          <Input
            label="Storage Location"
            value={form.storageLocation}
            onChange={(e) => set("storageLocation")(e.target.value)}
            error={errors.storageLocation}
            placeholder="e.g. Bin A-14 / Shelf 3"
          />
        </div>
      </div>
    </Modal>
  );
}
