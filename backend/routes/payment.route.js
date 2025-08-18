import { Router } from "express";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = Router();

// Protected routes that require authentication
router.post("/create-checkout-session", protectRoute, createCheckoutSession);

// Public route for checkout success (called after returning from Stripe)
router.post("/checkout-success", checkoutSuccess);

export default router;
