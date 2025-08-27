import { Request, Response, NextFunction } from "express";
import {
  getActivitiesService,
  getActivityService,
} from "../services/activityService";
import { successResponse } from "../../../utils/response";

export const getActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileId } = req.params;
    const user = req.user;
    const data = await getActivitiesService({ fileId, user });
    await successResponse(res, 200, "Activities fetched successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { activityId } = req.params;
    const user = req.user;
    const data = await getActivityService({ activityId, user });
    await successResponse(res, 200, "Activity fetched successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
