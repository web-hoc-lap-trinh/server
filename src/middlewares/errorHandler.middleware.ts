import { Request, Response, NextFunction } from 'express';
import { AppError, errorResponse } from '../utils/apiResponse';

/**
 * Advanced Error Handler Middleware
 * Centralized exception handling for the entire application
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if error is an instance of AppError
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle TypeORM/Database errors
  if (err.name === 'QueryFailedError') {
    errorResponse(res, 'Database query failed', 500, {
      error: err.message,
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'Token không hợp lệ', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'Token đã hết hạn', 401);
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    errorResponse(res, err.message, 422);
    return;
  }

  // Log unexpected errors
  console.error('Unexpected Error:', err);

  // Default error response
  errorResponse(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Đã xảy ra lỗi không mong muốn'
      : err.message,
    500,
    process.env.NODE_ENV === 'production' ? undefined : err.stack
  );
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  errorResponse(
    res,
    `Route ${req.method} ${req.originalUrl} không tồn tại`,
    404
  );
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
