import express from "express";
import { getPlatformStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/platform-stats", getPlatformStats);

export default router;
