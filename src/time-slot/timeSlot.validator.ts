import { z } from "zod";

export const timeSlotSchema = z.object({
  therapist_id: z.number(),
  date: z.coerce.date(),
  start_time: z.string(),
  end_time: z.string(),
  is_booked: z.boolean().default(false),
});

