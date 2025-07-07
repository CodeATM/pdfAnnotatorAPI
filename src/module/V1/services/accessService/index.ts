import { AccessRequest } from "../../models/invitesModel";
import PdfModel from "../../models/PdfModel";
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../middlewares/error.middleware";

export const getAllRequestsService = async ({
  fileId,
  userId,
}: {
  fileId: string;
  userId: any;
}) => {
  // Check if the file exists
  const file = await PdfModel.findOne({ fileId });
  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Ensure the requesting user is the owner or has admin rights
  if (file.uploadedBy.toString() !== userId) {
    throw new UnauthorizedError(
      "You do not have permission to view access requests for this file"
    );
  }

  // Fetch access requests and populate user details
  const requests = await AccessRequest.find({ fileId }).populate(
    "requesterId",
    "name email"
  );

  return requests;
};
