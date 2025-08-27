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
exports.FormatActivities = void 0;
const userModel_1 = __importDefault(require("../module/V1/models/userModel"));
const FormatActivities = (activities, // can be single or array
currentUserId) => __awaiter(void 0, void 0, void 0, function* () {
    // Normalize to array
    const activityList = Array.isArray(activities) ? activities : [activities];
    const actorIds = [
        ...new Set(activityList.map((a) => a.actor.toString())),
    ];
    const users = yield userModel_1.default.find({ _id: { $in: actorIds } }).lean();
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));
    const formatted = activityList.map((activity) => {
        var _a;
        const actorId = activity.actor.toString();
        const user = userMap.get(actorId);
        const actorName = actorId === currentUserId
            ? "You"
            : (user === null || user === void 0 ? void 0 : user.firstName) || "Unknown User";
        let message = "";
        switch (activity.type) {
            case "comment_added":
                message = `${actorName} added a comment on page`;
                break;
            case "comment_tagged":
                message = `${actorName} tagged someone in a comment`;
                break;
            case "highlight_added":
                message = `${actorName} added a highlight on page`;
                break;
            case "underline_added":
                message = `${actorName} added an underline on page`;
                break;
            case "file_renamed":
                message = `${actorName} renamed the file`;
                break;
            case "user_joined":
                message = `${actorName} joined the file`;
                break;
            default:
                message = `${actorName} performed an action`;
        }
        return {
            id: activity._id,
            actor: actorName,
            fileId: activity.fileId,
            type: activity.type,
            visibility: activity.visibility,
            annotationId: ((_a = activity.others) === null || _a === void 0 ? void 0 : _a.annotationId) || null,
            createdAt: activity.createdAt,
            message,
        };
    });
    // Return single object if input was single
    return Array.isArray(activities) ? formatted : formatted[0];
});
exports.FormatActivities = FormatActivities;
//# sourceMappingURL=formatter.js.map