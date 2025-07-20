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
exports.removeCollaborator = exports.patchCollaboratorRole = exports.getCollaborators = void 0;
const collaboratorService_1 = require("../services/collaboratorService");
const response_1 = require("../../../utils/response");
const error_middleware_1 = require("../middlewares/error.middleware");
const getCollaborators = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pdfId } = req.params;
        const result = yield (0, collaboratorService_1.fetchCollaboratorsForPDF)(pdfId);
        yield (0, response_1.successResponse)(res, 200, "Collaborators fetched successfully", result);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.getCollaborators = getCollaborators;
const patchCollaboratorRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pdfId } = req.params;
        const { userId, role } = req.body;
        const requesterId = req.user;
        if (!userId || !role) {
            throw new error_middleware_1.BadRequestError("userId and role are required");
        }
        if (!["viewer", "editor"].includes(role)) {
            throw new error_middleware_1.BadRequestError("userId and role are required");
        }
        const result = yield (0, collaboratorService_1.updateCollaboratorRole)(pdfId, requesterId, userId, role);
        yield (0, response_1.successResponse)(res, 200, result.message, {
            count: result.collaborators.length,
            collaborators: result.collaborators,
        });
    }
    catch (error) {
        console.error("Error updating collaborator role:", error.message);
        next(error);
    }
});
exports.patchCollaboratorRole = patchCollaboratorRole;
const removeCollaborator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pdfId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user;
        if (!userId) {
            throw new error_middleware_1.BadRequestError("userId is required");
        }
        const result = yield (0, collaboratorService_1.removeCollaboratorService)(pdfId, requesterId, userId);
        yield (0, response_1.successResponse)(res, 200, result.message, {
            collaborators: result.collaborators,
        });
    }
    catch (error) {
        console.error("Error removing collaborator:", error.message);
        next(error);
    }
});
exports.removeCollaborator = removeCollaborator;
//# sourceMappingURL=collaborators.controller.js.map