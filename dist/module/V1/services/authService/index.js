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
exports.createJwtTokenFunc = exports.loginService = exports.registerService = void 0;
const error_middleware_1 = require("../../middlewares/error.middleware");
const userModel_1 = __importDefault(require("../../models/userModel"));
const sessionModel_1 = __importDefault(require("../../models/sessionModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// register
const registerService = (registerData) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, password, email } = registerData;
    const userExists = yield userModel_1.default.findOne({ email: email });
    if (userExists) {
        throw new error_middleware_1.BadRequestError("User with this email already exists.");
    }
    const hashpassword = yield hashpasswordFunc(password);
    const newUser = yield userModel_1.default.create({
        firstName,
        lastName,
        password: hashpassword,
        email,
    });
    const userId = newUser.id;
    const accessToken = yield (0, exports.createJwtTokenFunc)({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
    });
    const refreshToken = yield (0, exports.createJwtTokenFunc)({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
    });
    const session = yield sessionModel_1.default.create({
        userId: newUser.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
        accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return { accessToken, refreshToken, userId };
});
exports.registerService = registerService;
const loginService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        throw new error_middleware_1.NotFoundError("Email and password are incorrect.");
    }
    const isPasswordCorrect = yield comparePasswordFunc(password, user.password);
    if (!isPasswordCorrect) {
        throw new error_middleware_1.UnauthorizedError("Password is incorrect.");
    }
    const userId = user.id;
    const accessToken = yield (0, exports.createJwtTokenFunc)({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
    });
    const refreshToken = yield (0, exports.createJwtTokenFunc)({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
    });
    const sessionUpdate = yield sessionModel_1.default.updateOne({ userId }, { accessToken, refreshToken }, { upsert: true });
    return { accessToken, refreshToken, userId };
});
exports.loginService = loginService;
// // Utility Functions
const hashpasswordFunc = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(password, 12);
});
const createJwtTokenFunc = (_a) => __awaiter(void 0, [_a], void 0, function* ({ UserIdentity, expiresIn, }) {
    if (!expiresIn) {
        throw new Error('Token expiration time ("expiresIn") is not defined.');
    }
    // Define the options for JWT sign
    const signOptions = {
        expiresIn,
    };
    return jsonwebtoken_1.default.sign(UserIdentity, process.env.VERIFICATION_TOKEN_SECRET, signOptions);
});
exports.createJwtTokenFunc = createJwtTokenFunc;
const comparePasswordFunc = (plaintextPassword, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(plaintextPassword, hashedPassword);
});
//# sourceMappingURL=index.js.map