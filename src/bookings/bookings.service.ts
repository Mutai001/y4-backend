import { TIBookings, bookings, availableTimeSlots } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq, and } from "drizzle-orm";

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
        // More robust slot availability check
        const slot = await tx.query.availableTimeSlots.findFirst({
          where: and(
            eq(availableTimeSlots.id, bookingData.slot_id),
            eq(availableTimeSlots.is_booked, false)
          )
        });

        if (!slot) {
          throw new Error('Time slot not available or already booked');
        }

        // Check for existing conflicting bookings
        const existingBooking = await tx.query.bookings.findFirst({
          where: and(
            eq(bookings.slot_id, bookingData.slot_id),
            eq(bookings.booking_status, 'Confirmed')
          )
        });

        if (existingBooking) {
          throw new Error('This slot is already booked');
        }

        // Create booking
        const [booking] = await tx.insert(bookings)
          .values({
            ...bookingData,
            booking_status: 'Pending'  // Ensure default status
          })
          .returning();

        // Mark slot as booked
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
      return await db.transaction(async (tx) => {
        // If updating slot, ensure new slot is available
        if (bookingData.slot_id) {
          const slot = await tx.query.availableTimeSlots.findFirst({
            where: and(
              eq(availableTimeSlots.id, bookingData.slot_id),
              eq(availableTimeSlots.is_booked, false)
            )
          });

          if (!slot) {
            throw new Error('New time slot is not available');
          }

          // Update booking and slot statuses
          const [booking] = await tx.update(bookings)
            .set(bookingData)
            .where(eq(bookings.id, id))
            .returning();

          // Mark old slot as unbooked if status changes
          await tx.update(availableTimeSlots)
            .set({ is_booked: false })
            .where(eq(availableTimeSlots.id, slot.id));

          return booking;
        }

        // Regular update without slot change
        const [booking] = await tx.update(bookings)
          .set(bookingData)
          .where(eq(bookings.id, id))
          .returning();

        return booking;
      });
    } catch (error) {
      throw new Error('Failed to update booking');
    }
  },

  async delete(id: number) {
    try {
      await db.transaction(async (tx) => {
        // Find the booking to get slot_id before deleting
        const booking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, id)
        });

        if (booking) {
          // Mark the associated slot as unbooked
          await tx.update(availableTimeSlots)
            .set({ is_booked: false })
            .where(eq(availableTimeSlots.id, booking.slot_id));

          // Delete the booking
          await tx.delete(bookings)
            .where(eq(bookings.id, id));
        }
      });
    } catch (error) {
      throw new Error('Failed to delete booking');
    }
  }
};