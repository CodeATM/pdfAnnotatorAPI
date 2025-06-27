import cloudinary from "../../../../utils/3rd-party/cloudinary";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../middlewares/error.middleware";
import PdfModel from "../../models/PdfModel";
import { AccessRequest } from "../../models/invitesModel";

export async function uploadPDFToCloudinary(
  buffer: Buffer,
  originalName?: string
): Promise<string> {
  try {
    const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
      // Generate clean public_id
      const publicId = originalName
        ? `pdf_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`
        : `pdf_${Date.now()}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "pdfs",
          public_id: publicId,
          format: "pdf", // Explicitly set format
          type: "upload",
          tags: ["pdf", "document"],
          access_mode: "public",
          filename: originalName || `document_${Date.now()}.pdf`,
          use_filename: true,
          unique_filename: false,
          transformation: [
            {
              flags: "attachment",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) {
            throw new InternalServerError("Unable to upload PDF");
          } else if (!result) {
            throw new InternalServerError("Unable to upload PDF");
          } else {
            const viewableUrl = result.secure_url.replace(/\?.+$/, "");
            resolve(viewableUrl);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return cloudinaryUrl;
  } catch (error) {
    throw new InternalServerError("Unable to upload PDF");
  }
}
export async function savePDFToDatabase(
  title: string,
  fileUrl: string,
  owner: string,
  size: Number
): Promise<any> {
  try {
    const value = await generateUniqueFileCode();
    const pdf = new PdfModel({
      title,
      fileUrl,
      uploadedBy: owner,
      size,
      fileId: value,
    });

    const savedPdf = await pdf.save();
    return savedPdf;
  } catch (error) {
    throw new InternalServerError("Unable to save PDF");
  }
}

export async function getUserPdfService(userId: any): Promise<any> {
  try {
    const pdfs = await PdfModel.find({ uploadedBy: userId });
    return pdfs;
  } catch (error) {
    throw new InternalServerError("Unable to save PDF");
  }
}

async function generateUniqueFileCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 7;

  let fileId;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random file code
    fileId = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      fileId += characters[randomIndex];
    }

    // Check if it already exists in the database
    const existingCode = await PdfModel.findOne({ fileId }).exec();
    if (!existingCode) {
      isUnique = true; // Code is unique
    }
  }

  return fileId;
}

export async function requestAccessService({
  fileId,
  requesterId,
}: any): Promise<any> {
  await FileExist(fileId);
  const existingRequest = await AccessRequest.findOne({
    fileId,
    requesterId,
    status: "pending",
  });
  if (existingRequest) {
    throw new BadRequestError("You have requested for Access previously.");
  }

  console.log(existingRequest);
  // Create a new access request
  const accessRequest = await AccessRequest.create({
    fileId,
    requesterId,
  });

  return accessRequest;
}

const FileExist = async (fileId: any) => {
  if (!fileId) {
    throw new BadRequestError("User Id cannot be empty");
  }

  const file = await PdfModel.findOne({ fileId });

  if (!file) {
    throw new NotFoundError("File not found or does nor exist.");
  }
};

export async function processAccessService({
  requestId,
  action,
  userId,
}: {
  requestId: string;
  action: "approve" | "deny";
  userId: any;
}) {
  // Fetch the access request
  const request = await AccessRequest.findById(requestId);
  if (!request) throw new NotFoundError("Access request not found.");

  // Fetch the file associated with the access request
  const file = await PdfModel.findOne({ fileId: request.fileId });
  if (!file) throw new NotFoundError("File not found.");

  // Prevent uploader from processing their own access requests
  if (file.uploadedBy.toString() === userId) {
    throw new UnauthorizedError("You cannot process this request.");
  }

  if (action === "approve") {
    // Check if the requester is already a collaborator
    let isCollaborator = false;
    for (const collaborator of file.collaborators) {
      if (collaborator.userId.toString() === request.requesterId.toString()) {
        isCollaborator = true;
        break;
      }
    }

    if (!isCollaborator) {
      // Add the requester as a collaborator with a default role
      file.collaborators.push({
        userId: request.requesterId,
        role: "viewer", // or "editor", based on your logic
      });
      await file.save();
    }

    request.status = "approved";
  } else if (action === "deny") {
    request.status = "denied";
  } else {
    throw new BadRequestError("Invalid action specified.");
  }

  // Save the updated access request
  await request.save();

  return {
    message: `Access request ${action}d successfully.`,
    request,
  };
}
