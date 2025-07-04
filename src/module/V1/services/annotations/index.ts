import PdfModel from "../../models/PdfModel";
import mongoose from "mongoose";
import AnnotationModel from "../../models/annotationModel";

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
    throw new BadRequestError("No annotations provided"); // You can also use plain `throw new Error(...)`
  }

  // Validate fileId presence and existence
  const fileId = annotations[0].fileId;

  if (!fileId) {
    throw new BadRequestError("Missing fileId in annotation");
  }

  const fileExists = await PdfModel.findOne({ fileId: fileId });
  if (!fileExists) {
    throw new NotFoundError("The specified file does not exist");
  }

  // Append createdBy to each annotation
  const annotatedWithUser = annotations.map((item) => ({
    ...item,
    fileId: fileExists.id,
    createdBy: new mongoose.Types.ObjectId(user),
  }));

  const created = await AnnotationModel.insertMany(annotatedWithUser);
  return created;
};
