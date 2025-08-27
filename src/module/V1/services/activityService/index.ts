import { Activity, IActivity } from "../../models/activityModel";
import {
  BadRequestError,
  NotFoundError,
} from "../../middlewares/error.middleware";
import { FormatActivities } from "../../../../utils/formatter";

interface CreateActivityPayload {
  actor: string;
  fileId: string;
  type: string;
  visibility?: "system" | "user" | "private";
  targetUser?: string;
  others?: Record<string, any>;
}

export const createActivity = async ({
  payload,
}: {
  payload: CreateActivityPayload;
}): Promise<IActivity> => {
  try {
    const {
      actor,
      fileId,
      type,
      visibility = "user",
      targetUser,
      others,
    } = payload;

    if (!actor || !fileId || !type) {
      throw new BadRequestError(
        "actor, fileId, and type are required to create activity"
      );
    }

    const activity = await Activity.create({
      actor,
      fileId,
      type,
      visibility,
      targetUser,
      others,
    });

    console.log(activity);

    return activity;
  } catch (error) {
    console.error("Activity creation failed:", error);
  }
};

export const getActivitiesService = async ({
  fileId,
  user,
}: {
  fileId: string;
  user: any;
}) => {
  const activities = await Activity.find({ fileId }).sort({ createdAt: -1 });

  const formattedResponse = await FormatActivities(activities, user);

  return formattedResponse;
};

export const getActivityService = async ({
  activityId,
  user,
}: {
  activityId: string;
  user: any;
}) => {
  const activity = await Activity.findById(activityId);

  const formattedResponse = await FormatActivities(activity, user);
  
  return formattedResponse;
};
