import { Response } from "express";

export const successResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any,
  error: boolean = false
): Response => {
  if (statusCode < 200 || statusCode > 299) {
    throw new Error("Invalid status code. Use a valid status code.");
  }

  message = message.endsWith(".") ? message : `${message}.`;

  return res.status(statusCode).json({ message, data, error });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
  error: boolean = true
): void => {
  message = message.endsWith(".") ? message : `${message}.`;

  res.status(statusCode).json({ message, statusCode, data, error });
};
