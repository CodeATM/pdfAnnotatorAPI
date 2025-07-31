import { Router } from "express";
import express, { Request, Response } from "express";
import {
  register,
  loginUser,
  activateAccount,
  refreshToken,
  googleAuthentication,
} from "../controller/auth.controller";
const authRoutes = Router();
authRoutes.post("/register", register);
authRoutes.post("/refresh", refreshToken);
authRoutes.post("/login", loginUser);
// authRoutes.post("/change-password", changePassword);
// authRoutes.post("/request-token", getOtp);
// authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/activate-account", activateAccount);
authRoutes.post("/google-login", googleAuthentication);

export default authRoutes;
