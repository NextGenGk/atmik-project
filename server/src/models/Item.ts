import { Schema, model, type InferSchemaType } from "mongoose";

const LOW_STOCK_THRESHOLD = 10;

const ItemSchema = new Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [3, "Item name must be at least 3 characters"],
      maxlength: [120, "Item name must be at most 120 characters"],
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9][A-Z0-9-]{2,31}$/, "SKU must be letters, numbers and hyphens (A-Z, 0-9, -)"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category must be at most 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      set: (v: number) => Math.round(v * 100) / 100,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    storageLocation: {
      type: String,
      required: [true, "Storage location is required"],
      trim: true,
      maxlength: [60, "Storage location must be at most 60 characters"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

ItemSchema.index({ itemName: "text", sku: "text" });
ItemSchema.index({ category: 1 });
ItemSchema.index({ quantity: 1 });

export type ItemType = InferSchemaType<typeof ItemSchema>;

export const Item = model("Item", ItemSchema);
export { LOW_STOCK_THRESHOLD };
