import express from "express";
import { getChat, getAllChats, readChats } from "../controllers/chatController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/", protectRoute, getAllChats);
router.get("/:id", protectRoute, getChat);
router.patch("/:id", protectRoute, readChats);

export default router;
