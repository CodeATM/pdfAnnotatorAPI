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
exports.removeCollaboratorService = exports.updateCollaboratorRole = exports.fetchCollaboratorsForPDF = void 0;
const error_middleware_1 = require("../../middlewares/error.middleware");
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const fetchCollaboratorsForPDF = (pdfId) => __awaiter(void 0, void 0, void 0, function* () {
    const pdf = yield PdfModel_1.default.findOne({ fileId: pdfId }).populate("collaborators.userId", "firstName lastName email avatar");
    if (!pdf)
        throw new error_middleware_1.NotFoundError("File not found.");
    return {
        count: pdf.collaborators.length,
        collaborators: pdf.collaborators,
    };
});
exports.fetchCollaboratorsForPDF = fetchCollaboratorsForPDF;
const updateCollaboratorRole = (pdfId, requesterId, userId, role) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.updateCollaboratorRole = updateCollaboratorRole;
const removeCollaboratorService = (pdfId, requesterId, userIdToRemove) => __awaiter(void 0, void 0, void 0, function* () {
    const pdf = yield PdfModel_1.default.findOne({ fileId: pdfId });
    if (!pdf) {
        throw new error_middleware_1.NotFoundError("File not found.");
    }
    if (pdf.uploadedBy.toString() !== requesterId) {
        throw new error_middleware_1.UnauthorizedError("You are not authorized to remove collaborators from this file.");
    }
    // Prevent removal of uploader
    if (pdf.uploadedBy.toString() === userIdToRemove) {
        throw new error_middleware_1.BadRequestError("You cannot remove the file uploader.");
    }
    // Find the collaborator subdoc to remove
    const collab = pdf.collaborators.find((c) => c.userId.toString() === userIdToRemove);
    if (!collab) {
        throw new error_middleware_1.NotFoundError("Collaborator not found on this file.");
    }
    // Remove using .pull() to maintain DocumentArray integrity
    pdf.collaborators.pull(collab._id);
    yield pdf.save();
    return {
        message: "Collaborator removed successfully",
        collaborators: pdf.collaborators,
    };
});
exports.removeCollaboratorService = removeCollaboratorService;
//# sourceMappingURL=index.js.map