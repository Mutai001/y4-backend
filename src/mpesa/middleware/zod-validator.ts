import { Context, Next } from 'hono';
import { ZodSchema, ZodError } from 'zod';

// Middleware factory for validating request body with Zod
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return c.json({
          success: false,
          message: 'Validation error',
          error: errorMessages,
        }, 400);
      }
      
      // Add the validated data to the context for the next middleware/controller
      c.set('validated', result.data);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return c.json({
          success: false,
          message: 'Validation error',
          error: errorMessages,
        }, 400);
      }
      
      return c.json({
        success: false,
        message: 'Invalid request body',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 400);
    }
  };
};

// Middleware factory for validating URL parameters with Zod
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const params = c.req.param();
      const result = schema.safeParse(params);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return c.json({
          success: false,
          message: 'Validation error',
          error: errorMessages,
        }, 400);
      }
      
      c.set('validatedParams', result.data);
      await next();
    } catch (error) {
      return c.json({
        success: false,
        message: 'Invalid parameters',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 400);
    }
  };
};

// Middleware factory for validating query parameters with Zod
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const query = c.req.query();
      const result = schema.safeParse(query);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return c.json({
          success: false,
          message: 'Validation error',
          error: errorMessages,
        }, 400);
      }
      
      c.set('validatedQuery', result.data);
      await next();
    } catch (error) {
      return c.json({
        success: false,
        message: 'Invalid query parameters',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, 400);
    }
  };
};