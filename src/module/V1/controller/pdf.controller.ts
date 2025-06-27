import { Request, Response, NextFunction } from "express";
import {
  uploadPDFToCloudinary,
  savePDFToDatabase,
  getUserPdfService,
  requestAccessService,
} from "../services/pdfService";
import {
  BadRequestError,
  InternalServerError,
} from "../middlewares/error.middleware";
import { successResponse } from "../../../utils/response";
import { CheckUser } from "../services/userService";

export const uploadPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!req.file) {
      throw new BadRequestError("No file uploaded. Please select a PDF file.");
    }

    if (req.file.mimetype !== "application/pdf") {
      throw new BadRequestError(
        "Invalid file type. Only PDF files are allowed."
      );
    }

    const fileUrl = await uploadPDFToCloudinary(
      req.file.buffer,
      req.file.originalname
    );
    const pdf = await savePDFToDatabase(
      req.file.originalname,
      fileUrl,
      user as any,
      req.file.size
    );

    const data = {
      fileUrl: pdf.fileUrl,
      originalName: pdf.title,
      size: pdf.size,
    };

    await successResponse(res, 201, "PDF uploaded successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const getUserPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    await CheckUser(user);

    const data = await getUserPdfService(user);
    await successResponse(res, 200, "PDFs fetched successfully", data);
  } catch (error) {
    console.error(error);
    next(error);
  }
};


