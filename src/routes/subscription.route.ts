import { Router } from "express";
import {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionByUserId,
  deactivateSubscription,
  changePlan,
} from "../controllers/subscription.controller";

const router = Router();

router.post("/", createSubscription);                   
router.get("/", getAllSubscriptions);  
router.get("/:id", getSubscriptionById); 
router.get("/user/:userId", getSubscriptionByUserId);  
router.patch("/:id/deactivate", deactivateSubscription);  
router.patch("/:id/change-plan", changePlan); 

export default router;