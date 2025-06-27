import { Router } from "express";
import { getUserPdf, uploadPDF } from "../controller/pdf.controller";
import { pdfUpload } from "../middlewares/multer";
import { verify } from "../middlewares/verify.middleware";
import { acceptAccess, requestAccess } from "../controller/request.controller";

const pdfRoutes = Router();

pdfRoutes.post("/upload-pdf", verify, pdfUpload, uploadPDF);
pdfRoutes.get("/my-file", verify, getUserPdf);
pdfRoutes.post("/request", verify, requestAccess);
pdfRoutes.post("/process-request/:requestId", verify, acceptAccess);

export default pdfRoutes;
