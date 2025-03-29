import { db } from "../drizzle/db";
import { eq, and } from "drizzle-orm";
import { bookings, availableTimeSlots, users } from "../drizzle/schema";
import type { BookingsSchema, BookingUpdateSchema } from "./validator";

export const BookingsService = {
  async ensureSlotExists(slotId: number, therapistId: number, date?: string, startTime?: string, endTime?: string) {
    try {
      await db.insert(availableTimeSlots)
        .values({
          id: slotId,
          therapist_id: therapistId,
          date: date || new Date().toISOString().split('T')[0],
          start_time: startTime || '08:00:00',
          end_time: endTime || '09:00:00',
          is_booked: false
        })
        .onConflictDoUpdate({
          target: availableTimeSlots.id,
          set: { 
            therapist_id: therapistId,
            is_booked: false 
          }
        });
      return true;
    } catch (error) {
      console.error('Slot creation/update failed:', error);
      throw new Error('Failed to initialize time slot');
    }
  },

  async validateBookingData(bookingData: BookingsSchema) {
    if (!bookingData.slot_id || !bookingData.therapist_id || !bookingData.user_id) {
      throw new Error('Missing required booking fields');
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, bookingData.user_id),
    });
    if (!user) throw new Error(`User ${bookingData.user_id} not found`);

    const therapist = await db.query.users.findFirst({
      where: and(
        eq(users.id, bookingData.therapist_id),
        eq(users.role, 'therapist')
      ),
    });
    if (!therapist) throw new Error(`Therapist ${bookingData.therapist_id} not found or invalid role`);

    const existingBooking = await db.query.bookings.findFirst({
      where: eq(bookings.slot_id, bookingData.slot_id),
    });
    if (existingBooking) throw new Error(`Slot ${bookingData.slot_id} already booked`);
  },

  async create(bookingData: BookingsSchema) {
    await this.ensureSlotExists(
      bookingData.slot_id,
      bookingData.therapist_id,
      bookingData.date,
      bookingData.start_time,
      bookingData.end_time
    );

    await this.validateBookingData(bookingData);

    const [newBooking] = await db.insert(bookings)
      .values(bookingData)
      .returning();

    await db.update(availableTimeSlots)
      .set({ is_booked: true })
      .where(eq(availableTimeSlots.id, bookingData.slot_id));

    return newBooking;
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
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        patient: true,
        therapist: true,
        slot: true
      }
    });
    if (!booking) throw new Error('Booking not found');
    return booking;
  },

  async update(id: number, bookingData: BookingUpdateSchema) {
    const [updatedBooking] = await db.update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    
    if (bookingData.slot_id) {
      await db.update(availableTimeSlots)
        .set({ is_booked: true })
        .where(eq(availableTimeSlots.id, bookingData.slot_id));
    }
    
    return updatedBooking;
  },

  async cancelBooking(id: number) {
    const booking = await this.getById(id);
    
    const [updatedBooking] = await db.update(bookings)
      .set({ booking_status: 'Cancelled' })
      .where(eq(bookings.id, id))
      .returning();

    await db.update(availableTimeSlots)
      .set({ is_booked: false })
      .where(eq(availableTimeSlots.id, booking.slot_id));

    return updatedBooking;
  },

  async delete(id: number) {
    const booking = await this.getById(id);
    
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
    
    const existingBooking = slot ? await db.query.bookings.findFirst({
      where: eq(bookings.slot_id, slotId),
    }) : null;

    return {
      available: slot ? !slot.is_booked && !existingBooking : false,
      slot,
      existing_booking: existingBooking
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
  },

  async getBookingsByUser(userId: number) {
    return db.query.bookings.findMany({
      where: eq(bookings.user_id, userId),
      orderBy: (bookings, { desc }) => [desc(bookings.created_at)],
      with: {
        therapist: true,
        slot: true
      }
    });
  }
};