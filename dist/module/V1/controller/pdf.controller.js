"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleFile = exports.getUserPdf = exports.uploadPDF = void 0;
const pdfService_1 = require("../services/pdfService");
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../../../utils/response");
const userService_1 = require("../services/userService");
const uploadPDF = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!req.file) {
            throw new error_middleware_1.BadRequestError("No file uploaded. Please select a PDF file.");
        }
        if (req.file.mimetype !== "application/pdf") {
            throw new error_middleware_1.BadRequestError("Invalid file type. Only PDF files are allowed.");
        }
        const fileUrl = yield (0, pdfService_1.uploadPDFToCloudinary)(req.file.buffer, req.file.originalname);
        const pdf = yield (0, pdfService_1.savePDFToDatabase)(req.file.originalname, fileUrl, user, req.file.size);
        const data = {
            fileUrl: pdf.fileUrl,
            originalName: pdf.title,
            size: pdf.size,
            fileId: pdf.fileId,
        };
        yield (0, response_1.successResponse)(res, 201, "PDF uploaded successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.uploadPDF = uploadPDF;
const getUserPdf = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        yield (0, userService_1.CheckUser)(user);
        console.log("here");
        const data = yield (0, pdfService_1.getUserPdfService)(user);
        yield (0, response_1.successResponse)(res, 200, "PDFs fetched successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.getUserPdf = getUserPdf;
const getSingleFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const { fileId } = req.params;
        const data = yield (0, pdfService_1.getSinglePDFService)({ fileId, userId });
        yield (0, response_1.successResponse)(res, 200, "File fetched successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.getSingleFile = getSingleFile;
//# sourceMappingURL=pdf.controller.js.map