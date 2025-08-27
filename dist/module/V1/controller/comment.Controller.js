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
exports.deleteComment = exports.getComment = exports.addComment = void 0;
const error_middleware_1 = require("../middlewares/error.middleware");
const response_1 = require("../../../utils/response");
const commentService_1 = require("../services/commentService");
const addComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, parentId, position, pageNumber } = req.body;
        if (!content)
            throw new error_middleware_1.BadRequestError("Content is required");
        const isReply = !!parentId;
        if (!isReply) {
            if (!(position === null || position === void 0 ? void 0 : position.x) || !(position === null || position === void 0 ? void 0 : position.y)) {
                throw new error_middleware_1.BadRequestError("Position (x and y) is required for top-level comments");
            }
            if ((position === null || position === void 0 ? void 0 : position.pageNumber) === undefined ||
                typeof (position === null || position === void 0 ? void 0 : position.pageNumber) !== "number") {
                throw new error_middleware_1.BadRequestError("Page number is required for top-level comments");
            }
        }
        const { fileId } = req.params;
        if (!fileId)
            throw new error_middleware_1.BadRequestError("File ID is required");
        const data = yield (0, commentService_1.createCommentService)({
            content,
            authorId: req.user,
            fileId,
            parentCommentId: parentId,
            position: isReply ? undefined : position,
            pageNumber: isReply ? undefined : position.pageNumber,
        });
        yield (0, response_1.successResponse)(res, 200, "Comment added successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.addComment = addComment;
const getComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        if (!commentId)
            throw new error_middleware_1.BadRequestError("Comment ID is required");
        const data = yield (0, commentService_1.getCommentByIdService)(commentId);
        yield (0, response_1.successResponse)(res, 200, "Comment retrieved successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.getComment = getComment;
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { commentId } = req.params;
        if (!commentId)
            throw new error_middleware_1.BadRequestError("Comment ID is required");
        const data = yield (0, commentService_1.deleteCommentService)({ commentId, author: req.user });
        yield (0, response_1.successResponse)(res, 200, "Comment deleted successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.Controller.js.map