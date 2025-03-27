import { availableTimeSlots } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

// ✅ Fetch all available time slots
// export const getAvailableTimeSlotsService = async (limit?: number) => {
//   return db.query.availableTimeSlots.findMany({
//     ...(limit && { limit }), // Only apply limit if provided
//   });
// };
export const getAvailableTimeSlotsService = async () => {
  return await db.select().from(availableTimeSlots); // ✅ Ensure it selects all
};


// ✅ Fetch a single time slot by ID
export const getAvailableTimeSlotService = async (id: number) => {
  return db.query.availableTimeSlots.findFirst({
    where: eq(availableTimeSlots.id, id),
  });
};

// ✅ Create a new time slot
export const createAvailableTimeSlotService = async (timeSlot: any) => {
  return await db.insert(availableTimeSlots).values(timeSlot).returning();
};

// ✅ Update an existing time slot by ID
export const updateAvailableTimeSlotService = async (id: number, timeSlot: any) => {
  return await db
    .update(availableTimeSlots)
    .set(timeSlot)
    .where(eq(availableTimeSlots.id, id))
    .returning();
};

// ✅ Delete a time slot by ID
export const deleteAvailableTimeSlotService = async (id: number) => {
  return await db.delete(availableTimeSlots).where(eq(availableTimeSlots.id, id)).returning();
};
