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
exports.editPDFService = void 0;
exports.uploadPDFToCloudinary = uploadPDFToCloudinary;
exports.savePDFToDatabase = savePDFToDatabase;
exports.getUserPdfService = getUserPdfService;
exports.getSinglePDFService = getSinglePDFService;
exports.requestAccessService = requestAccessService;
exports.addCollaboratorService = addCollaboratorService;
exports.updateCollaboratorRole = updateCollaboratorRole;
const cloudinary_1 = __importDefault(require("../../../../utils/3rd-party/cloudinary"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const invitesModel_1 = require("../../models/invitesModel");
const annotationModel_1 = __importDefault(require("../../models/annotationModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
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
            // Step 1: Fetch user's PDFs (uploaded or collaborated on)
            const pdfs = yield PdfModel_1.default.find({
                $or: [{ uploadedBy: userId }, { "collaborators.userId": userId }],
            })
                .sort({ updatedAt: -1 })
                .populate("uploadedBy", "firstName lastName email avatar")
                .populate({
                path: "collaborators.userId",
                select: "firstName lastName email profilePicture",
            });
            // Step 2: Fetch user's favorite file ObjectIds
            const user = yield userModel_1.default.findById(userId).select("favoriteFiles").lean();
            const favoriteIds = (user === null || user === void 0 ? void 0 : user.favoriteFiles.map((id) => id.toString())) || [];
            // Step 3: Add isFavorite flag to each PDF
            const pdfsWithFavoriteFlag = pdfs.map((pdf) => {
                const isFavorite = favoriteIds.includes(pdf._id.toString());
                return Object.assign(Object.assign({}, pdf.toObject()), { isFavorite });
            });
            return pdfsWithFavoriteFlag;
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
function addCollaboratorService(_a) {
    return __awaiter(this, arguments, void 0, function* ({ fileId, userIdToAdd, role, currentUserId, }) {
        const file = yield PdfModel_1.default.findOne({ fileId });
        if (!file) {
            throw new error_middleware_1.NotFoundError("File not found.");
        }
        if (file.uploadedBy.toString() !== currentUserId) {
            throw new error_middleware_1.UnauthorizedError("Only the uploader can add collaborators.");
        }
        const isAlreadyCollaborator = file.collaborators.some((collab) => collab.userId.toString() === userIdToAdd);
        if (isAlreadyCollaborator) {
            throw new error_middleware_1.BadRequestError("User is already a collaborator.");
        }
        // Add collaborator
        file.collaborators.push({ userId: userIdToAdd, role });
        yield file.save();
        // Mark access request as approved if exists
        const accessRequest = yield invitesModel_1.AccessRequest.findOne({
            fileId,
            requesterId: userIdToAdd,
            status: "pending",
        });
        if (accessRequest) {
            accessRequest.status = "approved";
            yield accessRequest.save();
        }
        return file;
    });
}
function updateCollaboratorRole(pdfId, requesterId, userId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const pdf = yield PdfModel_1.default.findOne({ fileId: pdfId }).populate("collaborators.userId", "firstName lastName email avatar");
        if (!pdf)
            throw new error_middleware_1.NotFoundError("File not found.");
        if (!pdf.uploadedBy.equals(requesterId)) {
            throw new Error("You are not authorized to update this PDF's collaborators");
        }
        const collaborator = pdf.collaborators.find((collab) => collab.userId._id.equals(userId));
        if (!collaborator)
            throw new Error("Collaborator not found");
        if (collaborator.role === role) {
            return {
                message: "Role is already set to the specified value",
                collaborators: pdf.collaborators,
            };
        }
        collaborator.role = role;
        yield pdf.save();
        return {
            message: "Collaborator role updated successfully",
            collaborators: pdf.collaborators,
        };
    });
}
const editPDFService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ fileId, userId, updateData }) {
    const pdf = yield PdfModel_1.default.findOne({ fileId });
    if (!pdf) {
        throw new error_middleware_1.NotFoundError("File not found.");
    }
    const isUploader = pdf.uploadedBy.toString() === userId;
    const isEditorCollaborator = pdf.collaborators.some((c) => c.userId.toString() === userId && c.role === "editor");
    if (!isUploader && !isEditorCollaborator) {
        throw new error_middleware_1.UnauthorizedError("You are not allowed to edit this file.");
    }
    const { title, description } = updateData;
    if (!title && !description) {
        throw new error_middleware_1.BadRequestError("At least one of title or description must be provided.");
    }
    if (title)
        pdf.title = title;
    if (description)
        pdf.description = description;
    pdf.lastEditedBy = userId;
    pdf.lastEditedAt = new Date();
    yield pdf.save();
    return pdf;
});
exports.editPDFService = editPDFService;
//# sourceMappingURL=index.js.map