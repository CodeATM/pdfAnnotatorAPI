import { Router } from "express";
import {
  editFile,
  getSingleFile,
  getUserPdf,
  uploadPDF,
} from "../controller/pdf.controller";
import { pdfUpload } from "../middlewares/multer";
import { verify } from "../middlewares/verify.middleware";
import {
  getAllRequests,
  requestAccess,
  acceptUserAsCollaborator
} from "../controller/request.controller";

const pdfRoutes = Router();

pdfRoutes.post("/upload-pdf", verify, pdfUpload, uploadPDF);
pdfRoutes.patch("/edit-file/:fileId", verify, editFile);
pdfRoutes.get("/files", verify, getUserPdf);
pdfRoutes.get("/:fileId", verify, getSingleFile);
pdfRoutes.post("/request/:fileId", verify, requestAccess);
pdfRoutes.post("/accept/:fileId/collaborators", verify, acceptUserAsCollaborator);
pdfRoutes.get("/file-requests/:fileId", verify, getAllRequests);

export default pdfRoutes;
