import { Router } from "express";
import express, { Request, Response } from "express";
import {
  register,
  loginUser,
  activateAccount,
  refreshToken,
} from "../controller/auth.controller";
const authRoutes = Router();
import { createJwtTokenFunc } from "../services/authService";
import { successResponse } from "../../../utils/response";
import passport from "../../../utils/3rd-party/passportSetup";
import { setHttpOnlyCookie } from "../controller/auth.controller";
authRoutes.post("/register", register);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/login", loginUser);
// authRoutes.post("/change-password", changePassword);
// authRoutes.post("/request-token", getOtp);
// authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/activate-account", activateAccount);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/google",
    session: false,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as { _id: string }; // Casting user type
      const userId = user._id;

      // Generate tokens
      const accessToken = await createJwtTokenFunc({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP!,
      });

      const refreshToken = await createJwtTokenFunc({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP!,
      });

      // Set cookies
      setHttpOnlyCookie(res, "accessToken", accessToken, 15 * 60 * 1000);
      setHttpOnlyCookie(res, "refreshToken", refreshToken, 15 * 60 * 1000);

      // Optionally log success
      console.log("User authenticated successfully:", userId);

      // Redirect to frontend `/home` after setting cookies
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/home`);
    } catch (error) {
      console.error("Error in Google OAuth callback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

export default authRoutes;
