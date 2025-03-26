// timeSlot.validator.ts (Request Validation)
import { z } from "zod";

// Time slot schema for validation
const timeSlotSchema = z.object({
  start: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  end: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
});

// Schema for creating time slots
export const createTimeSlotsSchema = z.object({
  date: z.string().transform(val => new Date(val)),
  slots: z.array(timeSlotSchema).optional()
});

// Schema for updating a time slot
export const updateTimeSlotSchema = z.object({
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  is_booked: z.boolean().optional()
});

// Schema for querying available slots
export const getAvailableSlotsSchema = z.object({
  startDate: z.string().transform(val => new Date(val)),
  endDate: z.string().transform(val => new Date(val))
});