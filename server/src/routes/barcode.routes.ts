import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as barcodeController from "../controllers/barcode.controller.js";
import { barcodeParamsSchema } from "../schemas/item.js";

const router = Router();

router.get(
  "/:barcode",
  requireAuth,
  validate(barcodeParamsSchema, "params"),
  asyncHandler(barcodeController.lookupByBarcode)
);

export default router;
