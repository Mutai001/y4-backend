// timeSlot.router.ts
import { Hono } from "hono";
import {
  listAvailableTimeSlots,
  getSingleTimeSlot,
  createAvailableTimeSlot,
  updateAvailableTimeSlot,
  deleteAvailableTimeSlot,
} from "./timeSlot.controller";
import { zValidator } from "@hono/zod-validator";
import { timeSlotSchema } from "./timeSlot.validator";

export const timeSlotRouter = new Hono();

// ✅ Get all available time slots
timeSlotRouter.get("/", listAvailableTimeSlots);

// ✅ Get a single time slot by ID
timeSlotRouter.get("/:id", getSingleTimeSlot);

// ✅ Create a new time slot
timeSlotRouter.post("/", zValidator("json", timeSlotSchema), createAvailableTimeSlot);

// ✅ Update an existing time slot
timeSlotRouter.put("/:id", zValidator("json", timeSlotSchema.partial()), updateAvailableTimeSlot);

// ✅ Delete a time slot by ID
timeSlotRouter.delete("/:id", deleteAvailableTimeSlot);