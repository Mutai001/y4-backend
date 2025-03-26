import { z } from 'zod';

export const bookingsSchema = z.object({
  user_id: z.number(),
  therapist_id: z.number(),
  session_date: z.coerce.date(),
  booking_status: z.enum(['Pending', 'Confirmed', 'Cancelled']),
});
