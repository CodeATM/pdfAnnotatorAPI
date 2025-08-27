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
exports.addAnnotationService = void 0;
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const annotationModel_1 = __importDefault(require("../../models/annotationModel"));
const activityService_1 = require("../activityService");
const error_middleware_1 = require("../../middlewares/error.middleware");
const addAnnotationService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ annotations, user, }) {
    if (!Array.isArray(annotations) || annotations.length === 0) {
        throw new error_middleware_1.BadRequestError("No annotations provided");
    }
    const fileId = annotations[0].fileId;
    if (!fileId) {
        throw new error_middleware_1.BadRequestError("Missing fileId in annotation");
    }
    const fileExists = yield PdfModel_1.default.findOne({ fileId: fileId });
    if (!fileExists) {
        throw new error_middleware_1.NotFoundError("The specified file does not exist");
    }
    const annotatedWithUser = annotations.map((item) => (Object.assign(Object.assign({}, item), { fileId: fileExists.id, createdBy: new mongoose_1.default.Types.ObjectId(user) })));
    const created = yield annotationModel_1.default.insertMany(annotatedWithUser);
    const mapAnnotationTypeToActivity = (type) => {
        switch (type) {
            case "highlight":
                return "highlight_added";
            case "underline":
                return "underline_added";
            default:
                throw new error_middleware_1.BadRequestError(`Unsupported annotation type: ${type}`);
        }
    };
    const activities = [];
    for (const annotation of created) {
        const activityType = mapAnnotationTypeToActivity(annotation.type);
        const activity = yield (0, activityService_1.createActivity)({
            payload: {
                actor: user,
                fileId: fileId,
                type: activityType,
                others: {
                    message: `added a ${annotation.type} on page ${annotation.pageNumber}`,
                    annotationId: annotation._id,
                },
            },
        });
        activities.push(activity);
    }
    return created;
});
exports.addAnnotationService = addAnnotationService;
//# sourceMappingURL=index.js.map