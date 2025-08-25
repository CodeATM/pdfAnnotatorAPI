"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const user_controller_1 = require("../controller/user.controller");
const userRoute = (0, express_1.Router)();
userRoute.get("/my-account", verify_middleware_1.verify, user_controller_1.myAccount);
userRoute.patch("/edit-profile", verify_middleware_1.verify, user_controller_1.editProfile);
exports.default = userRoute;
//# sourceMappingURL=user.routes.js.map