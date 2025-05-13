"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_middleware_1 = require("../middlewares/error.middleware");
class Routes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes();
    }
    routes() {
        // V1 Routes
        const v1Router = (0, express_1.Router)();
        this.initializeV1Routes(v1Router);
        this.router.use("/api/v1", v1Router);
        // Handle undefined routes globally
        this.router.use("*", (req, res, next) => {
            next(new error_middleware_1.NotFoundError("API endpoint not found or under construction"));
        });
    }
    initializeV1Routes(router) {
        // Register V1-specific routes
        // Example of adding a route: 
        // router.use("/auth", authRoutes);
        // For demonstration purposes, let's assume it's a simple handler:
        router.get("/example", (req, res) => {
            res.json({ message: "This is an example route" });
        });
    }
}
exports.default = new Routes().router;
//# sourceMappingURL=index.js.map