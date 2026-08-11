import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as itemController from "../controllers/item.controller.js";
import {
  createItemSchema,
  idParamsSchema,
  querySchema,
  skuParamsSchema,
  updateItemSchema,
} from "../schemas/item.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(querySchema, "query"), asyncHandler(itemController.list));
router.get("/stats", asyncHandler(itemController.stats));
router.get("/sku/:sku/check", validate(skuParamsSchema, "params"), asyncHandler(itemController.checkSku));
router.get("/:id", validate(idParamsSchema, "params"), asyncHandler(itemController.getById));
router.post("/", validate(createItemSchema), asyncHandler(itemController.create));
router.put(
  "/:id",
  validate(idParamsSchema, "params"),
  validate(updateItemSchema),
  asyncHandler(itemController.update)
);
router.delete("/:id", validate(idParamsSchema, "params"), asyncHandler(itemController.remove));

export default router;
