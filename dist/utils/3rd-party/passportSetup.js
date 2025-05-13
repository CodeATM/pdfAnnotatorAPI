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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const userModel_1 = __importDefault(require("../../module/V1/models/userModel"));
const callbackURL = process.env.NODE_ENV === "prod"
    ? process.env.PROD_GOOGLE_CALLBACK
    : process.env.DEV_GOOGLE_CALLBACK;
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        console.log(profile);
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(new Error("No email found in profile"), null);
        }
        let user = yield userModel_1.default.findOne({ email });
        if (!user) {
            const firstName = ((_b = profile.name) === null || _b === void 0 ? void 0 : _b.givenName) || "";
            const lastName = ((_c = profile.name) === null || _c === void 0 ? void 0 : _c.familyName) || "";
            user = yield userModel_1.default.create({
                firstName,
                lastName,
                email,
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, null);
    }
})));
exports.default = passport_1.default;
//# sourceMappingURL=passportSetup.js.map