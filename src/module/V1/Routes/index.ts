import { Router, Request, Response, NextFunction } from "express";
import { successResponse } from "../../../utils/response";
import { NotFoundError } from "../middlewares/error.middleware";

class Routes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {

    // V1 Routes
    const v1Router = Router();
    this.initializeV1Routes(v1Router);
    this.router.use("/api/v1", v1Router);

    // Handle undefined routes globally
    this.router.use("*", (req: Request, res: Response, next: NextFunction) => {
      next(new NotFoundError("API endpoint not found or under construction"));
    });
  }

  private initializeV1Routes(router: Router): void {
    // Register V1-specific routes
    // Example of adding a route: 
    // router.use("/auth", authRoutes);

    // For demonstration purposes, let's assume it's a simple handler:
    router.get("/example", (req: Request, res: Response) => {
      res.json({ message: "This is an example route" });
    });
  }
}

export default new Routes().router;
