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
exports.myAccount = void 0;
const userService_1 = require("../services/userService");
const response_1 = require("../../../utils/response");
const myAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user;
        const data = yield (0, userService_1.getUser)(userId);
        yield (0, response_1.successResponse)(res, 200, "profile fetched successfully", data);
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
exports.myAccount = myAccount;
//# sourceMappingURL=userController.js.map