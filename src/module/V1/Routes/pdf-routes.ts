import { Router } from "express";
import {
  getSingleFile,
  getUserPdf,
  uploadPDF,
} from "../controller/pdf.controller";
import { pdfUpload } from "../middlewares/multer";
import { verify } from "../middlewares/verify.middleware";
import {
  acceptAccess,
  getAllRequests,
  requestAccess,
} from "../controller/request.controller";

const pdfRoutes = Router();

pdfRoutes.post("/upload-pdf", verify, pdfUpload, uploadPDF);
pdfRoutes.get("/files", verify, getUserPdf);
pdfRoutes.get("/:fileId", verify, getSingleFile);
pdfRoutes.post("/request/:fileId", verify, requestAccess);
pdfRoutes.post("/process-request/:requestId", verify, acceptAccess);
pdfRoutes.get("/file-requests/:fileId", verify, getAllRequests);

export default pdfRoutes;
