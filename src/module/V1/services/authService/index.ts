import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../middlewares/error.middleware";
import User from "../../models/userModel";
import Session from "../../models/sessionModel";
import bcrypt from "bcrypt";
import Jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

import { RegisterData, LoginData } from "../../../../utils/types";

// register
export const registerService = async (registerData: RegisterData) => {
  const { firstName, lastName, password, email } = registerData;

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    throw new BadRequestError("User with this email already exists.");
  }

  const hashpassword = await hashpasswordFunc(password);

  const newUser = await User.create({
    firstName,
    lastName,
    password: hashpassword,
    email,
  });

  const userId = newUser.id;
  const accessToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP!,
  });

  const refreshToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP!,
  });

  const session = await Session.create({
    userId: newUser.id,
    accessToken: accessToken,
    refreshToken: refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken, userId };
};

export const loginService = async ({ email, password }: LoginData) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("Email and password are incorrect.");
  }

  const isPasswordCorrect = await comparePasswordFunc(password, user.password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Password is incorrect.");
  }

  const userId = user.id;
  const accessToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP!,
  });

  const refreshToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP!,
  });

  const sessionUpdate = await Session.updateOne(
    { userId },
    { accessToken, refreshToken },
    { upsert: true }
  );
  return { accessToken, refreshToken, userId };
};

// // Utility Functions
const hashpasswordFunc = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const createJwtTokenFunc = async ({
  UserIdentity,
  expiresIn,
}: {
  UserIdentity: Record<string, any>;
  expiresIn: any;
}) => {
  if (!expiresIn) {
    throw new Error('Token expiration time ("expiresIn") is not defined.');
  }

  // Define the options for JWT sign
  const signOptions: SignOptions = {
    expiresIn,
  };

  return Jwt.sign(
    UserIdentity,
    process.env.VERIFICATION_TOKEN_SECRET!,
    signOptions
  );
};

const comparePasswordFunc = async (
  plaintextPassword: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(plaintextPassword, hashedPassword);
};
