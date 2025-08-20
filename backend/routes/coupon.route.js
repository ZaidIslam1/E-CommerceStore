import { Router } from "express";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = Router();
router.use(protectRoute);

router.get("/", getCoupon);
router.post("/validate", validateCoupon);

export default router;
