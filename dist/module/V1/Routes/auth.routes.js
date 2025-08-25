"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/register", auth_controller_1.register);
authRoutes.post("/refresh", auth_controller_1.refreshToken);
authRoutes.post("/login", auth_controller_1.loginUser);
// authRoutes.post("/change-password", changePassword);
// authRoutes.post("/request-token", getOtp);
// authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/activate-account", auth_controller_1.activateAccount);
authRoutes.post("/google-login", auth_controller_1.googleAuthentication);
exports.default = authRoutes;
//# sourceMappingURL=auth.routes.js.map