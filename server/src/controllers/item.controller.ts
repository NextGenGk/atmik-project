import { type Request, type Response } from "express";
import { ok, okPaginated } from "../types/responses.js";
import * as itemService from "../services/item.service.js";
import { type CreateItemInput, type QueryInput, type UpdateItemInput } from "../schemas/item.js";

export async function list(req: Request, res: Response) {
  const { items, pagination } = await itemService.listItems(
    req.query as unknown as QueryInput
  );
  res.json(okPaginated(items, pagination));
}

export async function stats(req: Request, res: Response) {
  const category =
    typeof req.query.category === "string" && req.query.category.length > 0
      ? req.query.category
      : undefined;
  const data = await itemService.getStats(category);
  res.json(ok(data));
}

export async function getById(req: Request, res: Response) {
  const item = await itemService.getItemById(req.params.id);
  res.json(ok(item));
}

export async function checkSku(req: Request, res: Response) {
  const available = await itemService.assertSkuAvailable(req.params.sku).then(
    () => true,
    () => false
  );
  res.json(ok({ available }));
}

export async function create(req: Request, res: Response) {
  const item = await itemService.createItem(req.body as CreateItemInput);
  res.status(201).json(ok(item, "Item created"));
}

export async function update(req: Request, res: Response) {
  const item = await itemService.updateItem(req.params.id, req.body as UpdateItemInput);
  res.json(ok(item, "Item updated"));
}

export async function remove(req: Request, res: Response) {
  const data = await itemService.deleteItem(req.params.id);
  res.json(ok(data, "Item deleted"));
}
