import { Context } from "hono";
import { ZodError } from "zod";

type ErrorResponse = {
  error: string;
  details?: any;
  stack?: string;
};

/**
 * Centralized error handler for Hono applications
 * @param c Hono Context
 * @param error The error object
 * @param customMessage Optional custom error message
 * @returns Hono Response
 */
export function handleError(c: Context, error: unknown, customMessage?: string): Response {
  // Default error response
  const errorResponse: ErrorResponse = {
    error: customMessage || "An unexpected error occurred",
  };

  let statusCode = 500;

  if (error instanceof ZodError) {
    // Handle Zod validation errors
    statusCode = 400;
    errorResponse.error = "Validation error";
    errorResponse.details = error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message
    }));
  } else if (error instanceof Error) {
    // Handle standard Error instances
    if (error.name === 'NotFoundError') {
      statusCode = 404;
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
    } else if (error.name === 'ConflictError') {
      statusCode = 409;
    }

    errorResponse.error = error.message;
    
    // Only include stack in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
  }

  return c.json(errorResponse, statusCode as any); // Type assertion for Hono's response
}

/**
 * Custom error classes for specific scenarios
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends Error {
  details: any;
  
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}