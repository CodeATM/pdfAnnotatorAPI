"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CollaboratorSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
});
const PDFSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [CollaboratorSchema],
    version: { type: Number, default: 1 },
    size: { type: Number, required: true },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ["active", "archived", "deleted"],
        default: "active",
    },
    fileId: { type: String, required: true, unique: true },
    lastEditedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    lastEditedAt: { type: Date },
    accessControl: {
        publicAccess: { type: Boolean, default: false },
        defaultRole: {
            type: String,
            enum: ["viewer", "editor"],
            default: "viewer",
        },
        roles: {
            editor: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
            viewer: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
        },
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("PDF", PDFSchema);
//# sourceMappingURL=index.js.map