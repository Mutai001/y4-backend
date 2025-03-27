import { z } from "zod";
import { MessageStatusEnum } from "./validator-utils";

export const messagesSchema = z.object({
  sender_id: z.number().int().positive(),
  receiver_id: z.number().int().positive(),
  booking_id: z.number().int().positive().optional(),
  content: z.string().min(1, "Message content cannot be empty"),
  status: MessageStatusEnum.default("Sent"),
  is_read: z.boolean().optional().default(false)
});

export type MessageInput = z.infer<typeof messagesSchema>;