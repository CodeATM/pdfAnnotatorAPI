import { Response, Request, NextFunction } from "express";
import User from "../models/userModel";
import { getUser } from "../services/userService";
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
