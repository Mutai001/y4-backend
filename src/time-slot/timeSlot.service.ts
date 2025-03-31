// import { availableTimeSlots } from "../drizzle/schema";
// import db from "../drizzle/db";
// import { eq } from "drizzle-orm";

// export const getAvailableTimeSlotsService = async () => {
//   return await db.select().from(availableTimeSlots); // ✅ Ensure it selects all
// };


// // ✅ Fetch a single time slot by ID
// export const getAvailableTimeSlotService = async (id: number) => {
//   return db.query.availableTimeSlots.findFirst({
//     where: eq(availableTimeSlots.id, id),
//   });
// };

// // ✅ Create a new time slot
// export const createAvailableTimeSlotService = async (timeSlot: any) => {
//   return await db.insert(availableTimeSlots).values(timeSlot).returning();
// };

// // ✅ Update an existing time slot by ID
// export const updateAvailableTimeSlotService = async (id: number, timeSlot: any) => {
//   return await db
//     .update(availableTimeSlots)
//     .set(timeSlot)
//     .where(eq(availableTimeSlots.id, id))
//     .returning();
// };

// // ✅ Delete a time slot by ID
// export const deleteAvailableTimeSlotService = async (id: number) => {
//   return await db.delete(availableTimeSlots).where(eq(availableTimeSlots.id, id)).returning();
// };


import { availableTimeSlots, users } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

export const getAvailableTimeSlotsService = async () => {
  // Using the query builder with relations to get therapist details
  return await db.query.availableTimeSlots.findMany({
    with: {
      therapist: true, // Include all therapist details
    },
  });
};

// Get a single time slot by ID with therapist details
export const getAvailableTimeSlotService = async (id: number) => {
  return db.query.availableTimeSlots.findFirst({
    where: eq(availableTimeSlots.id, id),
    with: {
      therapist: true, // Include all therapist details
    },
  });
};

// Create a new time slot
export const createAvailableTimeSlotService = async (timeSlot: any) => {
  return await db.insert(availableTimeSlots).values(timeSlot).returning();
};

// Update an existing time slot by ID
export const updateAvailableTimeSlotService = async (id: number, timeSlot: any) => {
  return await db
    .update(availableTimeSlots)
    .set(timeSlot)
    .where(eq(availableTimeSlots.id, id))
    .returning();
};

// Delete a time slot by ID
export const deleteAvailableTimeSlotService = async (id: number) => {
  return await db.delete(availableTimeSlots).where(eq(availableTimeSlots.id, id)).returning();
};