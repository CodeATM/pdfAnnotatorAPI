// src/services/favorites.service.ts
import User from "../../models/userModel";
import PdfModel from "../../models/PdfModel";
import { NotFoundError } from "../../middlewares/error.middleware";

export const addFavoriteService = async (userId: string, fileId: string) => {
  const file = await PdfModel.findOne({ fileId: fileId });
  if (!file) throw new NotFoundError("File not found.");
  await User.findByIdAndUpdate(userId, {
    $addToSet: { favoriteFiles: file.id },
  });
};

export const removeFavoriteService = async (userId: string, fileId: string) => {
  const file = await PdfModel.findOne({ fileId: fileId });
  if (!file) throw new NotFoundError("File not found.");

  await User.findByIdAndUpdate(userId, {
    $pull: { favoriteFiles: file.id },
  });
};

export const getFavoritesService = async (userId: string, count?: number) => {
  const user = await User.findById(userId)
    .populate({
      path: "favoriteFiles",
      options: { sort: { updatedAt: -1 } },
    })
    .lean();

  if (!user) throw new Error("User not found");

  let favorites = user.favoriteFiles as any[];

  if (count && !isNaN(count)) {
    favorites = favorites?.slice(0, count);
  }

  return favorites;
};
