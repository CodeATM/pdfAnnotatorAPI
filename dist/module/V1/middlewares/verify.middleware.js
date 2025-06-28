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
exports.verify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_middleware_1 = require("./error.middleware");
const verify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    let token;
    // First, try to get token from Authorization header
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }
    // If no token in header, try to get it from cookies (accessToken)
    else if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }
    // Check if token was found in either location
    if (!token) {
        return next(new error_middleware_1.UnauthorizedError("Missing or invalid Authorization token"));
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
        req.user = decodedToken.userId;
        next();
    }
    catch (err) {
        next(new error_middleware_1.UnauthorizedError("Invalid or expired token"));
    }
});
exports.verify = verify;
//# sourceMappingURL=verify.middleware.js.map