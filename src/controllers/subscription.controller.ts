import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";
import Plan from "../models/Plan.model";

export const createSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      throw new ApiError(400, "userId and planId are required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    const existingSubscription = await Subscription.findOne({
      userId,
      isActive: true,
    });
    if (existingSubscription) {
      throw new ApiError(
        409,
        "User already has an active subscription. Deactivate it before creating a new one."
      );
    }

    const subscription = await Subscription.create({
      userId,
      planId,
      startDate: new Date(),
      isActive: true,
    });

    const populatedSubscription = await Subscription.findById(
      subscription._id
    )
      .populate("userId", "name")
      .populate("planId", "name monthlyQuota extraChargePerUnit");

    res.status(201).json(
      new ApiResponse(
        201,
        populatedSubscription,
        "Subscription created successfully"
      )
    );
  }
);

export const getAllSubscriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const subscriptions = await Subscription.find()
      .populate("userId", "name")
      .populate("planId", "name monthlyQuota extraChargePerUnit");

    if (!subscriptions || subscriptions.length === 0) {
      throw new ApiError(404, "No subscriptions found");
    }

    res.status(200).json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscriptions fetched successfully"
      )
    );
  }
);

export const getSubscriptionById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subscription = await Subscription.findById(id)
      .populate("userId", "name")
      .populate("planId", "name monthlyQuota extraChargePerUnit");

    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    res.status(200).json(
      new ApiResponse(200, subscription, "Subscription fetched successfully")
    );
  }
);

export const getSubscriptionByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const subscription = await Subscription.findOne({
      userId,
      isActive: true,
    })
      .populate("userId", "name")
      .populate("planId", "name monthlyQuota extraChargePerUnit");

    if (!subscription) {
      throw new ApiError(404, "No active subscription found for this user");
    }

    res.status(200).json(
      new ApiResponse(
        200,
        subscription,
        "Subscription fetched successfully"
      )
    );
  }
);

export const deactivateSubscription = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    if (!subscription.isActive) {
      throw new ApiError(400, "Subscription is already inactive");
    }

    subscription.isActive = false;
    await subscription.save();

    res.status(200).json(
      new ApiResponse(
        200,
        subscription,
        "Subscription deactivated successfully"
      )
    );
  }
);

export const changePlan = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { planId } = req.body;

    if (!planId) {
      throw new ApiError(400, "planId is required");
    }

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      throw new ApiError(404, "Subscription not found");
    }

    if (!subscription.isActive) {
      throw new ApiError(400, "Cannot change plan of an inactive subscription");
    }
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }
    if (subscription.planId.toString() === planId) {
      throw new ApiError(400, "User is already on this plan");
    }
    subscription.planId = planId;
    await subscription.save();

    const updatedSubscription = await Subscription.findById(id)
      .populate("userId", "name")
      .populate("planId", "name monthlyQuota extraChargePerUnit");

    res.status(200).json(
      new ApiResponse(
        200,
        updatedSubscription,
        "Plan changed successfully"
      )
    );
  }
);