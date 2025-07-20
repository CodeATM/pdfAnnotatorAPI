"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favourite_controller_1 = require("../controller/favourite.controller");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const favouriteRoute = (0, express_1.Router)();
favouriteRoute.post("/favorites", verify_middleware_1.verify, favourite_controller_1.addToFavorites);
favouriteRoute.delete("/favorites/:fileId", verify_middleware_1.verify, favourite_controller_1.removeFromFavorites);
favouriteRoute.get("/favorites", verify_middleware_1.verify, favourite_controller_1.getFavorites);
exports.default = favouriteRoute;
//# sourceMappingURL=favourite.routes.js.map