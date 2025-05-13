"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("./express"));
const logger_1 = __importDefault(require("./logger"));
// Start Server
const PORT = process.env.PORT || 3000;
express_1.default.listen(PORT, () => {
    logger_1.default.info(`Server running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map