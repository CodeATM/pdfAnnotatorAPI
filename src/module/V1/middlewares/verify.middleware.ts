import Jwt from "jsonwebtoken";
import { UnauthorizedError } from "./error.middleware";
import { Response, Request, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Check for the presence of the Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or invalid Authorization header")
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = Jwt.verify(
      token,
      process.env.VERIFICATION_TOKEN_SECRET as string
    ) as { userId: string };

    console.log(decodedToken.userId);
    req.user = decodedToken.userId;
    next();
  } catch (err) {
    next(err);
  }
};
