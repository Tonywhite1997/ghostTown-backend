import express from "express";

import { getMessages, sendMessage } from "../controllers/messageController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.post("/:id", protectRoute, sendMessage);
router.get("/", protectRoute, getMessages);

export default router;
