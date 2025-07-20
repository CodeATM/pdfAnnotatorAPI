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
exports.getFavorites = exports.removeFromFavorites = exports.addToFavorites = void 0;
const favouriteService_1 = require("../services/favouriteService");
const response_1 = require("../../../utils/response");
const error_middleware_1 = require("../middlewares/error.middleware");
const addToFavorites = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const { fileId } = req.body;
        if (!fileId)
            throw new error_middleware_1.BadRequestError("File ID is required");
        yield (0, favouriteService_1.addFavoriteService)(userId, fileId);
        yield (0, response_1.successResponse)(res, 200, "File added to favorites", null);
    }
    catch (error) {
        next(error);
    }
});
exports.addToFavorites = addToFavorites;
const removeFromFavorites = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const { fileId } = req.params;
        yield (0, favouriteService_1.removeFavoriteService)(userId, fileId);
        yield (0, response_1.successResponse)(res, 200, "File removed from favorites", null);
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromFavorites = removeFromFavorites;
const getFavorites = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const count = req.query.count
            ? parseInt(req.query.count, 10)
            : undefined;
        const favorites = yield (0, favouriteService_1.getFavoritesService)(userId, count);
        yield (0, response_1.successResponse)(res, 200, "Fetched favorite files", favorites);
    }
    catch (error) {
        next(error);
    }
});
exports.getFavorites = getFavorites;
//# sourceMappingURL=favourite.controller.js.map