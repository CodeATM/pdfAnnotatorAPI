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
  console.log("Session created:", session);

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

  console.log(sessionUpdate);

  return { accessToken, refreshToken, userId };
};

// export const verifyUserService = async (token: string) => {
//   const userIdentity = await verifyTokenFunc(token);
//   const userExists = await User.findOne({email})

//   if (userExists) {
//     throw new BadRequestError("User already verified.");
//   }

//   const userId = newUser.id;
//   const accessToken = await createJwtTokenFunc({
//     UserIdentity: { userId },
//     expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP!,
//   });

//   const refreshToken = await createJwtTokenFunc({
//     UserIdentity: { userId },
//     expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP!,
//   });

//   await Session.create({
//     userId,
//     accessToken,
//     refreshToken,
//   });

//   return { accessToken, refreshToken, userId };
// };

// export const refreshService = async (refreshToken: string) => {
//   const user = await verifyTokenFunc(refreshToken);
//   const session = await Session.findOne({ userId: user.userId });

//   if (!session || session.refreshToken !== refreshToken) {
//     throw new UnauthorizedError("The token is invalid or has expired.");
//   }

//   const newAccessToken = await createJwtTokenFunc({
//     UserIdentity: { userId: user.userId },
//     expiresIn: process.env.ACCESS_TTL!,
//   });

//   session.accessToken = newAccessToken;
//   await session.save();

//   return { newAccessToken };
// };

// export const changePasswordService = async ({
//   userId,
//   oldPassword,
//   newPassword,
// }: ChangePasswordData) => {
//   const user = await User.findById(userId).populate("account");
//   if (!user) {
//     throw new NotFoundError("User with this ID not found.");
//   }

//   const isPasswordCorrect = await comparePasswordFunc(
//     oldPassword,
//     user.password
//   );
//   if (!isPasswordCorrect) {
//     throw new UnauthorizedError(
//       "Your password and old password do not match."
//     );
//   }
//   const hashpassword = await hashpasswordFunc(newPassword);
//   await User.findByIdAndUpdate(userId, {
//     password: hashpassword,
//   });
// };

// export const requestOTP = async ({ email }: { email: string }) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new NotFoundError("User with this email not found.");
//   }

//   const otpCode = await OTPFunc();

//   await Session.create({
//     userId: user.id,
//     otp: otpCode,
//     otpExpiresAt: new Date(Date.now() + parseInt(process.env.OTP_TTL!) * 1000),
//   });

//   console.log(`OTP for ${email}: ${otpCode}`);
// };

// export const resetPasswordService = async ({
//   password,
//   otp,
// }: ResetPasswordData) => {
//   const session = await Session.findOne({ otp });

//   if (!session || new Date() > new Date(session.otpExpiresAt)) {
//     throw new BadRequestError("Expired or incorrect OTP Code.");
//   }

//   const hashedPassword = await hashpasswordFunc(password);

//   await User.findByIdAndUpdate(session.userId, {
//     password: hashedPassword,
//   });
//   await Session.deleteOne({ otp });

//   return session.userId;
// };

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

// const OTPFunc = async () => {
//   return crypto.randomInt(100000, 999999);
// };

// const verifyTokenFunc = async (token: string) => {
//   return Jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET!);
// };
