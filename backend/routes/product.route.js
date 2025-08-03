import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminRoute } from "../middleware/adminRoute.js";

const router = Router();

router.get("/", protectRoute, adminRoute, getAllProducts);

export default router;
