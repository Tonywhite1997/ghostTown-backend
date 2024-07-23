import express from "express";
import { getChat, getAllChats } from "../controllers/chatController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/", protectRoute, getAllChats);
router.get("/:id", protectRoute, getChat);

export default router;
