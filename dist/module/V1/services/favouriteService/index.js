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
exports.getFavoritesService = exports.removeFavoriteService = exports.addFavoriteService = void 0;
// src/services/favorites.service.ts
const userModel_1 = __importDefault(require("../../models/userModel"));
const PdfModel_1 = __importDefault(require("../../models/PdfModel"));
const error_middleware_1 = require("../../middlewares/error.middleware");
const addFavoriteService = (userId, fileId) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield PdfModel_1.default.findOne({ fileId: fileId });
    if (!file)
        throw new error_middleware_1.NotFoundError("File not found.");
    yield userModel_1.default.findByIdAndUpdate(userId, {
        $addToSet: { favoriteFiles: file.id },
    });
});
exports.addFavoriteService = addFavoriteService;
const removeFavoriteService = (userId, fileId) => __awaiter(void 0, void 0, void 0, function* () {
    const file = yield PdfModel_1.default.findOne({ fileId: fileId });
    if (!file)
        throw new error_middleware_1.NotFoundError("File not found.");
    yield userModel_1.default.findByIdAndUpdate(userId, {
        $pull: { favoriteFiles: file.id },
    });
});
exports.removeFavoriteService = removeFavoriteService;
const getFavoritesService = (userId, count) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.default.findById(userId)
        .populate({
        path: "favoriteFiles",
        options: { sort: { updatedAt: -1 } },
    })
        .lean();
    if (!user)
        throw new Error("User not found");
    let favorites = user.favoriteFiles;
    if (count && !isNaN(count)) {
        favorites = favorites.slice(0, count);
    }
    return favorites;
});
exports.getFavoritesService = getFavoritesService;
//# sourceMappingURL=index.js.map