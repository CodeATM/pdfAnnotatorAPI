"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const accessRequestSchema = new mongoose_1.default.Schema({
    fileId: {
        type: String,
        required: true,
        ref: "PDF",
    },
    requesterId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["pending", "approved", "denied"],
        default: "pending",
    },
}, {
    timestamps: true,
});
exports.AccessRequest = mongoose_1.default.model("AccessRequest", accessRequestSchema);
//# sourceMappingURL=index.js.map