import { NotFoundError, UnauthorizedError, BadRequestError } from "../../middlewares/error.middleware";
import PdfModel from "../../models/PdfModel";

export const fetchCollaboratorsForPDF = async (pdfId: string) => {
  const pdf = await PdfModel.findOne({ fileId: pdfId }).populate(
    "collaborators.userId",
    "firstName lastName email avatar"
  );

  if (!pdf) throw new NotFoundError("File not found.");

  return {
    count: pdf.collaborators.length,
    collaborators: pdf.collaborators,
  };
};

export const updateCollaboratorRole = async (
  pdfId: string,
  requesterId: any,
  userId: string,
  role: "viewer" | "editor"
) => {
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
};

export const removeCollaboratorService = async (
  pdfId: string,
  requesterId: any,
  userIdToRemove: string
) => {
  const pdf = await PdfModel.findOne({ fileId: pdfId });

  if (!pdf) {
    throw new NotFoundError("File not found.");
  }

  if (pdf.uploadedBy.toString() !== requesterId) {
    throw new UnauthorizedError(
      "You are not authorized to remove collaborators from this file."
    );
  }

  // Prevent removal of uploader
  if (pdf.uploadedBy.toString() === userIdToRemove) {
    throw new BadRequestError("You cannot remove the file uploader.");
  }

  // Find the collaborator subdoc to remove
  const collab = pdf.collaborators.find(
    (c: any) => c.userId.toString() === userIdToRemove
  );

  if (!collab) {
    throw new NotFoundError("Collaborator not found on this file.");
  }

  // Remove using .pull() to maintain DocumentArray integrity
  pdf.collaborators.pull(collab._id);

  await pdf.save();

  return {
    message: "Collaborator removed successfully",
    collaborators: pdf.collaborators,
  };
};
