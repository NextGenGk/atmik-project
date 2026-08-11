import { type Request, type Response } from "express";
import { ok } from "../types/responses.js";
import { findItemBySku } from "../services/item.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function lookupByBarcode(req: Request, res: Response) {
  const sku = req.params.barcode;
  const item = await findItemBySku(sku);
  if (!item) {
    throw new ApiError(404, `No item found for barcode "${sku}"`);
  }
  res.json(ok(item, "Item found"));
}
