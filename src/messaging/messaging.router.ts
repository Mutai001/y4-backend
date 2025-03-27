import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { messageController } from "./messaging.controller";
import { messagesSchema } from "./messaging.validator";
import { adminRoleAuth } from "../middleware/bearAuth"; // Assuming you have authentication middleware

export const messageRouter = new Hono();

// Send a new message
messageRouter.post(
  "/messages", 
  zValidator("json", messagesSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  messageController.sendMessage
);

// Get user's messages (sent or received)
messageRouter.get("/users/:userId/messages", messageController.getUserMessages);

// Get conversation between two users
messageRouter.get(
  "/conversations/:user1Id/:user2Id", 
  messageController.getConversation
);

// Mark messages as read
messageRouter.patch(
  "/messages/read", 
  messageController.markMessagesAsRead
);

// Delete a specific message
messageRouter.delete(
  "/messages/:messageId", 
  messageController.deleteMessage
);

// Count unread messages for a user
messageRouter.get(
  "/users/:userId/unread-count", 
  messageController.countUnreadMessages
);