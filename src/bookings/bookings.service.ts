import { TIBookings, bookings, availableTimeSlots, users } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq, and } from "drizzle-orm";

export const BookingsService = {
  // Fetch all bookings with an optional limit
  async getAll(limit?: number): Promise<TIBookings[]> {
    try {
      const result = limit
        ? await db.query.bookings.findMany({
            limit,
            with: { patient: true, therapist: true, slot: true },
          })
        : await db.query.bookings.findMany({
            with: { patient: true, therapist: true, slot: true },
          });

      if (result.length === 0) {
        console.warn('No bookings found');
      }

      return result;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  },

  // Fetch a single booking by its ID
  async getById(id: number): Promise<TIBookings | null> {
    try {
      const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, id),
        with: { patient: true, therapist: true, slot: true },
      });

      return booking ?? null;
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw new Error('Failed to fetch booking');
    }
  },

  // Create a new booking
  async create(bookingData: any) {
    try {
      return await db.transaction(async (tx) => {
        // Validate therapist existence
        const therapist = await tx.query.users.findFirst({
          where: eq(users.id, bookingData.therapist_id),
        });

        if (!therapist) {
          throw new Error('Therapist not found');
        }

        // Check if the slot is available
        const slot = await tx.query.availableTimeSlots.findFirst({
          where: and(
            eq(availableTimeSlots.id, bookingData.slot_id),
            eq(availableTimeSlots.is_booked, false),
            eq(availableTimeSlots.therapist_id, bookingData.therapist_id)
          ),
        });

        if (!slot) {
          throw new Error('Time slot not available or already booked');
        }

        // Check for existing conflicting bookings
        const existingBooking = await tx.query.bookings.findFirst({
          where: and(
            eq(bookings.slot_id, bookingData.slot_id),
            eq(bookings.booking_status, 'Confirmed')
          ),
        });

        if (existingBooking) {
          throw new Error('This slot is already booked');
        }

        // Proceed to create booking
        const finalBookingData = {
          ...bookingData,
          booking_status: bookingData.booking_status || 'Pending',
        };

        // Insert new booking
        const [booking] = await tx.insert(bookings)
          .values(finalBookingData)
          .returning();

        // Mark slot as booked
        await tx.update(availableTimeSlots)
          .set({ is_booked: true })
          .where(eq(availableTimeSlots.id, bookingData.slot_id));

        console.log('Booking created successfully:', booking);
        return booking;
      });
    } catch (error) {
      console.error('Booking creation error:', error);
      throw new Error('Failed to create booking');
    }
  },

  // Update an existing booking by ID
  async update(id: number, bookingData: Partial<TIBookings>) {
    try {
      return await db.transaction(async (tx) => {
        // Check if the booking exists
        const existingBooking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, id),
        });

        if (!existingBooking) {
          throw new Error(`Booking with ID ${id} not found`);
        }

        // If the slot is being changed, ensure new slot is available
        if (bookingData.slot_id) {
          const slot = await tx.query.availableTimeSlots.findFirst({
            where: and(
              eq(availableTimeSlots.id, bookingData.slot_id),
              eq(availableTimeSlots.is_booked, false)
            ),
          });

          if (!slot) {
            throw new Error('New time slot is not available');
          }

          // Update booking and slot statuses
          const [updatedBooking] = await tx.update(bookings)
            .set({
              ...bookingData,
              updated_at: new Date(),
            })
            .where(eq(bookings.id, id))
            .returning();

          // Mark old slot as unbooked
          await tx.update(availableTimeSlots)
            .set({ is_booked: false })
            .where(eq(availableTimeSlots.id, existingBooking.slot_id));

          // Mark new slot as booked
          await tx.update(availableTimeSlots)
            .set({ is_booked: true })
            .where(eq(availableTimeSlots.id, bookingData.slot_id));

          console.log('Booking updated successfully:', updatedBooking);
          return updatedBooking;
        }

        // Regular update without slot change
        const [updatedBooking] = await tx.update(bookings)
          .set({
            ...bookingData,
            updated_at: new Date(),
          })
          .where(eq(bookings.id, id))
          .returning();

        console.log('Booking updated successfully:', updatedBooking);
        return updatedBooking;
      });
    } catch (error) {
      console.error(`Error updating booking ${id}:`, error);
      throw new Error('Failed to update booking');
    }
  },

  // Delete a booking by ID
  async delete(id: number) {
    try {
      return await db.transaction(async (tx) => {
        // Find the booking to get the slot_id before deleting
        const booking = await tx.query.bookings.findFirst({
          where: eq(bookings.id, id),
        });

        if (!booking) {
          throw new Error(`Booking with ID ${id} not found`);
        }

        // Mark the associated slot as unbooked
        await tx.update(availableTimeSlots)
          .set({ is_booked: false })
          .where(eq(availableTimeSlots.id, booking.slot_id));

        // Delete the booking
        const [deletedBooking] = await tx.delete(bookings)
          .where(eq(bookings.id, id))
          .returning();

        console.log('Booking deleted successfully:', deletedBooking);
        return deletedBooking;
      });
    } catch (error) {
      console.error(`Error deleting booking ${id}:`, error);
      throw new Error('Failed to delete booking');
    }
  },

  // Get bookings for a specific therapist
  async getBookingsByTherapist(therapistId: number) {
    try {
      const therapistBookings = await db.query.bookings.findMany({
        where: eq(bookings.therapist_id, therapistId),
        with: { patient: true, slot: true },
      });

      if (therapistBookings.length === 0) {
        console.warn(`No bookings found for therapist ID: ${therapistId}`);
      }

      return therapistBookings;
    } catch (error) {
      console.error(`Error fetching bookings for therapist ${therapistId}:`, error);
      throw new Error('Failed to fetch therapist bookings');
    }
  },

  // Check if a time slot is available
  async checkSlotAvailability(slotId: number) {
    try {
      const slot = await db.query.availableTimeSlots.findFirst({
        where: eq(availableTimeSlots.id, slotId),
        with: { therapist: true },
      });

      if (!slot) {
        throw new Error('Slot not found');
      }

      return {
        available: !slot.is_booked,
        slot_details: {
          id: slot.id,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          therapist: slot.therapist,
        },
      };
    } catch (error) {
      console.error(`Error checking slot availability for slot ${slotId}:`, error);
      throw new Error('Failed to check slot availability');
    }
  }
};
