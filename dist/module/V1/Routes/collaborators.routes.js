"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collaborators_controller_1 = require("../controller/collaborators.controller");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const ColRouter = (0, express_1.Router)();
// GET /:pdfId/collaborators
ColRouter.get("/:pdfId/collaborators", verify_middleware_1.verify, collaborators_controller_1.getCollaborators);
ColRouter.patch("/:pdfId/collaborators/role", verify_middleware_1.verify, collaborators_controller_1.patchCollaboratorRole);
ColRouter.patch("/:pdfId/collaborators/remove", verify_middleware_1.verify, collaborators_controller_1.removeCollaborator);
exports.default = ColRouter;
//# sourceMappingURL=collaborators.routes.js.map