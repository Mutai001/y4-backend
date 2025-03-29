// import { z } from 'zod';

// export const bookingsSchema = z.object({
//   user_id: z.number().int().positive().optional(),
//   therapist_id: z.number().int().positive(),
//   slot_id: z.number().int().positive(),
//   booking_status: z.enum(['Pending', 'Confirmed', 'Cancelled']).default('Pending')
// }).strict();


import { z } from 'zod';

export const bookingStatusEnum = z.enum(['Pending', 'Confirmed', 'Cancelled']);

export const bookingsSchema = z.object({
  user_id: z.number().int().positive(),
  therapist_id: z.number().int().positive(),
  slot_id: z.number().int().positive(),
  booking_status: bookingStatusEnum.default('Pending')
}).strict();

export type BookingsSchema = z.infer<typeof bookingsSchema>;