import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BookingsController } from "./bookings.controller";
import { bookingsSchema, bookingUpdateSchema } from "./validator";
import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { availableTimeSlots, bookings } from "../drizzle/schema";

export const bookingsRouter = new Hono();

// Logging middleware
bookingsRouter.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} - ${ms}ms`);
});

// Debug endpoints
bookingsRouter.get("/debug/slot/:id", async (c) => {
  const slotId = Number(c.req.param('id'));
  if (isNaN(slotId)) return c.json({ success: false, error: "Invalid slot ID" }, 400 as const);
  
  const slot = await db.query.availableTimeSlots.findFirst({
    where: eq(availableTimeSlots.id, slotId),
  });
  
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.slot_id, slotId),
  });
  
  return c.json({
    success: true,
    data: {
      slot_exists: !!slot,
      slot_status: slot?.is_booked,
      booking_exists: !!booking,
      is_consistent: slot ? slot.is_booked === !!booking : null
    }
  });
});

// Main routes
bookingsRouter.get("/", BookingsController.getAll);
bookingsRouter.get("/:id", BookingsController.getById);
bookingsRouter.get("/user/:user_id", BookingsController.getBookingsByUser);
bookingsRouter.get("/therapist/:therapist_id", BookingsController.getBookingsByTherapist);
bookingsRouter.get("/check-availability/:slot_id", BookingsController.checkSlotAvailability);

bookingsRouter.post(
  "/",
  zValidator("json", bookingsSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, 400 as const);
    }
  }),
  BookingsController.create
);

bookingsRouter.put(
  "/:id",
  zValidator("json", bookingUpdateSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, 400 as const);
    }
  }),
  BookingsController.update
);

bookingsRouter.delete("/:id", BookingsController.delete);

export default bookingsRouter;