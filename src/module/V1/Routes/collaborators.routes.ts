import { Router } from "express";
import { getCollaborators, patchCollaboratorRole } from "../controller/collaborators.controller";
import { verify } from "../middlewares/verify.middleware";

const ColRouter = Router();

// GET /:pdfId/collaborators
ColRouter.get("/:pdfId/collaborators", verify, getCollaborators);
ColRouter.patch("/:pdfId/collaborators/role", verify, patchCollaboratorRole);

export default ColRouter;