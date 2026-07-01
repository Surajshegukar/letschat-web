import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";

export interface CustomError extends Error {
  statusCode?: number;
}

export function globalErrorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: process.env.NODE_ENV === "production" && statusCode === 500 
      ? "An unexpected error occurred" 
      : message,
  });
}
