import { Request, Response, NextFunction } from 'express';
import { CustomError } from './CustomError';

interface ErrorResponse {
  status: string;
  statusCode: number;
  message: string;
}

export const errorMiddleware = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!(err instanceof CustomError)) {
    // If the error is not a CustomError, create a generic error
    err = new CustomError(err.message || 'Internal Server Error', 500);
  }

  // Optionally log the error (for debugging or tracking purposes)
  console.error(err);

  // Respond with structured error information
  const errorResponse: ErrorResponse = {
    status: (err as CustomError).status,
    statusCode: (err as CustomError).statusCode,
    message: (err as CustomError).message,
  };

  res.status((err as CustomError).statusCode).json(errorResponse);
};
