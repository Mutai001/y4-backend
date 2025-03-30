// Zod Validator Middleware for Hono
import { Context, Next } from 'hono';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);
      
      if (!result.success) {
        const errors = result.error.errors.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        return c.json({
          success: false,
          message: 'Validation error',
          errors
        }, 400);
      }
      
      c.set('validatedBody', result.data);
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        return c.json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(e => e.message)
        }, 400);
      }
      
      return c.json({
        success: false,
        message: 'Invalid request body'
      }, 400);
    }
  };
};