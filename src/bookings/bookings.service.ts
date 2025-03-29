import { db } from "../drizzle/db";
import { eq, and } from "drizzle-orm";
import { bookings, availableTimeSlots, users } from "../drizzle/schema";
import type { BookingsSchema } from "./validator";

export const BookingsService = {
  async validateBookingData(bookingData: BookingsSchema) {
    // Validate required fields
    if (!bookingData.slot_id || !bookingData.therapist_id || !bookingData.user_id) {
      throw new Error('Missing required fields: slot_id, therapist_id, or user_id');
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, bookingData.user_id),
    });
    if (!user) throw new Error(`User with ID ${bookingData.user_id} not found`);

    // Check if therapist exists and has correct role
    const therapist = await db.query.users.findFirst({
      where: and(
        eq(users.id, bookingData.therapist_id),
        eq(users.role, 'therapist')
      ),
    });
    if (!therapist) throw new Error(`Therapist with ID ${bookingData.therapist_id} not found or not a therapist`);

    // Check slot exists and is available
    const slot = await db.query.availableTimeSlots.findFirst({
      where: and(
        eq(availableTimeSlots.id, bookingData.slot_id),
        eq(availableTimeSlots.therapist_id, bookingData.therapist_id),
        eq(availableTimeSlots.is_booked, false)
      ),
    });
    if (!slot) throw new Error('Time slot is not available or already booked');
  },

  async create(bookingData: BookingsSchema) {
    try {
      await this.validateBookingData(bookingData);

      // Optimistically mark slot as booked
      const updatedSlot = await db.update(availableTimeSlots)
        .set({ is_booked: true })
        .where(
          and(
            eq(availableTimeSlots.id, bookingData.slot_id),
            eq(availableTimeSlots.is_booked, false)
          )
        )
        .returning();

      if (updatedSlot.length === 0) {
        throw new Error('Time slot was booked by another request');
      }

      // Create the booking
      const [newBooking] = await db.insert(bookings)
        .values(bookingData)
        .returning();

      return newBooking;
    } catch (error) {
      console.error('Booking creation failed:', error);
      
      // Attempt to revert slot if booking failed
      if (bookingData?.slot_id) {
        try {
          await db.update(availableTimeSlots)
            .set({ is_booked: false })
            .where(eq(availableTimeSlots.id, bookingData.slot_id));
        } catch (cleanupError) {
          console.error('Failed to cleanup slot:', cleanupError);
        }
      }
      
      throw error;
    }
  },

  async getAll(limit?: number) {
    return db.query.bookings.findMany({
      limit: limit,
      orderBy: (bookings, { desc }) => [desc(bookings.created_at)],
      with: {
        patient: true,
        therapist: true,
        slot: true
      }
    });
  },

  async getById(id: number) {
    return db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        patient: true,
        therapist: true,
        slot: true
      }
    });
  },

  async update(id: number, bookingData: Partial<BookingsSchema>) {
    const [updatedBooking] = await db.update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  },

  async delete(id: number) {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id)
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const [deletedBooking] = await db.delete(bookings)
      .where(eq(bookings.id, id))
      .returning();

    await db.update(availableTimeSlots)
      .set({ is_booked: false })
      .where(eq(availableTimeSlots.id, booking.slot_id));

    return deletedBooking;
  },

  async checkSlotAvailability(slotId: number) {
    const slot = await db.query.availableTimeSlots.findFirst({
      where: eq(availableTimeSlots.id, slotId),
    });
    return { 
      available: !slot?.is_booked,
      slot: slot
    };
  },

  async getBookingsByTherapist(therapistId: number) {
    return db.query.bookings.findMany({
      where: eq(bookings.therapist_id, therapistId),
      orderBy: (bookings, { desc }) => [desc(bookings.created_at)],
      with: {
        patient: true,
        slot: true
      }
    });
  }
};