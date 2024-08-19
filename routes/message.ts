import express from "express";

import { getMessages, sendMessage } from "../controllers/messageController";
import { uploadPhoto } from "../controllers/photo";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/", protectRoute, getMessages);
router.post("/:id", protectRoute, uploadPhoto, sendMessage);

export default router;
