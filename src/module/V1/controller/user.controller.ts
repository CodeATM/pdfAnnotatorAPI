import { Response, Request, NextFunction } from "express";
import User from "../models/userModel";
import { getUser, updateUserService } from "../services/userService";
import { successResponse } from "../../../utils/response";

export const myAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user;

    const data = await getUser(userId);

    await successResponse(res, 200, "profile fetched successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const editProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user;

    const userInfo = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      avatar: req.body.avatar,
      usage: req.body.usage,
      username: req.body.username
    };

    const data = await updateUserService({ userInfo, userId });

    await successResponse(res, 200, "profile updated successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
