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
exports.requestAccess = requestAccess;
exports.acceptUserAsCollaborator = acceptUserAsCollaborator;
exports.getAllRequests = getAllRequests;
const pdfService_1 = require("../services/pdfService");
const accessService_1 = require("../services/accessService");
const response_1 = require("../../../utils/response");
const userService_1 = require("../services/userService");
function requestAccess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fileId } = req.params;
            const requesterId = req.user;
            yield (0, userService_1.CheckUser)(requesterId);
            const data = yield (0, pdfService_1.requestAccessService)({ fileId, requesterId });
            yield (0, response_1.successResponse)(res, 201, "Access request submitted.", data);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
}
function acceptUserAsCollaborator(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fileId } = req.params;
            const { userId, role } = req.body;
            const currentUserId = req.user;
            const file = yield (0, pdfService_1.addCollaboratorService)({
                fileId,
                userIdToAdd: userId,
                role,
                currentUserId,
            });
            yield (0, response_1.successResponse)(res, 201, "Collaborator added successfully.", file);
        }
        catch (error) {
            next(error);
        }
    });
}
function getAllRequests(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fileId } = req.params;
            const userId = req.user;
            const requests = yield (0, accessService_1.getAllRequestsService)({ fileId, userId });
            yield (0, response_1.successResponse)(res, 200, "Access requests retrieved.", requests);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    });
}
//# sourceMappingURL=request.controller.js.map