"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.json()),
    transports: [
        new winston_1.transports.File({ filename: 'logs/error.log', level: 'error' }), // Error logs
        new winston_1.transports.File({ filename: 'logs/combined.log' }), // All logs
    ],
});
// Add Console Transport for All Environments
logger.add(new winston_1.transports.Console({
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(({ level, message, timestamp, stack }) => {
        const logMessage = `${timestamp} [${level}]: ${message}`;
        return stack ? `${logMessage}\n${stack}` : logMessage;
    })),
}));
exports.default = logger;
//# sourceMappingURL=logger.js.map