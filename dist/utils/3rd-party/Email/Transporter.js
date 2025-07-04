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
exports.sendEmail = exports.loadTemplate = exports.createTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
// Create a transporter instance
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
};
exports.createTransporter = createTransporter;
// Load and compile an email template
const loadTemplate = (templateName, placeholders) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.resolve(__dirname, "templates", `${templateName}.html`);
    const templateContent = yield promises_1.default.readFile(filePath, "utf-8");
    const compiledTemplate = handlebars_1.default.compile(templateContent);
    return compiledTemplate(placeholders);
});
exports.loadTemplate = loadTemplate;
// Send an email with HTML template
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, templateName, placeholders, }) {
    const transporter = (0, exports.createTransporter)();
    try {
        const html = yield (0, exports.loadTemplate)(templateName, placeholders);
        yield transporter.sendMail({
            from: `"No Reply" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
            text: `Please view this email in a modern email client to see the full content.\n\nCode: ${placeholders.verification_code || "N/A"}`,
        });
        console.log(`✅ Email sent to ${to} | Subject: "${subject}"`);
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${to} | Subject: "${subject}"`);
        console.error("Error details:", error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=Transporter.js.map