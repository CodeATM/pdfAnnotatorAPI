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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const authRoutes = (0, express_1.Router)();
const authService_1 = require("../services/authService");
const passportSetup_1 = __importDefault(require("../../../utils/3rd-party/passportSetup"));
const auth_controller_2 = require("../controller/auth.controller");
authRoutes.post("/register", auth_controller_1.register);
// authRoutes.post("/refresh", refreshToken);
authRoutes.post("/login", auth_controller_1.loginUser);
// authRoutes.post("/change-password", changePassword);
// authRoutes.post("/request-token", getOtp);
// authRoutes.post("/reset-password", resetPassword);
// authRoutes.post("/activate-account", activateAccount);
authRoutes.get("/google", passportSetup_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
authRoutes.get("/google/callback", passportSetup_1.default.authenticate("google", {
    failureRedirect: "/google",
    session: false,
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user; // Casting user type
        const userId = user._id;
        // Generate tokens
        const accessToken = yield (0, authService_1.createJwtTokenFunc)({
            UserIdentity: { userId },
            expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
        });
        const refreshToken = yield (0, authService_1.createJwtTokenFunc)({
            UserIdentity: { userId },
            expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
        });
        // Set cookies
        (0, auth_controller_2.setHttpOnlyCookie)(res, "accessToken", accessToken, 15 * 60 * 1000);
        (0, auth_controller_2.setHttpOnlyCookie)(res, "refreshToken", refreshToken, 15 * 60 * 1000);
        // Optionally log success
        console.log("User authenticated successfully:", userId);
        // Redirect to frontend `/home` after setting cookies
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontendUrl}/home`);
    }
    catch (error) {
        console.error("Error in Google OAuth callback:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
exports.default = authRoutes;
//# sourceMappingURL=auth.routes.js.map