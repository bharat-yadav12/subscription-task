import { Router } from "express";
import { getBillingSummary } from "../controllers/billing.controller";

const router = Router();

router.get("/users/:id/billing-summary", getBillingSummary);

export default router;