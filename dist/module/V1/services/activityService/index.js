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
exports.getActivityService = exports.getActivitiesService = exports.createActivity = void 0;
const activityModel_1 = require("../../models/activityModel");
const error_middleware_1 = require("../../middlewares/error.middleware");
const formatter_1 = require("../../../../utils/formatter");
const createActivity = (_a) => __awaiter(void 0, [_a], void 0, function* ({ payload, }) {
    try {
        const { actor, fileId, type, visibility = "user", targetUser, others, } = payload;
        if (!actor || !fileId || !type) {
            throw new error_middleware_1.BadRequestError("actor, fileId, and type are required to create activity");
        }
        const activity = yield activityModel_1.Activity.create({
            actor,
            fileId,
            type,
            visibility,
            targetUser,
            others,
        });
        console.log(activity);
        return activity;
    }
    catch (error) {
        console.error("Activity creation failed:", error);
    }
});
exports.createActivity = createActivity;
const getActivitiesService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ fileId, user, }) {
    const activities = yield activityModel_1.Activity.find({ fileId }).sort({ createdAt: -1 });
    const formattedResponse = yield (0, formatter_1.FormatActivities)(activities, user);
    return formattedResponse;
});
exports.getActivitiesService = getActivitiesService;
const getActivityService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ activityId, user, }) {
    const activity = yield activityModel_1.Activity.findById(activityId);
    const formattedResponse = yield (0, formatter_1.FormatActivities)(activity, user);
    return formattedResponse;
});
exports.getActivityService = getActivityService;
//# sourceMappingURL=index.js.map