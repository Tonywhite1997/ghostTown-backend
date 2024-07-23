import express from "express";
import { getUsers, getUser } from "../controllers/userController";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/", protectRoute, getUsers);
router.get("/:userId", protectRoute, getUser);

export default router;
