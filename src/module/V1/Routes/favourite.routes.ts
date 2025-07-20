import { Router } from "express";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../controller/favourite.controller";
import { verify } from "../middlewares/verify.middleware";

const favouriteRoute = Router();

favouriteRoute.post("/favorites", verify, addToFavorites);
favouriteRoute.delete("/favorites/:fileId", verify, removeFromFavorites);
favouriteRoute.get("/favorites", verify, getFavorites);

export default favouriteRoute;
