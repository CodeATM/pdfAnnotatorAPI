import { NotFoundError } from "../../middlewares/error.middleware";
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
