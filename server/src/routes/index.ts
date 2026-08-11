import { Router } from "express";
import itemRoutes from "./item.routes.js";
import barcodeRoutes from "./barcode.routes.js";

const router = Router();

router.use("/inventory", itemRoutes);
router.use("/barcode", barcodeRoutes);

export default router;
