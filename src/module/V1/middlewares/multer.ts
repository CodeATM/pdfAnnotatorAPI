import multer from "multer";
import { Request } from "express";
import { BadRequestError } from "./error.middleware";

// Configure multer for PDF uploads
const storage = multer.memoryStorage(); // Store in memory as buffer

// File filter to only allow PDFs
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check MIME type
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new BadRequestError("No file uploaded. Please select a PDF file."));
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

// Export the middleware for single PDF upload
export const pdfUpload = upload.single("pdf");
