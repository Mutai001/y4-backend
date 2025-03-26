import { Context } from "hono";
import { BookingsService, getBookingsService, createBookingsService, updateBookingsService, deleteBookingsService } from "./bookings.service";

// Controller to get a list of bookings
export const listBookings = async (c: Context) => {
  try {
    const limit = Number(c.req.query('limit'));
    const data = await BookingsService(limit);
    if (data == null || data.length == 0) {
      return c.text("Bookings not found", 404);
    }
    return c.json(data, 200);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

// Controller to get a single booking by ID
export const getBookings = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const booking = await getBookingsService(id);
  if (booking == undefined) {
    return c.text("Booking not found", 404);
  }
  return c.json(booking, 200);
};

// Controller to create a new booking
export const createBookings = async (c: Context) => {
  try {
    const booking = await c.req.json();
    const createdBooking = await createBookingsService(booking);

    if (!createdBooking) return c.text("Booking not created", 404);
    return c.json({ msg: createdBooking }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

// Controller to update an existing booking by ID
export const updateBookings = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const booking = await c.req.json();
  try {
    const searchedBooking = await getBookingsService(id);
    if (searchedBooking == undefined) return c.text("Booking not found", 404);
    const res = await updateBookingsService(id, booking);
    if (!res) return c.text("Booking not updated", 404);

    return c.json({ msg: res }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};

// Controller to delete a booking by ID
export const deleteBookings = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  try {
    const booking = await getBookingsService(id);
    if (booking == undefined) return c.text("Booking not found", 404);
    const res = await deleteBookingsService(id);
    if (!res) return c.text("Booking not deleted", 404);

    return c.json({ msg: res }, 201);
  } catch (error: any) {
    return c.json({ error: error?.message }, 400);
  }
};
