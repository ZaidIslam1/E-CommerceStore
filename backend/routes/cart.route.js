import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    getCartProducts,
    addToCart,
    updateQuantity,
    removeAllQuantity,
    clearCart,
} from "../controllers/cart.controller.js";

const router = Router();
router.use(protectRoute);

router.get("/", getCartProducts);
router.post("/add", addToCart);
router.put("/:productId", updateQuantity);
router.delete("/", removeAllQuantity);
router.delete("/clear", clearCart);

export default router;
