import { Router } from "express";
import { verify } from "../middlewares/verify.middleware";
import { editProfile, myAccount } from "../controller/user.controller";

const userRoute = Router();

userRoute.get("/my-account", verify, myAccount);
userRoute.patch("/edit-profile", verify, editProfile);

export default userRoute;
