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
exports.deleteCommentService = exports.getCommentByIdService = exports.createCommentService = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const commentModel_1 = require("../../models/commentModel");
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const activityService_1 = require("../activityService");
const mentionRegex = /@([a-zA-Z0-9_]+)/g;
const createCommentService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ content, authorId, fileId, parentCommentId, position, pageNumber, }) {
    const file = yield PdfModel_1.default.findOne({ fileId });
    if (!file) {
        throw new error_middleware_1.NotFoundError("File not found");
    }
    const taggedUsernames = Array.from(new Set([...content.matchAll(mentionRegex)].map((match) => match[1].toLowerCase())));
    const taggedUsers = yield userModel_1.default.find({
        username: { $in: taggedUsernames },
    });
    if (taggedUsernames.length !== taggedUsers.length) {
        const foundUsernames = taggedUsers.map((u) => u.username);
        const missing = taggedUsernames.filter((u) => !foundUsernames.includes(u));
        throw new error_middleware_1.BadRequestError(`Mentioned users not found: ${missing.join(", ")}`);
    }
    let parentId = undefined;
    if (parentCommentId) {
        const parent = yield commentModel_1.Comment.findOne({ commentId: parentCommentId });
        if (!parent)
            throw new error_middleware_1.NotFoundError("Parent comment not found");
        parentId = parent._id;
    }
    const commentId = yield generateUniqueCommentId();
    const newComment = yield commentModel_1.Comment.create({
        content,
        author: authorId,
        parentId: parentId || null,
        fileId: file._id,
        commentId,
        taggedUsers: taggedUsers.map((u) => u._id),
        position,
        pageNumber,
    });
    if (parentId) {
        yield commentModel_1.Comment.findByIdAndUpdate(parentId, {
            $push: { replies: newComment._id },
        });
    }
    const populatedComment = yield commentModel_1.Comment.findById(newComment._id)
        .populate({
        path: "author",
        select: "firstName lastName username avatar email",
    })
        .populate({
        path: "taggedUsers",
        select: "firstName lastName username avatar email",
    })
        .populate({
        path: "parentId",
        select: "content",
    });
    const activity = yield (0, activityService_1.createActivity)({
        payload: {
            actor: authorId,
            fileId: fileId,
            type: "comment_added",
            others: {
                message: `added a comment on page`,
                annotationId: newComment._id,
            },
        },
    });
    return populatedComment;
});
exports.createCommentService = createCommentService;
const getCommentByIdService = (commentId) => __awaiter(void 0, void 0, void 0, function* () {
    const comment = yield commentModel_1.Comment.findOne({ commentId })
        .populate({
        path: "author",
        select: "firstName lastName username avatar email",
    })
        .populate({
        path: "replies",
        select: "content commentId createdAt",
        options: { sort: { createdAt: 1 } },
        populate: {
            path: "author",
            select: "firstName lastName username avatar email",
        },
    })
        .populate({
        path: "parentId",
        select: "content commentId createdAt",
    });
    if (!comment)
        throw new error_middleware_1.NotFoundError("Comment not found");
    return comment;
});
exports.getCommentByIdService = getCommentByIdService;
const deleteCommentService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ commentId, author, }) {
    const comment = yield commentModel_1.Comment.findOne({ commentId });
    if (!comment)
        throw new error_middleware_1.NotFoundError("Comment not found");
    if (comment.author.toString() !== author.toString()) {
        throw new error_middleware_1.ForbiddenError("You are not the owner of this comment");
    }
    // Step 1: Recursive function to collect all nested reply _ids
    const collectReplyIds = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
        const directReplies = yield commentModel_1.Comment.find({ parentId }, { _id: 1 });
        if (directReplies.length === 0)
            return [];
        const nestedIds = yield Promise.all(directReplies.map((reply) => collectReplyIds(reply._id)));
        return [...directReplies.map((r) => r._id), ...nestedIds.flat()];
    });
    // Step 2: Get all nested reply ids
    const allReplyIds = yield collectReplyIds(comment._id);
    // Step 3: Delete all replies and the main comment
    yield commentModel_1.Comment.deleteMany({ _id: { $in: allReplyIds } });
    yield commentModel_1.Comment.deleteOne({ _id: comment._id });
    return;
});
exports.deleteCommentService = deleteCommentService;
// export const getThreadComments = async (threadId: string) => {
//   return Comment.find({ threadId, deleted: false })
//     .sort({ createdAt: 1 })
//     .populate("author taggedUsers parentComment");
// };
function generateUniqueCommentId() {
    return __awaiter(this, void 0, void 0, function* () {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const length = 7;
        let commentId;
        let isUnique = false;
        while (!isUnique) {
            // Generate a random comment ID
            commentId = "";
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                commentId += characters[randomIndex];
            }
            // Check if it already exists in the database
            const existingCode = yield commentModel_1.Comment.findOne({ commentId }).exec();
            if (!existingCode) {
                isUnique = true;
            }
        }
        return commentId;
    });
}
//# sourceMappingURL=index.js.map