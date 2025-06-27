import { Request, Response, NextFunction } from "express";
import {
  requestAccessService,
  processAccessService,
} from "../services/pdfService";
import { successResponse } from "../../../utils/response";
import { CheckUser } from "../services/userService";

export async function requestAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId } = req.body;
    const requesterId = req.user;
    await CheckUser(requesterId);
    const data = await requestAccessService({ fileId, requesterId });
    await successResponse(res, 201, "Access request submitted.", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
}

export async function acceptAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { requestId } = req.params;
  const { action } = req.body;
  const userId = req.user; // Assume authenticated user
  const { message, request } = await processAccessService({
    requestId,
    action,
    userId,
  });
  await successResponse(res, 201, message, request);
  try {
  } catch (error) {
    res.status(500).json({ message: "Error managing access request.", error });
  }
}
