import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminRoute } from "../middleware/adminRoute.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = Router();
router.get("/", protectRoute, adminRoute, getAnalytics);

export default router;
