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
exports.verifyUserService = exports.createJwtTokenFunc = exports.generateSixDigitCode = exports.generateUniqueUsername = exports.googleAuthService = exports.refreshService = exports.loginService = exports.registerService = void 0;
const error_middleware_1 = require("../../middlewares/error.middleware");
const userModel_1 = __importDefault(require("../../models/userModel"));
const sessionModel_1 = __importDefault(require("../../models/sessionModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Email_1 = require("../../../../utils/3rd-party/Email/Email");
// register
const registerService = (registerData) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, password, email } = registerData;
    const userExists = yield userModel_1.default.findOne({ email });
    if (userExists) {
        throw new error_middleware_1.BadRequestError("User with this email already exists.");
    }
    const hashpassword = yield hashpasswordFunc(password);
    // 🔐 Generate code & expiration
    const verificationCode = (0, exports.generateSixDigitCode)(); // e.g., "123456"
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const username = yield (0, exports.generateUniqueUsername)(firstName, lastName);
    // ✅ Create the user
    const newUser = yield userModel_1.default.create({
        firstName,
        lastName,
        email,
        password: hashpassword,
        verificationCode,
        verificationCodeExpiresAt,
        username,
    });
    const userId = newUser.id;
    // 🔐 Create tokens
    const accessToken = yield (0, exports.createJwtTokenFunc)({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
    });
    const refreshToken = yield (0, exports.createJwtTokenFunc)({
        UserIdentity: { userId },
        expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
    });
    // 💾 Save tokens to session
    yield sessionModel_1.default.create({
        userId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    // ✉️ Send email with the code
    yield (0, Email_1.sendEmailVerification)({
        receiver: email,
        firstname: firstName,
        lastname: lastName,
        code: verificationCode,
    });
    return { userId };
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
const refreshService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ refreshToken, }) {
    try {
        // Verify if the access token is valid
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.VERIFICATION_TOKEN_SECRET || "defaultSecret");
        if (!decoded || !decoded.userId) {
            throw new error_middleware_1.UnauthorizedError("Invalid access token");
        }
        // Find the session in the database
        const session = yield sessionModel_1.default.findOne({ refreshToken });
        if (!session) {
            throw new error_middleware_1.UnauthorizedError("Session not found");
        }
        // Find the user associated with the session
        const user = yield userModel_1.default.findById(session.userId);
        if (!user) {
            throw new error_middleware_1.UnauthorizedError("User not found");
        }
        // Generate a new access token
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.VERIFICATION_TOKEN_SECRET || "defaultSecret", { expiresIn: "15m" });
        session.accessToken = newAccessToken;
        yield session.save();
        // Return both new tokens
        return newAccessToken;
    }
    catch (error) {
        console.error("Error refreshing tokens:", error);
        throw new error_middleware_1.InternalServerError("Unable to refresh tokens");
    }
});
exports.refreshService = refreshService;
const googleAuthService = (userDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, email_verified, first_name, last_name, googleId, profilePicture, } = userDetails;
    if (!email_verified) {
        throw new error_middleware_1.UnauthorizedError("Email is not verified by Google.");
    }
    const lowerCaseEmail = email.toLowerCase();
    try {
        let user = yield userModel_1.default.findOne({ email: lowerCaseEmail });
        if (!user) {
            const username = yield (0, exports.generateUniqueUsername)(first_name, last_name);
            user = yield userModel_1.default.create({
                email: lowerCaseEmail,
                password: "",
                googleId,
                firstName: first_name,
                lastName: last_name,
                username,
                avatar: profilePicture || "",
            });
        }
        else {
            const updateFields = {};
            if (!user.username) {
                updateFields.username = yield (0, exports.generateUniqueUsername)(first_name, last_name);
            }
            if (!user.firstName) {
                updateFields.firstName = first_name;
            }
            if (!user.lastName) {
                updateFields.lastName = last_name;
            }
            if (!user.avatar && profilePicture) {
                updateFields.avatar = profilePicture;
            }
            if (Object.keys(updateFields).length > 0) {
                yield userModel_1.default.updateOne({ _id: user._id }, { $set: updateFields });
                Object.assign(user, updateFields);
            }
        }
        const userId = user.id;
        // === Generate Tokens ===
        const accessToken = yield (0, exports.createJwtTokenFunc)({
            UserIdentity: { userId },
            expiresIn: process.env.VERIFICATION_ACCESS_TOKEN_EXP,
        });
        const refreshToken = yield (0, exports.createJwtTokenFunc)({
            UserIdentity: { userId },
            expiresIn: process.env.VERIFICATION_REFRESH_TOKEN_EXP,
        });
        // === Upsert Session ===
        yield sessionModel_1.default.updateOne({ userId }, { userId, accessToken, refreshToken }, { upsert: true });
        return { accessToken, refreshToken, userId };
    }
    catch (error) {
        console.error("Google Auth Error:", error);
        throw new error_middleware_1.InternalServerError("Failed to login with Google");
    }
});
exports.googleAuthService = googleAuthService;
// add a uniqe username
const generateUniqueUsername = (firstName, lastName) => __awaiter(void 0, void 0, void 0, function* () {
    const fn = firstName.trim().toLowerCase().slice(0, 3);
    const ln = lastName.trim().toLowerCase().slice(-3);
    let baseUsername = fn + ln;
    let username = baseUsername;
    let count = 1;
    while (yield userModel_1.default.exists({ username })) {
        username = `${baseUsername}${count}`;
        count++;
    }
    return username;
});
exports.generateUniqueUsername = generateUniqueUsername;
// // Utility Functions
const hashpasswordFunc = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.hash(password, 12);
});
const generateSixDigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // ensures 6-digit number
};
exports.generateSixDigitCode = generateSixDigitCode;
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
const verifyUserService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new error_middleware_1.BadRequestError("Activation Token missing.");
    }
    const user = yield userModel_1.default.findOne({ verificationCode: token });
    if (!user) {
        throw new error_middleware_1.NotFoundError("User not found or token is invalid.");
    }
    yield userModel_1.default.updateOne({ verificationCode: token }, { isEmailVerified: true, verificationCode: null });
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
exports.verifyUserService = verifyUserService;
//# sourceMappingURL=index.js.map