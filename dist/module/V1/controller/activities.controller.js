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
exports.getActivity = exports.getActivities = void 0;
const activityService_1 = require("../services/activityService");
const response_1 = require("../../../utils/response");
const getActivities = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileId } = req.params;
        const user = req.user;
        const data = yield (0, activityService_1.getActivitiesService)({ fileId, user });
        yield (0, response_1.successResponse)(res, 200, "Activities fetched successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.getActivities = getActivities;
const getActivity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activityId } = req.params;
        const user = req.user;
        const data = yield (0, activityService_1.getActivityService)({ activityId, user });
        yield (0, response_1.successResponse)(res, 200, "Activity fetched successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.getActivity = getActivity;
//# sourceMappingURL=activities.controller.js.map