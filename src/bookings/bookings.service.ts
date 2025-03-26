import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TIBookings, bookings } from "../drizzle/schema";

// List Bookings (with optional limit)
export const BookingsService = async (limit?: number): Promise<TIBookings[] | null> => {
  return db.query.bookings.findMany({ limit });
};

// Get a single booking by ID
export const getBookingsService = async (id: number): Promise<TIBookings | undefined> => {
  return db.query.bookings.findFirst({
    where: eq(bookings.id, id),
  });
};

// Create a new booking
export const createBookingsService = async (booking: TIBookings) => {
  await db.insert(bookings).values(booking);
  return "Booking created successfully";
};

// Update a booking by ID
export const updateBookingsService = async (id: number, booking: TIBookings) => {
  await db.update(bookings).set(booking).where(eq(bookings.id, id));
  return "Booking updated successfully";
};

// Delete a booking by ID
export const deleteBookingsService = async (id: number) => {
  await db.delete(bookings).where(eq(bookings.id, id));
  return "Booking deleted successfully";
};
