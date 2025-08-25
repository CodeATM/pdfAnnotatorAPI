"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_Controller_1 = require("../controller/comment.Controller");
const verify_middleware_1 = require("../middlewares/verify.middleware");
const commentRoutes = (0, express_1.Router)();
commentRoutes.post("/add-comment/:fileId", verify_middleware_1.verify, comment_Controller_1.addComment);
commentRoutes.get("/get-thread/:commentId", verify_middleware_1.verify, comment_Controller_1.getComment);
commentRoutes.delete("/delete-comment/:commentId", verify_middleware_1.verify, comment_Controller_1.deleteComment);
exports.default = commentRoutes;
//# sourceMappingURL=comments.routes.js.map