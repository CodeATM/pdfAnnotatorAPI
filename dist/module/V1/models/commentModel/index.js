"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    pageNumber: {
        type: Number,
    },
    position: {
        x: { type: Number },
        y: { type: Number },
    },
    fileId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "PDF",
    },
    parentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Comment",
        default: null,
    },
    taggedUsers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    deleted: {
        type: Boolean,
        default: false,
    },
    commentId: {
        type: String,
        required: true,
        unique: true,
    },
    replies: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Comment",
            default: [],
        },
    ],
}, { timestamps: true });
exports.Comment = (0, mongoose_1.model)("Comment", CommentSchema);
//# sourceMappingURL=index.js.map