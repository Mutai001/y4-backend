import { TIBookings, bookings, availableTimeSlots } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

export const BookingsService = {
  async getAll(limit?: number): Promise<TIBookings[]> {
    try {
      return limit 
        ? await db.query.bookings.findMany({ limit })
        : await db.query.bookings.findMany();
    } catch (error) {
      throw new Error('Failed to fetch bookings');
    }
  },

  async getById(id: number): Promise<TIBookings | null> {
    try {
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, id)
      });
      return booking ?? null;
    } catch (error) {
      throw new Error('Failed to fetch booking');
    }
  },

  async create(bookingData: any) {
    try {
      return await db.transaction(async (tx) => {
        const slot = await tx.query.availableTimeSlots.findFirst({
          where: eq(availableTimeSlots.id, bookingData.slot_id)
        });

        if (!slot) throw new Error('Time slot not found');
        if (slot.is_booked) throw new Error('Time slot already booked');

        const [booking] = await tx.insert(bookings)
          .values(bookingData)
          .returning();

        await tx.update(availableTimeSlots)
          .set({ is_booked: true })
          .where(eq(availableTimeSlots.id, bookingData.slot_id));

        return booking;
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create booking: ${error.message}`);
      }
      throw new Error('Failed to create booking: Unknown error');
    }
  },

  async update(id: number, bookingData: Partial<TIBookings>) {
    try {
      const [booking] = await db.update(bookings)
        .set(bookingData)
        .where(eq(bookings.id, id))
        .returning();
      return booking;
    } catch (error) {
      throw new Error('Failed to update booking');
    }
  },

  async delete(id: number) {
    try {
      await db.delete(bookings)
        .where(eq(bookings.id, id));
    } catch (error) {
      throw new Error('Failed to delete booking');
    }
  }
};