import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { bookingsController } from "./bookings.controller";
import { bookingsSchema } from "./validator";
import { db } from "../drizzle/db";
import { bookings, availableTimeSlots } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

export const bookingsRouter = new Hono();

// ✅ Get all bookings
bookingsRouter.get("/", bookingsController.list);

// ✅ Get a single booking
bookingsRouter.get("/:id", bookingsController.get);

// ✅ Create a booking with validation
bookingsRouter.post(
  "/",
  zValidator("json", bookingsSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  bookingsController.create
);

// ✅ Update a booking
bookingsRouter.put("/:id", bookingsController.update);

// ✅ Delete a booking
bookingsRouter.delete("/:id", bookingsController.delete);

// ✅ Check slot availability
bookingsRouter.get("/check-availability/:slot_id", async (c) => {
  const slotId = Number(c.req.param("slot_id"));
  
  if (isNaN(slotId)) {
    return c.json({ error: "Invalid slot ID" }, 400);
  }

  const slot = await db.query.availableTimeSlots.findFirst({
    where: eq(availableTimeSlots.id, slotId)
  });

  if (!slot) {
    return c.json({ available: false, message: "Slot not found" }, 404);
  }

  return c.json({
    available: !slot.is_booked,
    slot_details: {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      therapist_id: slot.therapist_id
    }
  });
});

// ✅ Get bookings for a specific therapist
bookingsRouter.get("/therapist/:therapist_id", async (c) => {
  const therapistId = Number(c.req.param("therapist_id"));
  
  if (isNaN(therapistId)) {
    return c.json({ error: "Invalid therapist ID" }, 400);
  }

  const therapistBookings = await db.query.bookings.findMany({
    where: eq(bookings.therapist_id, therapistId)
  });

  return c.json(therapistBookings);
});