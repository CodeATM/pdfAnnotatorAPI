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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPDFToCloudinary = uploadPDFToCloudinary;
exports.savePDFToDatabase = savePDFToDatabase;
exports.getUserPdfService = getUserPdfService;
exports.getSinglePDFService = getSinglePDFService;
exports.requestAccessService = requestAccessService;
exports.processAccessService = processAccessService;
const cloudinary_1 = __importDefault(require("../../../../utils/3rd-party/cloudinary"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const invitesModel_1 = require("../../models/invitesModel");
const annotationModel_1 = __importDefault(require("../../models/annotationModel"));
function uploadPDFToCloudinary(buffer, originalName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cloudinaryUrl = yield new Promise((resolve, reject) => {
                // Generate clean public_id
                const publicId = originalName
                    ? `pdf_${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, "_")}`
                    : `pdf_${Date.now()}`;
                const uploadStream = cloudinary_1.default.uploader.upload_stream({
                    resource_type: "raw",
                    folder: "pdfs",
                    public_id: publicId,
                    format: "pdf", // Explicitly set format
                    type: "upload",
                    tags: ["pdf", "document"],
                    access_mode: "public",
                    filename: originalName || `document_${Date.now()}.pdf`,
                    use_filename: true,
                    unique_filename: false,
                    transformation: [
                        {
                            flags: "attachment",
                            quality: "auto",
                            fetch_format: "auto",
                        },
                    ],
                }, (error, result) => {
                    if (error) {
                        throw new error_middleware_1.InternalServerError("Unable to upload PDF");
                    }
                    else if (!result) {
                        throw new error_middleware_1.InternalServerError("Unable to upload PDF");
                    }
                    else {
                        const viewableUrl = result.secure_url.replace(/\?.+$/, "");
                        resolve(viewableUrl);
                    }
                });
                uploadStream.end(buffer);
            });
            return cloudinaryUrl;
        }
        catch (error) {
            throw new error_middleware_1.InternalServerError("Unable to upload PDF");
        }
    });
}
function savePDFToDatabase(title, fileUrl, owner, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const value = yield generateUniqueFileCode();
            const pdf = new PdfModel_1.default({
                title,
                fileUrl,
                uploadedBy: owner,
                size,
                fileId: value,
                collaborators: [
                    {
                        userId: owner,
                        role: "editor",
                    },
                ],
            });
            const savedPdf = yield pdf.save();
            return savedPdf;
        }
        catch (error) {
            throw new error_middleware_1.InternalServerError("Unable to save PDF");
        }
    });
}
function getUserPdfService(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pdfs = yield PdfModel_1.default.find({ uploadedBy: userId }).populate("uploadedBy", "firstName lastName email avatar");
            return pdfs;
        }
        catch (error) {
            throw new error_middleware_1.InternalServerError("Unable to retrieve PDFs");
        }
    });
}
function getSinglePDFService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ fileId, userId, }) {
        try {
            const pdf = yield PdfModel_1.default.findOne({ fileId: fileId })
                .populate({
                path: "uploadedBy",
                select: "firstName lastName email profilePicture",
            })
                .populate({
                path: "collaborators.userId",
                select: "firstName lastName email profilePicture",
            });
            if (!pdf) {
                throw new error_middleware_1.NotFoundError("File not found.");
            }
            const isOwner = pdf.uploadedBy._id.toString() === userId.toString();
            const isCollaborator = pdf.collaborators.some((collab) => collab.userId._id.toString() === userId.toString());
            if (!isOwner && !isCollaborator) {
                throw new error_middleware_1.UnauthorizedError("You do not have access to this file.");
            }
            // ✅ Fetch annotations for the file
            const annotations = yield annotationModel_1.default.find({ fileId: pdf.id })
                .populate({
                path: "createdBy",
                select: "firstName lastName email profilePicture",
            })
                .lean();
            return Object.assign(Object.assign({}, pdf.toObject()), { annotations });
        }
        catch (error) {
            throw error;
        }
    });
}
function generateUniqueFileCode() {
    return __awaiter(this, void 0, void 0, function* () {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const length = 7;
        let fileId;
        let isUnique = false;
        while (!isUnique) {
            // Generate a random file code
            fileId = "";
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                fileId += characters[randomIndex];
            }
            // Check if it already exists in the database
            const existingCode = yield PdfModel_1.default.findOne({ fileId }).exec();
            if (!existingCode) {
                isUnique = true; // Code is unique
            }
        }
        return fileId;
    });
}
function requestAccessService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ fileId, requesterId, }) {
        yield FileExist(fileId);
        const existingRequest = yield invitesModel_1.AccessRequest.findOne({
            fileId,
            requesterId,
            status: "pending",
        });
        if (existingRequest) {
            throw new error_middleware_1.BadRequestError("You have requested for Access previously.");
        }
        console.log(existingRequest);
        // Create a new access request
        const accessRequest = yield invitesModel_1.AccessRequest.create({
            fileId,
            requesterId,
        });
        return accessRequest;
    });
}
const FileExist = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fileId) {
        throw new error_middleware_1.BadRequestError("User Id cannot be empty");
    }
    const file = yield PdfModel_1.default.findOne({ fileId });
    if (!file) {
        throw new error_middleware_1.NotFoundError("File not found or does nor exist.");
    }
});
function processAccessService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ requestId, action, userId, }) {
        // Fetch the access request
        const request = yield invitesModel_1.AccessRequest.findById(requestId);
        if (!request)
            throw new error_middleware_1.NotFoundError("Access request not found.");
        // Fetch the file associated with the access request
        const file = yield PdfModel_1.default.findOne({ fileId: request.fileId });
        if (!file)
            throw new error_middleware_1.NotFoundError("File not found.");
        // Prevent uploader from processing their own access requests
        if (file.uploadedBy.toString() === userId) {
            throw new error_middleware_1.UnauthorizedError("You cannot process this request.");
        }
        if (action === "approve") {
            // Check if the requester is already a collaborator
            let isCollaborator = false;
            for (const collaborator of file.collaborators) {
                if (collaborator.userId.toString() === request.requesterId.toString()) {
                    isCollaborator = true;
                    break;
                }
            }
            if (!isCollaborator) {
                // Add the requester as a collaborator with a default role
                file.collaborators.push({
                    userId: request.requesterId,
                    role: "viewer", // or "editor", based on your logic
                });
                yield file.save();
            }
            request.status = "approved";
        }
        else if (action === "deny") {
            request.status = "denied";
        }
        else {
            throw new error_middleware_1.BadRequestError("Invalid action specified.");
        }
        // Save the updated access request
        yield request.save();
        return {
            message: `Access request ${action}d successfully.`,
            request,
        };
    });
}
//# sourceMappingURL=index.js.map