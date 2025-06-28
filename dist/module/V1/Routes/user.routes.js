"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const userController_1 = require("../controller/userController");
const userRoute = (0, express_1.Router)();
userRoute.get("/my-account", verify_middleware_1.verify, userController_1.myAccount);
exports.default = userRoute;
//# sourceMappingURL=user.routes.js.map