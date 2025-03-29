import { Context } from "hono";
import { BookingsService } from "./bookings.service";
import { bookingsSchema, bookingStatusEnum } from "./validator";
import type { BookingsSchema } from "./validator";

export const BookingsController = {
  async getAll(c: Context) {
    try {
      const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined;
      const bookings = await BookingsService.getAll(limit);
      return c.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return c.json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      }, 500);
    }
  },

  async getById(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid booking ID' }, 400);
      }

      const booking = await BookingsService.getById(id);
      if (!booking) {
        return c.json({ success: false, error: 'Booking not found' }, 404);
      }

      return c.json({ success: true, data: booking });
    } catch (error) {
      console.error('Error getting booking by ID:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch booking'
      }, 500);
    }
  },

  async create(c: Context) {
    try {
      const rawData = await c.req.json();
      const parsedData = bookingsSchema.parse(rawData);
      
      const newBooking = await BookingsService.create(parsedData);
      
      return c.json({
        success: true,
        data: newBooking,
        message: 'Booking created successfully'
      }, 201);
    } catch (error) {
      console.error('Error creating booking:', error);
      
      let statusCode = 400;
      let errorMessage = 'Failed to create booking';
      let details: string | undefined = undefined;
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          statusCode = 404;
        } else if (error.message.includes('not available') || 
                  error.message.includes('booked by another')) {
          statusCode = 409;
          details = 'The time slot was recently booked by another user. Please try another slot.';
        }
        errorMessage = error.message;
      }
      
      return c.json({
        success: false,
        error: errorMessage,
        details
      }, statusCode as 400 | 404 | 409 | 500);
    }
  },

  async update(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid booking ID' }, 400);
      }

      const rawData = await c.req.json();
      const bookingData = bookingsSchema.partial().parse(rawData);

      const updatedBooking = await BookingsService.update(id, bookingData);

      return c.json({ 
        success: true,
        data: updatedBooking,
        message: 'Booking updated successfully'
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking'
      }, 400);
    }
  },

  async delete(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ success: false, error: 'Invalid booking ID' }, 400);
      }

      const deletedBooking = await BookingsService.delete(id);
      return c.json({ 
        success: true,
        data: deletedBooking,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete booking'
      }, 400);
    }
  },

  async checkSlotAvailability(c: Context) {
    try {
      const slotId = Number(c.req.param('slot_id'));
      if (isNaN(slotId)) {
        return c.json({ success: false, error: 'Invalid slot ID' }, 400);
      }

      const availability = await BookingsService.checkSlotAvailability(slotId);
      return c.json({ success: true, data: availability });
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check availability'
      }, 500);
    }
  },

  async getBookingsByTherapist(c: Context) {
    try {
      const therapistId = Number(c.req.param('therapist_id'));
      if (isNaN(therapistId)) {
        return c.json({ success: false, error: 'Invalid therapist ID' }, 400);
      }

      const bookings = await BookingsService.getBookingsByTherapist(therapistId);
      return c.json({ success: true, data: bookings });
    } catch (error) {
      console.error('Error fetching therapist bookings:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      }, 500);
    }
  }
};