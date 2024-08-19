import express from "express";
import { savePhoto, uploadPhoto } from "../controllers/photo";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.post("/", protectRoute, uploadPhoto, savePhoto);

export default router;
