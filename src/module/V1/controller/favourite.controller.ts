import { Request, Response, NextFunction } from "express";
import {
  addFavoriteService,
  removeFavoriteService,
  getFavoritesService,
} from "../services/favouriteService";
import { successResponse } from "../../../utils/response";
import { BadRequestError } from "../middlewares/error.middleware";

export const addToFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user as string;
    const { fileId } = req.body;

    if (!fileId) throw new BadRequestError("File ID is required");

    await addFavoriteService(userId, fileId);

    await successResponse(res, 200, "File added to favorites", null);
  } catch (error: any) {
    next(error);
  }
};

export const removeFromFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user as string;
    const { fileId } = req.params;

    await removeFavoriteService(userId, fileId);

    await successResponse(res, 200, "File removed from favorites", null);
  } catch (error: any) {
    next(error);
  }
};

export const getFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user as string;
    const count = req.query.count
      ? parseInt(req.query.count as string, 10)
      : undefined;

    const favorites = await getFavoritesService(userId, count);

    await successResponse(res, 200, "Fetched favorite files", favorites);
  } catch (error: any) {
    next(error);
  }
};
