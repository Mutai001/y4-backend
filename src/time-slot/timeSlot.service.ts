import { availableTimeSlots } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

// Service to fetch all available time slots
export const getAvailableTimeSlotsService = async (limit?: number) => {
  if (limit) {
    return await db.query.availableTimeSlots.findMany({
      limit: limit
    });
  }
  return await db.query.availableTimeSlots.findMany();
};

// Service to fetch a single time slot by ID
export const getAvailableTimeSlotService = async (id: number) => {
  return await db.query.availableTimeSlots.findFirst({
    where: eq(availableTimeSlots.id, id)
  });
};

// Service to create a new time slot
export const createAvailableTimeSlotService = async (timeSlot: any) => {
  await db.insert(availableTimeSlots).values(timeSlot);
  return "Time Slot created successfully";
};

// Service to update an existing time slot by ID
export const updateAvailableTimeSlotService = async (id: number, timeSlot: any) => {
  await db.update(availableTimeSlots).set(timeSlot).where(eq(availableTimeSlots.id, id));
  return "Time Slot updated successfully";
};

// Service to delete a time slot by ID
export const deleteAvailableTimeSlotService = async (id: number) => {
  await db.delete(availableTimeSlots).where(eq(availableTimeSlots.id, id));
  return "Time Slot deleted successfully";
};
