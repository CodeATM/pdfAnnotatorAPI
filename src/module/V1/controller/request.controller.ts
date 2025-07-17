import { Request, Response, NextFunction } from "express";
import {
  requestAccessService,
  addCollaboratorService
} from "../services/pdfService";
import { getAllRequestsService } from "../services/accessService";
import { successResponse } from "../../../utils/response";
import { CheckUser } from "../services/userService";

export async function requestAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId } = req.params;
    const requesterId = req.user;
    await CheckUser(requesterId);
    const data = await requestAccessService({ fileId, requesterId });
    await successResponse(res, 201, "Access request submitted.", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export async function acceptUserAsCollaborator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId } = req.params;
    const { userId, role } = req.body;
    const currentUserId = req.user;

    const file = await addCollaboratorService({
      fileId,
      userIdToAdd: userId,
      role,
      currentUserId,
    });

    await successResponse(res, 201, "Collaborator added successfully.", file);
  } catch (error) {
    next(error);
  }
}

export async function getAllRequests(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId } = req.params;
    const userId = req.user;
    const requests = await getAllRequestsService({ fileId, userId });
    await successResponse(res, 200, "Access requests retrieved.", requests);
  } catch (error) {
    console.error(error);
    next(error);
  }
}
