import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";
import { sendError } from "../utils/apiResponse";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(
      res,
      "Validation failed",
      400,
      "VALIDATION_ERROR",
      err.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
    );
    return;
  }

  // Prisma unique constraint or foreign key errors
  if (err.name === "PrismaClientKnownRequestError") {
    logger.warn("Prisma known error:", err.message);
    sendError(res, "Database operation failed", 400, "DB_ERROR");
    return;
  }

  // SyntaxError from body-parser
  if (err instanceof SyntaxError && "body" in err) {
    sendError(res, "Malformed JSON in request body", 400, "BAD_REQUEST");
    return;
  }

  logger.error("Unhandled exception:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });

  sendError(
    res,
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    500,
    "INTERNAL_SERVER_ERROR"
  );
};

