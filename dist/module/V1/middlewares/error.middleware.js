"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.errorHandler = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const mongodb_1 = require("mongodb");
const joi_1 = __importDefault(require("joi"));
const response_1 = require("../../../utils/response");
// Base error class
class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = this.constructor.name;
    }
}
// Specific error classes
class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class InternalServerError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
const errorHandler = (error, req, res, next) => {
    if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
        (0, response_1.errorResponse)(res, 403, "Invalid token.");
        return;
    }
    if (error instanceof mongodb_1.MongoServerError) {
        switch (error.code) {
            case 11000: {
                const field = Object.keys(error.keyPattern)[0];
                (0, response_1.errorResponse)(res, 400, `${field} already exists.`);
                return;
            }
            case 121:
                (0, response_1.errorResponse)(res, 400, "Document validation failed.");
                return;
            default:
                (0, response_1.errorResponse)(res, 500, "Database error occurred.");
                return;
        }
    }
    if (error instanceof joi_1.default.ValidationError) {
        const errorDetail = error.details.reduce((key, value) => {
            key[value.path.join(".")] = `${value.message}.`;
            return key;
        }, {});
        (0, response_1.errorResponse)(res, 400, "Validation Error", errorDetail);
        return;
    }
    if (error.status) {
        (0, response_1.errorResponse)(res, error.status, error.message);
        return;
    }
    console.error(error);
    (0, response_1.errorResponse)(res, 500, "An unknown error occurred.");
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map