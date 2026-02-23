import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import Plan from "../models/Plan.model";
import Subscription from "../models/subscription.model";

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const { name, monthlyQuota, extraChargePerUnit } = req.body;

  if (!name || !monthlyQuota || !extraChargePerUnit) {
    throw new ApiError(
      400,
      "name, monthlyQuota and extraChargePerUnit are required"
    );
  }

  if (typeof monthlyQuota !== "number" || monthlyQuota < 1) {
    throw new ApiError(400, "monthlyQuota must be a positive number");
  }

  if (typeof extraChargePerUnit !== "number" || extraChargePerUnit < 0) {
    throw new ApiError(400, "extraChargePerUnit must be a non-negative number");
  }

  const existingPlan = await Plan.findOne({ name });
  if (existingPlan) {
    throw new ApiError(409, `Plan with name "${name}" already exists`);
  }

  const plan = await Plan.create({ name, monthlyQuota, extraChargePerUnit });

  res.status(201).json(
    new ApiResponse(201, plan, "Plan created successfully")
  );
});

export const getAllPlans = asyncHandler(async (req: Request, res: Response) => {
  const plans = await Plan.find();

  if (!plans || plans.length === 0) {
    throw new ApiError(404, "No plans found");
  }

  res.status(200).json(
    new ApiResponse(200, plans, "Plans fetched successfully")
  );
});

export const getPlanById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    res.status(200).json(
      new ApiResponse(200, plan, "Plan fetched successfully")
    );
  }
);

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, monthlyQuota, extraChargePerUnit } = req.body;

  const plan = await Plan.findById(id);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  if (name !== undefined) plan.name = name;
  if (monthlyQuota !== undefined) {
    if (typeof monthlyQuota !== "number" || monthlyQuota < 1) {
      throw new ApiError(400, "monthlyQuota must be a positive number");
    }
    plan.monthlyQuota = monthlyQuota;
  }
  if (extraChargePerUnit !== undefined) {
    if (typeof extraChargePerUnit !== "number" || extraChargePerUnit < 0) {
      throw new ApiError(
        400,
        "extraChargePerUnit must be a non-negative number"
      );
    }
    plan.extraChargePerUnit = extraChargePerUnit;
  }

  const updatedPlan = await plan.save();

  res.status(200).json(
    new ApiResponse(200, updatedPlan, "Plan updated successfully")
  );
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const plan = await Plan.findById(id);
  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  const activeSubscriptions = await Subscription.findOne({
    planId: id,
    isActive: true,
  });

  if (activeSubscriptions) {
    throw new ApiError(
      400,
      "Cannot delete plan that has active subscriptions. Deactivate subscriptions first."
    );
  }

  await Plan.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, "Plan deleted successfully")
  );
});