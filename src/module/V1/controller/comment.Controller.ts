import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../middlewares/error.middleware";
import { successResponse } from "../../../utils/response";
import {
  createCommentService,
  deleteCommentService,
  getCommentByIdService,
} from "../services/commentService";

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, parentId, position, pageNumber } = req.body;

    if (!content) throw new BadRequestError("Content is required");

    const isReply = !!parentId;

    if (!isReply) {
      if (!position?.x || !position?.y) {
        throw new BadRequestError(
          "Position (x and y) is required for top-level comments"
        );
      }
      if (
        position?.pageNumber === undefined ||
        typeof position?.pageNumber !== "number"
      ) {
        throw new BadRequestError(
          "Page number is required for top-level comments"
        );
      }
    }

    const { fileId } = req.params;
    if (!fileId) throw new BadRequestError("File ID is required");

    const data = await createCommentService({
      content,
      authorId: req.user,
      fileId,
      parentCommentId: parentId,
      position: isReply ? undefined : position,
      pageNumber: isReply ? undefined : position.pageNumber,
    });

    await successResponse(res, 200, "Comment added successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId } = req.params;
    if (!commentId) throw new BadRequestError("Comment ID is required");

    const data = await getCommentByIdService(commentId);
    await successResponse(res, 200, "Comment retrieved successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commentId } = req.params;
    if (!commentId) throw new BadRequestError("Comment ID is required");

    const data = await deleteCommentService({ commentId, author: req.user });
    await successResponse(res, 200, "Comment deleted successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
