import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getCurrentMonthRange } from "../utils/dateUtils";
import UsageRecord from "../models/usageRecord.model";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";
import { IPlan } from "../models/Plan.model";

export const recordUsage = asyncHandler(async (req: Request, res: Response) => {
  const { userId, action, usedUnits } = req.body;

  if (!userId || !action || !usedUnits) {
    throw new ApiError(400, "userId, action, and usedUnits are required");
  }

  if (typeof usedUnits !== "number" || usedUnits < 1) {
    throw new ApiError(400, "usedUnits must be a positive number");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const record = await UsageRecord.create({ userId, action, usedUnits });

  res.status(201).json(
    new ApiResponse(201, record, "Usage recorded successfully")
  );
});

export const getCurrentUsage = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const subscription = await Subscription.findOne({
      userId: id,
      isActive: true,
    }).populate("planId");

    if (!subscription) {
      throw new ApiError(404, "No active subscription found for this user");
    }

    const { start, end } = getCurrentMonthRange();

    const usageResult = await UsageRecord.aggregate([
      {
        $match: {
          userId: subscription.userId,
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalUsed: { $sum: "$usedUnits" },
        },
      },
    ]);

    const totalUsed = usageResult.length > 0 ? usageResult[0].totalUsed : 0;
    const plan = subscription.planId as unknown as IPlan;
    const remaining = Math.max(0, plan.monthlyQuota - totalUsed);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, name: user.name },
          currentMonth: {
            totalUsed,
            remaining,
            quota: plan.monthlyQuota,
          },
          activePlan: {
            id: plan._id,
            name: plan.name,
            monthlyQuota: plan.monthlyQuota,
            extraChargePerUnit: plan.extraChargePerUnit,
          },
        },
        "Current usage fetched successfully"
      )
    );
  }
);