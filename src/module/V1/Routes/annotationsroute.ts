import { Router } from "express";
import express, { Request, Response } from "express";
import { createAnnotations } from "../controller/annotation.controller";
import { verify } from "../middlewares/verify.middleware";

const annotationRoutes = Router();

annotationRoutes.post("/create-annotation", verify, createAnnotations);

export default annotationRoutes;
