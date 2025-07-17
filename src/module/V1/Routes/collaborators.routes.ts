import { Router } from "express";
import {
  getCollaborators,
  patchCollaboratorRole,
  removeCollaborator
} from "../controller/collaborators.controller";
import { verify } from "../middlewares/verify.middleware";

const ColRouter = Router();

// GET /:pdfId/collaborators
ColRouter.get("/:pdfId/collaborators", verify, getCollaborators);
ColRouter.patch("/:pdfId/collaborators/role", verify, patchCollaboratorRole);
ColRouter.patch("/:pdfId/collaborators/remove", verify, removeCollaborator);

export default ColRouter;
