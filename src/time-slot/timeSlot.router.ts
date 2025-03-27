import { Hono } from "hono";
import {
  listAvailableTimeSlots,
  getSingleTimeSlot,
  createAvailableTimeSlot,
  updateAvailableTimeSlot,
  deleteAvailableTimeSlot
} from "./timeSlot.controller";
import { zValidator } from "@hono/zod-validator";
import { timeSlotSchema } from "./timeSlot.validator";

export const timeSlotRouter = new Hono();

timeSlotRouter.get("/available-time-slots", listAvailableTimeSlots); // ✅ CORRECT

timeSlotRouter.get("/available-time-slots/:id", getSingleTimeSlot); // ✅ For a single slot

// ✅ Create a new time slot
timeSlotRouter.post(
  "/available-time-slots",
  zValidator("json", timeSlotSchema),
  createAvailableTimeSlot
);

// ✅ Update an existing time slot by ID
timeSlotRouter.put(
  "/available-time-slots/:id",
  zValidator("json", timeSlotSchema.partial()), // Allow partial updates
  updateAvailableTimeSlot
);

// ✅ Delete a time slot by ID
timeSlotRouter.delete("/available-time-slots/:id", deleteAvailableTimeSlot);
