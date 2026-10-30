import { Request, Response } from "express";
import { sendError } from "../utils/apiResponse";

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(
    res,
    `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    404,
    "ROUTE_NOT_FOUND"
  );
};

