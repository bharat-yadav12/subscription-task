import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import User from "../models/user.model"
import Subscription from "../models/subscription.model";

export const getAllUsers = asyncHandler(
  async (_req: Request, res: Response) => {

    const users = await User.find().select("_id name");

    res.status(200).json(
      new ApiResponse(
        200,
        users,
        "Users fetched successfully"
      )
    );
  }
);
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const subscription = await Subscription.findOne({
    userId: id,
    isActive: true,
  }).populate("planId");

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: { id: user._id, name: user.name },
        activeSubscription: subscription || null,
      },
      "User fetched successfully"
    )
  );
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    console.log('createuser is called:',req.body.name)
  const { name } = req.body;
  console.log('name is ',name);
  
  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const user = await User.create({ name });

  res.status(201).json(
    new ApiResponse(201, user, "User created successfully")
  );
});

export const updateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      throw new ApiError(400, "Name is required");
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(
        200,
        updatedUser,
        "User updated successfully"
      )
    );
  }
);

export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "User deleted successfully"
      )
    );
  }
);