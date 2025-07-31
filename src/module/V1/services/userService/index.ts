import { userInfo } from "os";
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

export const getUser = async (userId: any) => {
  await CheckUser(userId);

  const user = await User.findById(userId).select(
    "firstName lastName role gender email"
  );

  return user;
};

export const updateUserService = async ({
  userInfo,
  userId,
}: {
  userInfo: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    avatar?: string;
    username?: string;
    usage?: string[];
  };
  userId: any;
}) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  if (userInfo.firstName) user.firstName = userInfo.firstName;
  if (userInfo.lastName) user.lastName = userInfo.lastName;
  if (userInfo.avatar) user.avatar = userInfo.avatar;
  if (userInfo.username) user.username = userInfo.username;

  if (
    userInfo.gender &&
    ["Male", "Female", "Other"].includes(userInfo.gender)
  ) {
    user.gender = userInfo.gender as any;
  }

  if (
    userInfo.usage &&
    Array.isArray(userInfo.usage) &&
    userInfo.usage.every((u) =>
      ["Personal", "Work", "Academics", "Other"].includes(u)
    )
  ) {
    user.usage = userInfo.usage as any;
  }

  await user.save();
  return user;
};
