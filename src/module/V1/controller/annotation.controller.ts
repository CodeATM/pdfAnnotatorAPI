import { Request, Response, NextFunction } from "express";
import { addAnnotationService } from "../services/annotations";
import { successResponse } from "../../../utils/response";

export const createAnnotations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    const annotations = req.body.annotations;

    const data = await addAnnotationService({ annotations, user });

    await successResponse(res, 201, "Annotations created successfully", data);
  } catch (error) {
    console.error("Error creating annotations:", error);
    next(error);
  }
};
