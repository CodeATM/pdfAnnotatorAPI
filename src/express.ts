import express, { Request, Response, NextFunction } from "express";
import logger from "./logger";
import connectDB from "./utils/Databases/MongoDB";
import cors from "cors";
import { errorHandler } from "./module/V1/middlewares/error.middleware";
import authRoutes from "./module/V1/Routes/auth.routes";
const app = express();

connectDB();

// Middleware
const corsOptions = {
  origin: (origin: any, callback: any) => {
    // Allow requests from specific origins or any origin for development
    const allowedOrigins = [
      "http://localhost:3000",
      "https://your-frontend-production.com",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
  credentials: true, // Allow cookies and credentials
  optionsSuccessStatus: 200, // For older browsers
  preflightContinue: false, // Handle preflight requests automatically
  maxAge: 600, // Cache preflight response for 10 minutes
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Example Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "This Server is working perfectly" });
});
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
