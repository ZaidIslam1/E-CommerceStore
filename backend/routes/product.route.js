import { Router } from "express";
import { getAllProducts, getFeatured } from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminRoute } from "../middleware/adminRoute.js";

const router = Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeatured);

export default router;
