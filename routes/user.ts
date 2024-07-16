import express from "express";
import { getUsers } from "../controllers/userController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/", protectRoute, getUsers);

export default router;
