import express from "express";
import { getMe, login, register } from "../controllers/auth";
import { protectRoute } from "../middleware/protectRoute";

export const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", protectRoute, getMe);

export default router;
