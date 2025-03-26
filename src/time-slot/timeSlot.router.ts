import { Hono } from "hono";
import {
  listAvailableTimeSlots,
  getAvailableTimeSlot,
  createAvailableTimeSlot,
  updateAvailableTimeSlot,
  deleteAvailableTimeSlot
} from "./timeSlot.controller";
import { zValidator } from "@hono/zod-validator";
import { timeSlotSchema } from "./timeSlot.validator";

export const timeSlotRouter = new Hono();

// Get all available time slots
timeSlotRouter.get("/available-time-slots", listAvailableTimeSlots);

// Get a single time slot by ID
timeSlotRouter.get("/available-time-slots/:id", getAvailableTimeSlot);

// Create a new time slot
timeSlotRouter.post(
  "/available-time-slots",
  zValidator('json', timeSlotSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  createAvailableTimeSlot
);

// Update an existing time slot by ID
timeSlotRouter.put("/available-time-slots/:id", updateAvailableTimeSlot);

// Delete a time slot by ID
timeSlotRouter.delete("/available-time-slots/:id", deleteAvailableTimeSlot);
