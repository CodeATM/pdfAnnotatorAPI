import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
} from "../../middlewares/error.middleware";
import User from "../../models/userModel";
import Session from "../../models/sessionModel";
import bcrypt from "bcrypt";
import Jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { sendEmailVerification } from "../../../../utils/3rd-party/Email/Email";

import { RegisterData, LoginData } from "../../../../utils/types";

// register
export const registerService = async (registerData: RegisterData) => {
  const { firstName, lastName, password, email } = registerData;

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new BadRequestError("User with this email already exists.");
  }

  const hashpassword = await hashpasswordFunc(password);

  // 🔐 Generate code & expiration
  const verificationCode = generateSixDigitCode(); // e.g., "123456"
  const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // ✅ Create the user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashpassword,
    verificationCode,
    verificationCodeExpiresAt,
  });

  const userId = newUser.id;

  // 🔐 Create tokens
  const accessToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP!,
  });

  const refreshToken = await createJwtTokenFunc({
    UserIdentity: { userId },
    expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP!,
  });

  // 💾 Save tokens to session
  await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // ✉️ Send email with the code
  await sendEmailVerification({
    receiver: email,
    firstname: firstName,
    lastname: lastName,
    code: verificationCode,
  });

  return { userId };
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

export const refreshService = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  try {
    // Verify if the access token is valid
    const decoded = Jwt.verify(
      refreshToken,
      process.env.VERIFICATION_TOKEN_SECRET || "defaultSecret"
    ) as { userId: string };

    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError("Invalid access token");
    }

    // Find the session in the database
    const session = await Session.findOne({ refreshToken });
    if (!session) {
      throw new UnauthorizedError("Session not found");
    }

    // Find the user associated with the session
    const user = await User.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Generate a new access token
    const newAccessToken = Jwt.sign(
      { userId: user.id, email: user.email },
      process.env.VERIFICATION_TOKEN_SECRET || "defaultSecret",
      { expiresIn: "15m" }
    );

    session.accessToken = newAccessToken;
    await session.save();

    // Return both new tokens
    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    throw new InternalServerError("Unable to refresh tokens");
  }
};

export const googleAuthService = async (userDetails: {
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  googleId: string;
  profilePicture: string;
}) => {
  const {
    email,
    email_verified,
    first_name,
    last_name,
    googleId,
    profilePicture,
  } = userDetails;

  if (!email_verified) {
    throw new UnauthorizedError("Email is not verified by Google.");
  }

  const lowerCaseEmail = email.toLowerCase();

  try {
    let user = await User.findOne({ email: lowerCaseEmail });

    if (!user) {
      const emailPrefix = lowerCaseEmail.split("@")[0];
      const username = `${emailPrefix}_${Date.now()}`.slice(0, 30);

      user = await User.create({
        email: lowerCaseEmail,
        password: "", // Empty since Google handles auth
        googleId,
        profile: {
          create: {
            first_name,
            last_name,
            username,
            avatar: profilePicture || "",
          },
        },
      });
    }

    const userId = user.id;

    // === Generate Tokens ===
    const accessToken = await createJwtTokenFunc({
      UserIdentity: { userId },
      expiresIn: process.env.ACCESS_TOKEN_EXP!,
    });

    const refreshToken = await createJwtTokenFunc({
      UserIdentity: { userId },
      expiresIn: process.env.REFRESH_TOKEN_EXP!,
    });

    const now = Date.now();

    // === Upsert Session ===
    await Session.updateOne(
      { userId },
      {
        userId,
        accessToken,
        refreshToken,
      },
      { upsert: true }
    );

    return { accessToken, refreshToken, userId };
  } catch (error) {
    console.error("Google Auth Error:", error);
    throw new InternalServerError("Failed to login with Google");
  }
};

// // Utility Functions
const hashpasswordFunc = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const generateSixDigitCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // ensures 6-digit number
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

export const verifyUserService = async (token: string) => {
  if (!token) {
    throw new BadRequestError("Activation Token missing.");
  }

  const user = await User.findOne({ verificationCode: token });

  if (!user) {
    throw new NotFoundError("User not found or token is invalid.");
  }

  await User.updateOne(
    { verificationCode: token },
    { isEmailVerified: true, verificationCode: null }
  );

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
