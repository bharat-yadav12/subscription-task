import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { getCurrentMonthRange, formatDate, getMonthEndDisplay } from "../utils/dateUtils";
import UsageRecord from "../models/usageRecord.model";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";
import { IPlan } from "../models/Plan.model";
export const getBillingSummary = asyncHandler(
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

    const quota: number = plan.monthlyQuota;
    const extraUnits = totalUsed > quota ? totalUsed - quota : 0;
    const extraCharges = parseFloat(
      (extraUnits * plan.extraChargePerUnit).toFixed(2)
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, name: user.name },
          billingPeriod: {
            from: formatDate(start),
            to: getMonthEndDisplay(end),
          },
          usage: {
            totalUsed,
            planQuota: quota,
            extraUnits,
            extraCharges,
          },
          activePlan: {
            id: plan._id,
            name: plan.name,
            monthlyQuota: plan.monthlyQuota,
            extraChargePerUnit: plan.extraChargePerUnit,
          },
        },
        "Billing summary fetched successfully"
      )
    );
  }
);