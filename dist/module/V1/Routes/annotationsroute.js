"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const annotation_controller_1 = require("../controller/annotation.controller");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const annotationRoutes = (0, express_1.Router)();
annotationRoutes.post("/create-annotation", verify_middleware_1.verify, annotation_controller_1.createAnnotations);
exports.default = annotationRoutes;
//# sourceMappingURL=annotationsroute.js.map