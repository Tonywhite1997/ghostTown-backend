import express from "express";
import { uploadPhoto } from "../controllers/photo";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.post("/", protectRoute, uploadPhoto);

export default router;
