"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    actor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    fileId: {
        type: String,
        required: true,
    },
    annotationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Annotation" },
    commentId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" },
    type: { type: String, required: true },
    visibility: { type: String, default: "user" },
    targetUser: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    others: { type: Object },
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.Activity = (0, mongoose_1.model)("Activity", activitySchema);
//# sourceMappingURL=index.js.map