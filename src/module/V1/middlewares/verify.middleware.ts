import Jwt from "jsonwebtoken";
import { UnauthorizedError } from "./error.middleware";
import { Response, Request, NextFunction } from "express";

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  // First, try to get token from Authorization header
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }
  // If no token in header, try to get it from cookies (accessToken)
  else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // Check if token was found in either location
  if (!token) {
    return next(
      new UnauthorizedError("Missing or invalid Authorization token")
    );
  }

  try {
    const decodedToken = Jwt.verify(
      token,
      process.env.VERIFICATION_TOKEN_SECRET as string
    ) as { userId: string };

    req.user = decodedToken.userId;
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};