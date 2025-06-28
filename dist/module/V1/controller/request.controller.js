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
exports.acceptAccess = acceptAccess;
const pdfService_1 = require("../services/pdfService");
const response_1 = require("../../../utils/response");
const userService_1 = require("../services/userService");
function requestAccess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fileId } = req.body;
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
function acceptAccess(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { requestId } = req.params;
        const { action } = req.body;
        const userId = req.user; // Assume authenticated user
        const { message, request } = yield (0, pdfService_1.processAccessService)({
            requestId,
            action,
            userId,
        });
        yield (0, response_1.successResponse)(res, 201, message, request);
        try {
        }
        catch (error) {
            res.status(500).json({ message: "Error managing access request.", error });
        }
    });
}
//# sourceMappingURL=request.controller.js.map