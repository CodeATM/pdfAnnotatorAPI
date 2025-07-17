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
exports.getAllRequestsService = void 0;
const invitesModel_1 = require("../../models/invitesModel");
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const getAllRequestsService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ fileId, userId, }) {
    // Check if the file exists
    const file = yield PdfModel_1.default.findOne({ fileId });
    if (!file) {
        throw new error_middleware_1.NotFoundError("File not found");
    }
    // Ensure the requesting user is the owner or has admin rights
    if (file.uploadedBy.toString() !== userId) {
        throw new error_middleware_1.UnauthorizedError("You do not have permission to view access requests for this file");
    }
    // Fetch access requests and populate user details
    const requests = yield invitesModel_1.AccessRequest.find({ fileId }).populate("requesterId", "firstName lastName email");
    return requests;
});
exports.getAllRequestsService = getAllRequestsService;
//# sourceMappingURL=index.js.map