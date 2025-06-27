import { Router } from "express";
import { verify } from "../middlewares/verify.middleware";
import { myAccount } from "../controller/userController";

const userRoutes = Router();
userRoutes.get("/me", verify, myAccount);

export default userRoutes;
