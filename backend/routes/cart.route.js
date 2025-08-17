import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    getCartProducts,
    addToCart,
    updateQuantity,
    removeAllQuantity,
} from "../controllers/cart.controller.js";

const router = Router();
router.use(protectRoute);

router.get("/", getCartProducts);
router.post("/add", addToCart);
router.put("/:id", updateQuantity);
router.delete("/", removeAllQuantity);

export default router;
