import { TIBookings, bookings } from "../drizzle/schema";
import db from "../drizzle/db";
import { eq } from "drizzle-orm";

// Service to fetch all bookings with an optional limit
export const BookingsService = async (limit?: number): Promise<TIBookings[] | null> => {
  if (limit) {
    return await db.query.bookings.findMany({
      limit: limit
    });
  }
  return await db.query.bookings.findMany();
};

// Service to fetch a single booking by ID
export const getBookingsService = async (id: number): Promise<TIBookings | undefined> => {
  return await db.query.bookings.findFirst({
    where: eq(bookings.id, id)
  });
};

// Service to create a new booking
export const createBookingsService = async (user: TIBookings) => {
  await db.insert(bookings).values(user);
  return "Booking created successfully";
};

// Service to update an existing booking
export const updateBookingsService = async (id: number, user: TIBookings) => {
  await db.update(bookings).set(user).where(eq(bookings.id, id));
  return "Booking updated successfully";
};

// Service to delete a booking
export const deleteBookingsService = async (id: number) => {
  await db.delete(bookings).where(eq(bookings.id, id));
  return "Booking deleted successfully";
};
