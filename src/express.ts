import express, { Request, Response, NextFunction } from "express";
import logger from "./logger";
import connectDB from "./utils/Databases/MongoDB";
import cors from "cors";
import { errorHandler } from "./module/V1/middlewares/error.middleware";
import authRoutes from "./module/V1/Routes/auth.routes";
import pdfRoutes from "./module/V1/Routes/pdf-routes";
import userRoute from "./module/V1/Routes/user.routes";
import annotationRoutes from "./module/V1/Routes/annotationsroute";
import ColRouter from "./module/V1/Routes/collaborators.routes";
import favouriteRoute from "./module/V1/Routes/favourite.routes";
import commentRoutes from "./module/V1/Routes/comments.routes";
const app = express();

connectDB();

// Middleware
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 600,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Example Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "This Server is working perfectly" });
});
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/file", pdfRoutes);
app.use("/api/v1/anon", annotationRoutes);
app.use("/api/v1/col", ColRouter);
app.use("/api/v1/fav", favouriteRoute);
app.use("/api/v1/comments", commentRoutes);

app.use(errorHandler);

export default app;
