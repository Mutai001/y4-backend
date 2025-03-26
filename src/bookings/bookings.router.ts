import { Hono } from "hono";
import { listBookings, getBookings, createBookings, updateBookings, deleteBookings } from "./bookings.controller";
import { zValidator } from "@hono/zod-validator";
import { bookingsSchema } from "./validator";

export const bookingRouter = new Hono();

// Get all bookings
bookingRouter.get("/bookings", listBookings);

// Get a single booking by ID
bookingRouter.get("/bookings/:id", getBookings);

// Create a new booking
bookingRouter.post("/bookings", zValidator('json', bookingsSchema, (result, c) => {
  if (!result.success) {
    return c.json(result.error, 400);
  }
}), createBookings);

// Update a booking by ID
bookingRouter.put("/bookings/:id", updateBookings);

// Delete a booking by ID
bookingRouter.delete("/bookings/:id", deleteBookings);
