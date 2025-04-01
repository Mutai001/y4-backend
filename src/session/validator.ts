import { z } from 'zod';

const baseSessionSchema = {
  user_id: z.number().int().positive(),
  therapist_id: z.number().int().positive(),
  booking_id: z.number().int().positive(),
  session_notes: z.string().min(1, "Session notes cannot be empty"),
  session_date: z.union([
    z.string().datetime({ offset: true }).transform(str => new Date(str)),
    z.date()
  ]).transform(date => date.toISOString())
};

export const sessionSchema = z.object(baseSessionSchema).strict();

export const updateSessionSchema = z.object({
  user_id: z.number().int().positive().optional(),
  therapist_id: z.number().int().positive().optional(),
  booking_id: z.number().int().positive().optional(),
  session_notes: z.string().min(1, "Session notes cannot be empty").optional(),
  session_date: z.union([
    z.string().datetime({ offset: true }).transform(str => new Date(str)),
    z.date()
  ]).transform(date => date.toISOString()).optional()
}).strict().refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

export type SessionInput = z.infer<typeof sessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;