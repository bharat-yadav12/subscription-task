import { Router } from "express";
import { recordUsage, getCurrentUsage } from "../controllers/usage.controller";

const router = Router();

router.post("/", recordUsage);
router.get("/users/:id/current-usage", getCurrentUsage);

export default router;