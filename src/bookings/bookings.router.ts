import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BookingsController } from "./bookings.controller";
import { bookingsSchema } from "./validator";

export const bookingsRouter = new Hono();

// Logging middleware
bookingsRouter.use("*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
});

// Get all bookings
bookingsRouter.get("/", BookingsController.getAll);

// Get a single booking by ID
bookingsRouter.get("/:id", BookingsController.getById);

// Create a new booking with validation
bookingsRouter.post(
  "/",
  zValidator("json", bookingsSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation Errors:", result.error.errors);
      return c.json({
        error: "Validation failed",
        details: result.error.errors
      }, 400);
    }
  }),
  BookingsController.create
);

// Update a booking
bookingsRouter.put("/:id", BookingsController.update);

// Delete a booking
bookingsRouter.delete("/:id", BookingsController.delete);

// Check slot availability
bookingsRouter.get("/check-availability/:slot_id", BookingsController.checkSlotAvailability);

// Get bookings for a specific therapist
bookingsRouter.get("/therapist/:therapist_id", BookingsController.getBookingsByTherapist);
