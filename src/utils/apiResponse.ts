import { Response } from 'express';

/**
 * Standardized API Response Interface
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  result?: T;
}

/**
 * Error API Response Interface
 */
export interface ErrorApiResponse {
  code: number;
  message: string;
  error?: {
    details?: any;
  };
}

/**
 * Custom Error Classes for Better Exception Handling
 */
export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', details?: any) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, details);
  }
}

/**
 * Success Response Helper
 */
export const successResponse = <T = any>(
  res: Response,
  message: string,
  result?: T,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    code: statusCode,
    message,
    result,
  };
  return res.status(statusCode).json(response);
};

/**
 * Error Response Helper
 */
export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  details?: any
): Response => {
  const response: ErrorApiResponse = {
    code: statusCode,
    message,
    error: details ? { details } : undefined,
  };
  return res.status(statusCode).json(response);
};

/**
 * Created Response Helper (201)
 */
export const createdResponse = <T = any>(
  res: Response,
  message: string,
  data?: T
): Response => {
  return successResponse(res, message, data, 201);
};

/**
 * No Content Response Helper (204)
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};
