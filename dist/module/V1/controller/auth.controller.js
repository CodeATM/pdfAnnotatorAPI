"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.register = void 0;
exports.setHttpOnlyCookie = setHttpOnlyCookie;
const error_middleware_1 = require("../middlewares/error.middleware");
const authService_1 = require("../services/authService");
const response_1 = require("../../../utils/response");
function setHttpOnlyCookie(res, cookieName, value, maxAge) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie(cookieName, value, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge,
        domain: isProduction ? "yourdomain.com" : undefined,
        path: "/",
    });
}
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, password, email } = req.body;
        const registerData = { firstName, lastName, password, email };
        const data = yield (0, authService_1.registerService)(registerData);
        setHttpOnlyCookie(res, "accessToken", data.accessToken, 15 * 60 * 1000);
        setHttpOnlyCookie(res, "refreshToken", data.refreshToken, 7 * 24 * 60 * 60 * 1000);
        yield (0, response_1.successResponse)(res, 200, "Activation code sent to your mail", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.register = register;
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new error_middleware_1.BadRequestError("Email and password are required for login.");
        }
        const data = yield (0, authService_1.loginService)({ email, password });
        setHttpOnlyCookie(res, "accessToken", data.accessToken, 15 * 60 * 1000);
        setHttpOnlyCookie(res, "refreshToken", data.refreshToken, 7 * 24 * 60 * 60 * 1000);
        yield (0, response_1.successResponse)(res, 200, "User login successful", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.loginUser = loginUser;
// ==========================================================
// ==========================================================
// export const activateAccount = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { token } = req.query as { token?: string };
//     if (!token) {
//       throw new BadRequestError("Activation Token missing.");
//     }
//     const data = await verifyUserService(token);
//     await successResponse(res, 200, "Verification Successful", data);
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };
// export const refreshToken = async (
//   req: Request<{}, {}, RefreshTokenRequestBody>,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken) {
//       throw new BadRequestError("Missing refresh Token");
//     }
//     const newAccessToken = await refreshService(refreshToken);
//     await successResponse(res, 200, "Refresh Access Token Successfully.", {
//       accessToken: newAccessToken,
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };
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
//# sourceMappingURL=auth.controller.js.map