import express from "express";
import { getChat } from "../controllers/chatController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/:id", protectRoute, getChat);

export default router;
