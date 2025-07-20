"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdf_controller_1 = require("../controller/pdf.controller");
const multer_1 = require("../middlewares/multer");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const request_controller_1 = require("../controller/request.controller");
const pdfRoutes = (0, express_1.Router)();
pdfRoutes.post("/upload-pdf", verify_middleware_1.verify, multer_1.pdfUpload, pdf_controller_1.uploadPDF);
pdfRoutes.patch("/edit-file/:fileId", verify_middleware_1.verify, pdf_controller_1.editFile);
pdfRoutes.get("/files", verify_middleware_1.verify, pdf_controller_1.getUserPdf);
pdfRoutes.get("/:fileId", verify_middleware_1.verify, pdf_controller_1.getSingleFile);
pdfRoutes.post("/request/:fileId", verify_middleware_1.verify, request_controller_1.requestAccess);
pdfRoutes.post("/accept/:fileId/collaborators", verify_middleware_1.verify, request_controller_1.acceptUserAsCollaborator);
pdfRoutes.get("/file-requests/:fileId", verify_middleware_1.verify, request_controller_1.getAllRequests);
exports.default = pdfRoutes;
//# sourceMappingURL=pdf-routes.js.map