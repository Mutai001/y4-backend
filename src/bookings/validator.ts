import { z } from 'zod';

export const bookingStatusEnum = z.enum(['Pending', 'Confirmed', 'Cancelled']);

export const bookingsSchema = z.object({
  user_id: z.number().int().positive(),
  therapist_id: z.number().int().positive(),
  slot_id: z.number().int().positive(),
  booking_status: bookingStatusEnum.default('Pending'),
  date: z.string().optional().default(new Date().toISOString().split('T')[0]),
  start_time: z.string().optional().default('08:00:00'),
  end_time: z.string().optional().default('09:00:00')
}).strict();

export const bookingUpdateSchema = z.object({
  booking_status: bookingStatusEnum.optional(),
  slot_id: z.number().int().positive().optional()
}).strict();

export type BookingsSchema = z.infer<typeof bookingsSchema>;
export type BookingUpdateSchema = z.infer<typeof bookingUpdateSchema>;