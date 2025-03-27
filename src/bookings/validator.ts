import { z } from 'zod';

export const bookingsSchema = z.object({
  user_id: z.number().int().positive().optional(),
  therapist_id: z.number().int().positive(),
  slot_id: z.number().int().positive(),
  booking_status: z.enum(['Pending', 'Confirmed', 'Cancelled']).default('Pending')
}).strict();
