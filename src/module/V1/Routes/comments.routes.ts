import { Router } from "express";
import {
  addComment,
  deleteComment,
  getComment,
} from "../controller/comment.Controller";
import { verify } from "../middlewares/verify.middleware";

const commentRoutes = Router();

commentRoutes.post("/add-comment/:fileId", verify, addComment);
commentRoutes.get("/get-thread/:commentId", verify, getComment);
commentRoutes.delete("/delete-comment/:commentId", verify, deleteComment);

export default commentRoutes;
