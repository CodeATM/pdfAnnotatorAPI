import { Router } from "express";
import {
  getActivities,
  getActivity,
} from "../controller/activities.controller";
import { verify } from "../middlewares/verify.middleware";

const ActRouter = Router();

ActRouter.get("/:fileId", verify, getActivities);
ActRouter.get("/single-activity/:activityId", verify, getActivity);

export default ActRouter;
