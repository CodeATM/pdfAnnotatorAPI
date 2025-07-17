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

  // Ensure the requesting user is the owner
  if (file.uploadedBy.toString() !== userId) {
    throw new UnauthorizedError(
      "You do not have permission to view access requests for this file"
    );
  }

  // Fetch only pending access requests
  const requests = await AccessRequest.find({
    fileId,
    status: "pending", // Filter for pending requests only
  }).populate("requesterId", "firstName lastName email");

  return {
    requests,
    count: requests.length,
  };
};

