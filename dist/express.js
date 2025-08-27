"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MongoDB_1 = __importDefault(require("./utils/Databases/MongoDB"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./module/V1/middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./module/V1/Routes/auth.routes"));
const pdf_routes_1 = __importDefault(require("./module/V1/Routes/pdf-routes"));
const user_routes_1 = __importDefault(require("./module/V1/Routes/user.routes"));
const annotationsroute_1 = __importDefault(require("./module/V1/Routes/annotationsroute"));
const collaborators_routes_1 = __importDefault(require("./module/V1/Routes/collaborators.routes"));
const favourite_routes_1 = __importDefault(require("./module/V1/Routes/favourite.routes"));
const comments_routes_1 = __importDefault(require("./module/V1/Routes/comments.routes"));
const activities_routes_1 = __importDefault(require("./module/V1/Routes/activities.routes"));
const app = (0, express_1.default)();
(0, MongoDB_1.default)();
// Middleware
const corsOptions = {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 600,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Example Route
app.get("/health", (req, res) => {
    res.status(200).json({ message: "This Server is working perfectly" });
});
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/file", pdf_routes_1.default);
app.use("/api/v1/anon", annotationsroute_1.default);
app.use("/api/v1/col", collaborators_routes_1.default);
app.use("/api/v1/fav", favourite_routes_1.default);
app.use("/api/v1/comments", comments_routes_1.default);
app.use("/api/v1/activities", activities_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=express.js.map