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
exports.sendEmailVerification = exports.sendInviteEmail = void 0;
const Transporter_1 = require("./Transporter");
const sendInviteEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ receiver, firstname, lastname, }) {
    try {
        yield (0, Transporter_1.sendEmail)({
            to: receiver,
            subject: "You're Invited!",
            templateName: "invite",
            placeholders: {
                name: `${firstname} ${lastname}`,
                inviteLink: "https://example.com/accept-invite",
            },
        });
        console.log("Invite email sent successfully.");
    }
    catch (error) {
        console.error("Failed to send invite email:", error);
    }
});
exports.sendInviteEmail = sendInviteEmail;
const sendEmailVerification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ receiver, firstname, lastname, code, }) {
    try {
        yield (0, Transporter_1.sendEmail)({
            to: receiver,
            subject: "Verify Your Email Address",
            templateName: "verification",
            placeholders: {
                first_name: firstname,
                verification_code: code,
                year: new Date().getFullYear().toString(),
            },
        });
    }
    catch (error) {
        console.error("❌ Failed to send verification email:", error);
    }
});
exports.sendEmailVerification = sendEmailVerification;
//# sourceMappingURL=Email.js.map