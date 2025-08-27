"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activities_controller_1 = require("../controller/activities.controller");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const ActRouter = (0, express_1.Router)();
ActRouter.get("/:fileId", verify_middleware_1.verify, activities_controller_1.getActivities);
ActRouter.get("/single-activity/:activityId", verify_middleware_1.verify, activities_controller_1.getActivity);
exports.default = ActRouter;
//# sourceMappingURL=activities.routes.js.map