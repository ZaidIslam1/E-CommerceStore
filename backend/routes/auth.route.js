import { Router } from "express";
import { signup, login, logout, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

export default router;
