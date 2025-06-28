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
exports.getUser = exports.CheckUser = void 0;
const error_middleware_1 = require("../../middlewares/error.middleware");
const userModel_1 = __importDefault(require("../../models/userModel"));
const CheckUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new error_middleware_1.BadRequestError("User Id cannot be empty");
    }
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        throw new error_middleware_1.NotFoundError("User not found or does nor exist.");
    }
});
exports.CheckUser = CheckUser;
const getUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.CheckUser)(userId);
    const user = yield userModel_1.default.findById(userId).select("firstName lastName role gender email");
    return user;
});
exports.getUser = getUser;
//# sourceMappingURL=index.js.map