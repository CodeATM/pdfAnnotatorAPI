import cloudinary from "../../../../utils/3rd-party/cloudinary";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../middlewares/error.middleware";
import PdfModel from "../../models/PdfModel";
import { AccessRequest } from "../../models/invitesModel";
import AnnotationModel from "../../models/annotationModel";
import User from "../../models/userModel";
import { Comment } from "../../models/commentModel";

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
  size: number
): Promise<any> {
  try {
    const value = await generateUniqueFileCode();

    const pdf = new PdfModel({
      title,
      fileUrl,
      uploadedBy: owner,
      size,
      fileId: value,
      collaborators: [
        {
          userId: owner,
          role: "editor",
        },
      ],
    });

    const savedPdf = await pdf.save();
    return savedPdf;
  } catch (error) {
    throw new InternalServerError("Unable to save PDF");
  }
}

export async function getUserPdfService(userId: any): Promise<any> {
  try {
    // Step 1: Fetch user's PDFs (uploaded or collaborated on)
    const pdfs = await PdfModel.find({
      $or: [{ uploadedBy: userId }, { "collaborators.userId": userId }],
    })
      .sort({ updatedAt: -1 })
      .populate("uploadedBy", "firstName lastName email avatar")
      .populate({
        path: "collaborators.userId",
        select: "firstName lastName email profilePicture",
      });

    // Step 2: Fetch user's favorite file ObjectIds
    const user = await User.findById(userId).select("favoriteFiles").lean();
    const favoriteIds = user?.favoriteFiles?.map((id) => id.toString()) || [];

    // Step 3: Add isFavorite flag to each PDF
    const pdfsWithFavoriteFlag = pdfs?.map((pdf) => {
      const isFavorite = favoriteIds.includes(pdf._id.toString());
      return {
        ...pdf.toObject(),
        isFavorite,
      };
    });

    return pdfsWithFavoriteFlag;
  } catch (error) {
    console.log(error);
    throw new InternalServerError("Unable to retrieve PDFs");
  }
}

export async function getSinglePDFService({
  fileId,
  userId,
}: {
  fileId: string;
  userId: any;
}): Promise<any> {
  try {
    const pdf = await PdfModel.findOne({ fileId: fileId })
      .populate({
        path: "uploadedBy",
        select: "firstName lastName email avatar username",
      })
      .populate({
        path: "collaborators.userId",
        select: "firstName lastName email avatar username",
      });

    if (!pdf) {
      throw new NotFoundError("File not found.");
    }

    const isOwner = pdf.uploadedBy._id.toString() === userId.toString();
    const isCollaborator = pdf.collaborators.some(
      (collab: any) => collab.userId._id.toString() === userId.toString()
    );

    if (!isOwner && !isCollaborator) {
      throw new UnauthorizedError("You do not have access to this file.");
    }

    // ✅ Fetch annotations for the file
    const annotations = await AnnotationModel.find({ fileId: pdf.id })
      .populate({
        path: "createdBy",
        select: "firstName lastName email avatar username",
      })
      .lean();

      const comments = await Comment.find({ fileId: pdf.id })
        .populate({
          path: "author",
          select: "firstName lastName email avatar username commentId ",
        })
        .lean();

    return {
      ...pdf.toObject(),
      annotations,
      comments,
    };
  } catch (error) {
    throw error;
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

interface AddCollaboratorInput {
  fileId: string;
  userIdToAdd: string;
  role: "viewer" | "editor";
  currentUserId: any;
}

export async function addCollaboratorService({
  fileId,
  userIdToAdd,
  role,
  currentUserId,
}: AddCollaboratorInput) {
  const file = await PdfModel.findOne({ fileId });

  if (!file) {
    throw new NotFoundError("File not found.");
  }

  if (file.uploadedBy.toString() !== currentUserId) {
    throw new UnauthorizedError("Only the uploader can add collaborators.");
  }

  const isAlreadyCollaborator = file.collaborators.some(
    (collab) => collab.userId.toString() === userIdToAdd
  );

  if (isAlreadyCollaborator) {
    throw new BadRequestError("User is already a collaborator.");
  }

  // Add collaborator
  file.collaborators.push({ userId: userIdToAdd, role });
  await file.save();

  // Mark access request as approved if exists
  const accessRequest = await AccessRequest.findOne({
    fileId,
    requesterId: userIdToAdd,
    status: "pending",
  });

  if (accessRequest) {
    accessRequest.status = "approved";
    await accessRequest.save();
  }

  return file;
}

export async function updateCollaboratorRole(
  pdfId: string,
  requesterId: any,
  userId: string,
  role: "viewer" | "editor"
) {
  const pdf = await PdfModel.findOne({ fileId: pdfId }).populate(
    "collaborators.userId",
    "firstName lastName email avatar"
  );

  if (!pdf) throw new NotFoundError("File not found.");

  if (!pdf.uploadedBy.equals(requesterId)) {
    throw new Error(
      "You are not authorized to update this PDF's collaborators"
    );
  }

  const collaborator = pdf.collaborators.find((collab: any) =>
    collab.userId._id.equals(userId)
  );

  if (!collaborator) throw new Error("Collaborator not found");

  if (collaborator.role === role) {
    return {
      message: "Role is already set to the specified value",
      collaborators: pdf.collaborators,
    };
  }

  collaborator.role = role;
  await pdf.save();

  return {
    message: "Collaborator role updated successfully",
    collaborators: pdf.collaborators,
  };
}

export const editPDFService = async ({ fileId, userId, updateData }: any) => {
  const pdf = await PdfModel.findOne({ fileId });

  if (!pdf) {
    throw new NotFoundError("File not found.");
  }
  const isUploader = pdf.uploadedBy.toString() === userId;

  const isEditorCollaborator = pdf.collaborators.some(
    (c: any) => c.userId.toString() === userId && c.role === "editor"
  );

  if (!isUploader && !isEditorCollaborator) {
    throw new UnauthorizedError("You are not allowed to edit this file.");
  }

  const { title, description } = updateData;

  if (!title && !description) {
    throw new BadRequestError(
      "At least one of title or description must be provided."
    );
  }

  if (title) pdf.title = title;
  if (description) pdf.description = description;

  pdf.lastEditedBy = userId;
  pdf.lastEditedAt = new Date();

  await pdf.save();

  return pdf;
};
