import {
  BadRequestError,
  NotFoundError,
} from "../../middlewares/error.middleware";
import User from "../../models/userModel";

export const CheckUser = async (userId: any) => {
  if (!userId) {
    throw new BadRequestError("User Id cannot be empty");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found or does nor exist.");
  }
};
