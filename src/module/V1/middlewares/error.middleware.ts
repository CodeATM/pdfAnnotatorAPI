import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import Jwt, { JsonWebTokenError } from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import Joi from "joi";
import { errorResponse } from "../../../utils/response";

// Base error class
class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

// Specific error classes
class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

class InternalServerError extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}

export const errorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof JsonWebTokenError) {
    errorResponse(res, 403, "Invalid token.");
    return;
  }

  if (error instanceof MongoServerError) {
    switch (error.code) {
      case 11000: {
        const field = Object.keys(error.keyPattern)[0];
        errorResponse(res, 400, `${field} already exists.`);
        return;
      }
      case 121:
        errorResponse(res, 400, "Document validation failed.");
        return;
      default:
        errorResponse(res, 500, "Database error occurred.");
        return;
    }
  }

  if (error instanceof Joi.ValidationError) {
    const errorDetail = error.details.reduce((key: any, value) => {
      key[value.path.join(".")] = `${value.message}.`;
      return key;
    }, {});
    errorResponse(res, 400, "Validation Error", errorDetail);
    return;
  }

  if (error.status) {
    errorResponse(res, error.status, error.message);
    return;
  }

  console.error(error);
  errorResponse(res, 500, "An unknown error occurred.");
};

export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
};
