import { Router } from "express";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = Router();
router.use(protectRoute);

router.post("/create-checkout-session", createCheckoutSession);
router.post("/checkout-success", checkoutSuccess);

export default router;
