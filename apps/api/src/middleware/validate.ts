import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/apiResponse";

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          "Invalid request payload",
          400,
          "VALIDATION_ERROR",
          error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        );
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = (await schema.parseAsync(req.params)) as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          "Invalid path parameters",
          400,
          "VALIDATION_ERROR",
          error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        );
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as Record<string, any>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          "Invalid query parameters",
          400,
          "VALIDATION_ERROR",
          error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        );
        return;
      }
      next(error);
    }
  };
};

