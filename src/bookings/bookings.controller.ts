import { Context } from "hono";
import { bookingsSchema } from "./validator";
import { BookingsService } from "./bookings.service";

export const bookingsController = {
  async list(c: Context) {
    try {
      const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined;
      const bookings = await BookingsService.getAll(limit);
      return c.json(bookings);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },

  async get(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

      const booking = await BookingsService.getById(id);
      if (!booking) return c.json({ error: 'Booking not found' }, 404);
      return c.json(booking);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 500);
    }
  },

  async create(c: Context) {
    try {
      const data = await c.req.json();
      const validated = bookingsSchema.parse(data);
      const booking = await BookingsService.create(validated);
      return c.json(booking, 201);
    } catch (error) {
      if ((error as any).name === 'ZodError') {
        return c.json({ error: 'Validation failed', details: (error as any).errors }, 400);
      }
      return c.json({ error: (error as Error).message }, 400);
    }
  },

  async update(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

      const data = await c.req.json();
      const booking = await BookingsService.update(id, data);
      return c.json(booking);
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  },

  async delete(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

      await BookingsService.delete(id);
      return c.json({ message: 'Booking deleted' });
    } catch (error) {
      return c.json({ error: (error as Error).message }, 400);
    }
  }
};