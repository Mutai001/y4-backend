import { z } from 'zod';

export const feedbackSchema = z.object({
  user_id: z.number().int().positive(),
  session_id: z.number().int().positive(),
  rating: z.number().int().min(1).max(10),
  comments: z.string().min(1).max(1000),
  therapist_notes: z.string().max(1000).optional()
}).strict();

export const feedbackUpdateSchema = feedbackSchema.partial().strict();

export type FeedbackSchema = z.infer<typeof feedbackSchema>;
export type FeedbackUpdateSchema = z.infer<typeof feedbackUpdateSchema>;