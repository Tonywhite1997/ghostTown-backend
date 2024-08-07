import express from "express";
import {
  getMe,
  login,
  register,
  deleteAccount,
  changePassword,
  logout,
} from "../controllers/auth";
import { protectRoute } from "../middleware/protectRoute";

export const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/logout", protectRoute, logout);
router.get("/me", protectRoute, getMe);
router.patch("/change-password", protectRoute, changePassword);
router.delete("/", protectRoute, deleteAccount);

export default router;
