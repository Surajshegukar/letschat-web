import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Generic validation middleware factory.
 * Wraps a Zod schema and validates `req.body`.
 * On success, replaces `req.body` with the parsed (typed) result.
 * On failure, returns a 400 response with field-level error details.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          status: "error",
          statusCode: 400,
          message: "Validation failed",
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}
