"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, statusCode, message, data, error = false) => {
    if (statusCode < 200 || statusCode > 299) {
        throw new Error("Invalid status code. Use a valid status code.");
    }
    message = message.endsWith(".") ? message : `${message}.`;
    return res.status(statusCode).json({ message, data, error });
};
exports.successResponse = successResponse;
const errorResponse = (res, statusCode, message, data = null, error = true) => {
    message = message.endsWith(".") ? message : `${message}.`;
    res.status(statusCode).json({ message, statusCode, data, error });
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=index.js.map