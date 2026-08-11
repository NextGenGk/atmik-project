import { Item } from "../models/Item.js";
import { LOW_STOCK_THRESHOLD } from "../models/Item.js";
import { ApiError } from "../utils/ApiError.js";
import {
  type CreateItemInput,
  type QueryInput,
  type UpdateItemInput,
} from "../schemas/item.js";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  name_asc: { itemName: 1 },
  name_desc: { itemName: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  qty_asc: { quantity: 1 },
  qty_desc: { quantity: -1 },
  createdAt_desc: { createdAt: -1 },
  createdAt_asc: { createdAt: 1 },
};

const COLLATION = { locale: "en", strength: 2 } as const;

type LeanItem = Record<string, unknown> & { _id: unknown };

function toOutput<T extends LeanItem>(doc: T) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(query: QueryInput): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  const search = query.search?.trim();

  if (search) {
    const tokens = search.split(/\s+/).filter(Boolean);
    const tokenConditions = tokens.map((token) => {
      const escapedToken = escapeRegex(token);
      const directRegex = new RegExp(escapedToken, "i");
      const fuzzyPattern =
        token.length >= 2
          ? token.split("").map(escapeRegex).join(".*?")
          : escapedToken;
      const fuzzyRegex = new RegExp(fuzzyPattern, "i");

      return {
        $or: [
          { itemName: { $regex: directRegex } },
          { sku: { $regex: directRegex } },
          { category: { $regex: directRegex } },
          { storageLocation: { $regex: directRegex } },
          { itemName: { $regex: fuzzyRegex } },
          { sku: { $regex: fuzzyRegex } },
          { category: { $regex: fuzzyRegex } },
          { storageLocation: { $regex: fuzzyRegex } },
        ],
      };
    });

    if (tokenConditions.length === 1) {
      filter.$or = tokenConditions[0].$or;
    } else if (tokenConditions.length > 1) {
      filter.$and = tokenConditions;
    }
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.stockStatus === "low") {
    filter.quantity = { $lte: LOW_STOCK_THRESHOLD };
  } else if (query.stockStatus === "out") {
    filter.quantity = 0;
  }

  return filter;
}

export async function listItems(query: QueryInput) {
  const filter = buildFilter(query);
  const limit = query.limit;
  const skip = (query.page - 1) * limit;

  const sort = SORT_MAP[query.sort] ?? SORT_MAP.createdAt_desc;

  const find = Item.find(filter).sort(sort).skip(skip).limit(limit);

  const [items, totalItems] = await Promise.all([
    find.collation(COLLATION).lean(),
    Item.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const page = Math.min(query.page, totalPages);

  return {
    items: items.map(toOutput),
    pagination: { page, limit, totalItems, totalPages },
  };
}

export async function getItemById(id: string) {
  const item = await Item.findById(id).lean();
  if (!item) throw new ApiError(404, "Item not found");
  return toOutput(item);
}

export async function createItem(payload: CreateItemInput) {
  const item = await Item.create(payload);
  return item;
}

export async function updateItem(id: string, payload: UpdateItemInput) {
  if (payload.sku !== undefined) {
    await assertSkuAvailable(payload.sku, id);
  }
  const item = await Item.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!item) throw new ApiError(404, "Item not found");
  return toOutput(item);
}

export async function deleteItem(id: string) {
  const item = await Item.findByIdAndDelete(id).lean();
  if (!item) throw new ApiError(404, "Item not found");
  return { id: String(item._id) };
}

export async function findItemBySku(sku: string) {
  const item = await Item.findOne({ sku }).lean();
  return item ? toOutput(item) : null;
}

export async function assertSkuAvailable(sku: string, excludeId?: string): Promise<void> {
  const existing = await Item.findOne({ sku }).select("_id").lean();
  if (existing && String(existing._id) !== excludeId) {
    throw new ApiError(409, "SKU already exists", { sku: "SKU already exists — try another" });
  }
}

export async function getStats(category?: string) {
  const filter = category ? { category } : {};
  const [totalItems, outOfStock, lowStockAgg, valueAgg, catAgg, skuList] = await Promise.all([
    Item.countDocuments(filter),
    Item.countDocuments({ ...filter, quantity: 0 }),
    Item.countDocuments({ ...filter, quantity: { $gte: 1, $lte: LOW_STOCK_THRESHOLD } }),
    Item.aggregate<{ total: number | null }>([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]),
    Item.aggregate<{ _id: string; count: number }>([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Item.distinct("sku", filter),
  ]);

  return {
    totalItems,
    totalSkus: skuList.length,
    lowStockCount: lowStockAgg,
    outOfStockCount: outOfStock,
    inventoryValue: valueAgg[0]?.total ?? 0,
    byCategory: Object.fromEntries(catAgg.map((c) => [c._id, c.count])),
  };
}

export { LOW_STOCK_THRESHOLD };
