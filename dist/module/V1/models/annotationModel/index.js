"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AnnotationSchema = new mongoose_1.default.Schema({
    fileId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Pdf",
        required: true,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    pageNumber: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },
    type: {
        type: String,
        enum: ["highlight", "comment", "drawing", "underline"],
        default: "comment",
    },
    color: {
        type: String,
        default: "#000000",
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
const AnnotationModel = mongoose_1.default.model("Annotation", AnnotationSchema);
exports.default = AnnotationModel;
//# sourceMappingURL=index.js.map