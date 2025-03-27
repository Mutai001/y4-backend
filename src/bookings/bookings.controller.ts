import { Context } from "hono";
import { BookingsService } from "./bookings.service";
import { TIBookings } from "../drizzle/schema";

export const BookingsController = {
  // Get all bookings with optional limit
  async getAll(c: Context) {
    try {
      const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined;
      const bookings = await BookingsService.getAll(limit);
      return c.json(bookings);
    } catch (error) {
      console.error('Error in getAll bookings:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      }, 500);
    }
  },

  // Get a single booking by ID
  async getById(c: Context) {
    try {
      const id = Number(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ error: 'Invalid booking ID' }, 400);
      }

      const booking = await BookingsService.getById(id);

      if (!booking) {
        return c.json({ error: 'Booking not found' }, 404);
      }

      return c.json(booking);
    } catch (error) {
      console.error('Error in getById booking:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to fetch booking'
      }, 500);
    }
  },

  // Create a new booking
  async create(c: Context) {
    try {
      const bookingData = await c.req.json();
      const newBooking = await BookingsService.create(bookingData);
      return c.json(newBooking, 201);
    } catch (error) {
      console.error('Error in create booking:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to create booking'
      }, 400);
    }
  },

  // Update an existing booking
  async update(c: Context) {
    try {
      const id = Number(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ error: 'Invalid booking ID' }, 400);
      }

      const bookingData = await c.req.json();
      const updatedBooking = await BookingsService.update(id, bookingData);

      return c.json(updatedBooking);
    } catch (error) {
      console.error('Error in update booking:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to update booking'
      }, 400);
    }
  },

  // Delete a booking
  async delete(c: Context) {
    try {
      const id = Number(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ error: 'Invalid booking ID' }, 400);
      }

      const deletedBooking = await BookingsService.delete(id);
      return c.json(deletedBooking);
    } catch (error) {
      console.error('Error in delete booking:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to delete booking'
      }, 400);
    }
  },

  // Check slot availability
  async checkSlotAvailability(c: Context) {
    try {
      const slotId = Number(c.req.param('slot_id'));

      if (isNaN(slotId)) {
        return c.json({ error: 'Invalid slot ID' }, 400);
      }

      const availability = await BookingsService.checkSlotAvailability(slotId);
      return c.json(availability);
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to check slot availability'
      }, 500);
    }
  },

  // Get bookings for a specific therapist
  async getBookingsByTherapist(c: Context) {
    try {
      const therapistId = Number(c.req.param('therapist_id'));

      if (isNaN(therapistId)) {
        return c.json({ error: 'Invalid therapist ID' }, 400);
      }

      const bookings = await BookingsService.getBookingsByTherapist(therapistId);
      return c.json(bookings);
    } catch (error) {
      console.error('Error fetching therapist bookings:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'Failed to fetch therapist bookings'
      }, 500);
    }
  }
};
