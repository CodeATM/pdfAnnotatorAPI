import { NextFunction, Request, Response } from "express";
import {
  fetchCollaboratorsForPDF,
  updateCollaboratorRole,
} from "../services/collaboratorService";
import { successResponse } from "../../../utils/response";
import {
  BadRequestError,
  InternalServerError,
} from "../middlewares/error.middleware";

export const getCollaborators = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pdfId } = req.params;
    const result = await fetchCollaboratorsForPDF(pdfId);
    await successResponse(
      res,
      200,
      "Collaborators fetched successfully",
      result
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const patchCollaboratorRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { pdfId } = req.params;
    const { userId, role } = req.body;
    const requesterId = req.user;

    if (!userId || !role) {
      throw new BadRequestError("userId and role are required");
    }

    if (!["viewer", "editor"].includes(role)) {
      throw new BadRequestError("userId and role are required");
    }

    const result = await updateCollaboratorRole(
      pdfId,
      requesterId,
      userId,
      role
    );

    await successResponse(res, 200, result.message, {
      count: result.collaborators.length,
      collaborators: result.collaborators,
    });
  } catch (error: any) {
    console.error("Error updating collaborator role:", error.message);
    next(error);
  }
};
