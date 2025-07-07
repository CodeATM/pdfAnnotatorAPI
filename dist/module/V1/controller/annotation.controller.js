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
exports.createAnnotations = void 0;
const annotations_1 = require("../services/annotations");
const response_1 = require("../../../utils/response");
const createAnnotations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const annotations = req.body.annotations;
        const data = yield (0, annotations_1.addAnnotationService)({ annotations, user });
        yield (0, response_1.successResponse)(res, 201, "Annotations created successfully", data);
    }
    catch (error) {
        console.error("Error creating annotations:", error);
        next(error);
    }
});
exports.createAnnotations = createAnnotations;
//# sourceMappingURL=annotation.controller.js.map