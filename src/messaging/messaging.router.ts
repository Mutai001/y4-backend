import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { messageController } from "./messaging.controller";
import { messagesSchema } from "./messaging.validator";

export const messageRouter = new Hono();

// Send a new message
messageRouter.post(
  "/",
  zValidator("json", messagesSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  messageController.sendMessage
);

// Get user's received messages
messageRouter.get("/users/:userId/messages", messageController.getUserMessages);

// Get user's sent messages
messageRouter.get("/users/:userId/messages/sent", messageController.getUserMessages);

// Get conversation between two users
messageRouter.get("/conversations/:user1Id/:user2Id", messageController.getConversation);

// Mark messages as read
messageRouter.patch("/read", messageController.markMessagesAsRead);

// Delete a specific message
messageRouter.delete("/:messageId", messageController.deleteMessage);
// Count unread messages for a user
// Count unread messages for a user
messageRouter.get("/users/:userId/unread-count", messageController.countUnreadMessages);
