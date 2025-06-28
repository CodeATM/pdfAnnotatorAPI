import { Router } from "express";
import { verify } from "../middlewares/verify.middleware";
import { myAccount } from "../controller/userController";

const userRoute = Router();

userRoute.get("/my-account", verify, myAccount);

export default userRoute;
