//timeSlot.service.ts (Business Logic)

import { db } from "../drizzle/db";
import { availableTimeSlots, type TIAvailableTimeSlots } from "../drizzle/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { DEFAULT_TIME_SLOTS } from "../drizzle/schema";

export class TimeSlotService {
  // Create multiple time slots for a therapist
  static async createTimeSlots(therapistId: number, date: Date, customSlots?: Array<{start: string, end: string}>) {
    const slotsToCreate = (customSlots || DEFAULT_TIME_SLOTS).map(slot => ({
      therapist_id: therapistId,
      date,
      start_time: slot.start,
      end_time: slot.end,
      is_booked: false
    }));

    return await db.insert(availableTimeSlots).values(slotsToCreate).returning();
  }

  // Get all available slots for a therapist on a specific date
  static async getTimeSlots(therapistId: number, date: Date) {
    return await db.query.availableTimeSlots.findMany({
      where: and(
        eq(availableTimeSlots.therapist_id, therapistId),
        eq(availableTimeSlots.date, date)
      )
    });
  }

  // Update a specific time slot
  static async updateTimeSlot(slotId: number, data: Partial<TIAvailableTimeSlots>) {
    const [updatedSlot] = await db.update(availableTimeSlots)
      .set(data)
      .where(eq(availableTimeSlots.id, slotId))
      .returning();
    
    return updatedSlot;
  }

  // Delete a time slot
  static async deleteTimeSlot(slotId: number) {
    const [deletedSlot] = await db.delete(availableTimeSlots)
      .where(eq(availableTimeSlots.id, slotId))
      .returning();
    
    return deletedSlot;
  }

  // Get available slots between dates
  static async getAvailableSlotsInRange(therapistId: number, startDate: Date, endDate: Date) {
    return await db.query.availableTimeSlots.findMany({
      where: and(
        eq(availableTimeSlots.therapist_id, therapistId),
        gte(availableTimeSlots.date, startDate),
        lte(availableTimeSlots.date, endDate),
        eq(availableTimeSlots.is_booked, false)
      )
    });
  }
}