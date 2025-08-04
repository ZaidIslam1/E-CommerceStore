import { Router } from "express";
import { protectRoute } from "../middleware/protectRoute";

const router = Router();
router.use(protectRoute);

router.get("/", getCartProducts);
router.post("/", addToCart);
router.put("/:id", updateQuantity);
router.delete("/", removeAllQuantity);

export default router;
