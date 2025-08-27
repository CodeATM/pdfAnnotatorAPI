import PdfModel from "../../models/PdfModel";
import mongoose from "mongoose";
import AnnotationModel from "../../models/annotationModel";
import { createActivity } from "../activityService";
import { ActivityType } from "../../models/activityModel";

import {
  BadRequestError,
  NotFoundError,
} from "../../middlewares/error.middleware";

interface AddAnnotationsParams {
  annotations: any[];
  user: any;
}

export const addAnnotationService = async ({
  annotations,
  user,
}: AddAnnotationsParams) => {
  if (!Array.isArray(annotations) || annotations.length === 0) {
    throw new BadRequestError("No annotations provided");
  }

  const fileId = annotations[0].fileId;

  if (!fileId) {
    throw new BadRequestError("Missing fileId in annotation");
  }

  const fileExists = await PdfModel.findOne({ fileId: fileId });
  if (!fileExists) {
    throw new NotFoundError("The specified file does not exist");
  }

  const annotatedWithUser = annotations.map((item) => ({
    ...item,
    fileId: fileExists.id,
    createdBy: new mongoose.Types.ObjectId(user),
  }));
  const created = await AnnotationModel.insertMany(annotatedWithUser);

  const mapAnnotationTypeToActivity = (type: string): ActivityType => {
    switch (type) {
      case "highlight":
        return "highlight_added";
      case "underline":
        return "underline_added";
      default:
        throw new BadRequestError(`Unsupported annotation type: ${type}`);
    }
  };

  const activities = [];
  for (const annotation of created) {
    const activityType = mapAnnotationTypeToActivity(annotation.type);
    const activity = await createActivity({
      payload: {
        actor: user,
        fileId: fileId,
        type: activityType,
        others: {
          message: `added a ${annotation.type} on page ${annotation.pageNumber}`,
          annotationId: annotation._id,
        },
      },
    });
    activities.push(activity);
  }

  return created;
};
