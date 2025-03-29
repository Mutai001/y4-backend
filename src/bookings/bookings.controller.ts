import { Context } from "hono";
import { BookingsService } from "./bookings.service";
import { bookingsSchema, bookingUpdateSchema } from "./validator";
import type { BookingsSchema, BookingUpdateSchema } from "./validator";

export const BookingsController = {
  async getAll(c: Context) {
    try {
      const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined;
      const bookings = await BookingsService.getAll(limit);
      return c.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const);
    }
  },

  async getById(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID format' }, 400 as const);

      const booking = await BookingsService.getById(id);
      return c.json({ success: true, data: booking });
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      const status = error instanceof Error && error.message.includes('not found') ? 404 as const : 500 as const;
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, status);
    }
  },

  async create(c: Context) {
    try {
      const rawData = await c.req.json();
      const bookingData = bookingsSchema.parse(rawData);
      
      const newBooking = await BookingsService.create(bookingData);
      return c.json({
        success: true,
        data: newBooking,
        message: 'Booking created successfully'
      }, 201 as const);
    } catch (error) {
      console.error('Failed to create booking:', error);
      
      let status: 400 | 404 | 409 | 500 = 400;
      let details = undefined;
      let errorMessage = 'Failed to create booking';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) status = 404;
        if (error.message.includes('already booked')) status = 409;
        if (error.message.includes('Failed to initialize')) status = 500;
        errorMessage = error.message;
        details = status === 409 ? 'Please choose another time slot' : undefined;
      }
      
      return c.json({ success: false, error: errorMessage, details }, status);
    }
  },

  async update(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID format' }, 400 as const);

      const rawData = await c.req.json();
      const updateData = bookingUpdateSchema.parse(rawData);

      if (updateData.booking_status === 'Cancelled') {
        const cancelledBooking = await BookingsService.cancelBooking(id);
        return c.json({
          success: true,
          data: cancelledBooking,
          message: 'Booking cancelled successfully'
        });
      }

      const updatedBooking = await BookingsService.update(id, updateData);
      return c.json({
        success: true,
        data: updatedBooking,
        message: 'Booking updated successfully'
      });
    } catch (error) {
      console.error('Failed to update booking:', error);
      const status = error instanceof Error && error.message.includes('not found') ? 404 as const : 400 as const;
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, status);
    }
  },

  async delete(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ success: false, error: 'Invalid ID format' }, 400 as const);

      const deletedBooking = await BookingsService.delete(id);
      return c.json({
        success: true,
        data: deletedBooking,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete booking:', error);
      const status = error instanceof Error && error.message.includes('not found') ? 404 as const : 400 as const;
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, status);
    }
  },

  async checkSlotAvailability(c: Context) {
    try {
      const slotId = Number(c.req.param('slot_id'));
      if (isNaN(slotId)) return c.json({ success: false, error: 'Invalid slot ID' }, 400 as const);

      const availability = await BookingsService.checkSlotAvailability(slotId);
      return c.json({ success: true, data: availability });
    } catch (error) {
      console.error('Failed to check slot availability:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const);
    }
  },

  async getBookingsByTherapist(c: Context) {
    try {
      const therapistId = Number(c.req.param('therapist_id'));
      if (isNaN(therapistId)) return c.json({ success: false, error: 'Invalid therapist ID' }, 400 as const);

      const bookings = await BookingsService.getBookingsByTherapist(therapistId);
      return c.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Failed to fetch therapist bookings:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const);
    }
  },

  async getBookingsByUser(c: Context) {
    try {
      const userId = Number(c.req.param('user_id'));
      if (isNaN(userId)) return c.json({ success: false, error: 'Invalid user ID' }, 400 as const);

      const bookings = await BookingsService.getBookingsByUser(userId);
      return c.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const);
    }
  }
};