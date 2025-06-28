"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const error_middleware_1 = require("./error.middleware");
// Configure multer for PDF uploads
const storage = multer_1.default.memoryStorage(); // Store in memory as buffer
// File filter to only allow PDFs
const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new error_middleware_1.BadRequestError("No file uploaded. Please select a PDF file."));
    }
};
// Configure multer with options
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
});
// Export the middleware for single PDF upload
exports.pdfUpload = upload.single("pdf");
//# sourceMappingURL=multer.js.map