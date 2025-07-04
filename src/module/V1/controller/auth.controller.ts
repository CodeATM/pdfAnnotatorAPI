import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../middlewares/error.middleware";
import {
  registerService,
  loginService,
  refreshService,
  verifyUserService,
} from "../services/authService";
import { successResponse } from "../../../utils/response";
import { RegisterRequestBody, LoginRequestBody } from "../../../utils/types";

export function setHttpOnlyCookie(
  res: Response,
  cookieName: string,
  value: string,
  maxAge: number
) {
  const isProduction = process.env.NODE_ENV === "prod";

  res.cookie(cookieName, value, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "prod",
    sameSite: process.env.NODE_ENV === "prod" ? "none" : "lax",
    path: "/",
  });
}

export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, password, email } = req.body;

    const registerData = { firstName, lastName, password, email };
    const data = await registerService(registerData);

    await successResponse(res, 200, "Activation code sent to your mail", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required for login.");
    }
    const data = await loginService({ email, password });
    setHttpOnlyCookie(res, "accessToken", data.accessToken, 15 * 60 * 1000);
    setHttpOnlyCookie(
      res,
      "refreshToken",
      data.refreshToken,
      7 * 24 * 60 * 60 * 1000
    );

    await successResponse(res, 200, "User login successful", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// ==========================================================

// ==========================================================

export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body as { token?: string };
    if (!token) {
      throw new BadRequestError("Activation Token missing.");
    }

    const data = await verifyUserService(token);
    await successResponse(res, 200, "Verification Successful", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError("Missing refresh Token");
    }
    const newAccessToken = await refreshService({ refreshToken });
    await successResponse(res, 200, "Refresh Access Token Successfully.", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// export const changePassword = async (
//   req: Request<{}, {}, ChangePasswordRequestBody>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { userId, newPassword, oldPassword } = req.body;

//     const data = await changePasswordService({
//       userId,
//       oldPassword,
//       newPassword,
//     });

//     await successResponse(res, 200, "Password changed successfully", data);
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

// export const getOtp = async (
//   req: Request<{}, {}, OTPRequestBody>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       throw new BadRequestError("Input your email to get a verification code.");
//     }

//     await requestOTP({ email });

//     await successResponse(
//       res,
//       200,
//       "6 digit OTP sent to mail successfully",
//       null
//     );
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

// export const resetPassword = async (
//   req: Request<{}, {}, ResetPasswordRequestBody>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { new_password: newPassword, otp } = req.body;

//     if (!otp) throw new BadRequestError("OTP Code Cannot Be Empty.");
//     if (!newPassword) throw new BadRequestError("Password Cannot Be Empty.");

//     const userId = await resetPasswordService({ password, otp });

//     await successResponse(res, 200, "Password reset Successfully.", null);
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };
