import { Router } from "express";
import { createUser, getUserById,getAllUsers,updateUser,deleteUser } from "../controllers/user.controller";
import { getCurrentUsage } from "../controllers/usage.controller";
import { getBillingSummary } from "../controllers/billing.controller";
const router = Router();

router.post("/", createUser);
router.get("/:id", getUserById);
router.get("/", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/:id/current-usage", getCurrentUsage);
router.get("/:id/billing-summary", getBillingSummary);  
export default router;