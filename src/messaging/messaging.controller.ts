import { Context } from "hono";
import { messageService } from "./messaging.service";
import { messagesSchema } from "./messaging.validator";
import { ZodError } from "zod";

export class MessageController {
  // Send a new message
  async sendMessage(c: Context) {
    try {
      const messageData = await c.req.json();
     
      // Validate input
      const validatedData = messagesSchema.parse(messageData);
     
      // Convert status to string if needed
      const processedMessageData = {
        ...validatedData,
        status: validatedData.status 
          ? String(validatedData.status) as "Sent" | "Read" | "Deleted" 
          : "Sent"
      };
     
      // Send message
      const message = await messageService.sendMessage(processedMessageData);
     
      return c.json(message, 201);
    } catch (error) {
      console.error(error);
      
      // Handle Zod validation errors specifically
      if (error instanceof ZodError) {
        return c.json({
          error: "Validation failed",
          details: error.errors
        }, 400);
      }

      return c.json({
        error: error instanceof Error 
          ? error.message 
          : "Failed to send message"
      }, 400);
    }
  }

  // Get user's messages (sent or received)
  async getUserMessages(c: Context) {
    try {
      const userId = Number(c.req.param('userId'));
      const limit = Number(c.req.query('limit') || '50');
      const offset = Number(c.req.query('offset') || '0');
      const sent = c.req.query('sent') === 'true';
      const messages = await messageService.getUserMessages(userId, {
        limit,
        offset,
        sent
      });
      return c.json(messages);
    } catch (error) {
      return c.json({
        error: error instanceof Error 
          ? error.message 
          : "Failed to retrieve messages"
      }, 400);
    }
  }

  // Get conversation between two users
  async getConversation(c: Context) {
    try {
      const user1Id = Number(c.req.param('user1Id'));
      const user2Id = Number(c.req.param('user2Id'));
      const limit = Number(c.req.query('limit') || '50');
      const offset = Number(c.req.query('offset') || '0');
      const conversation = await messageService.getConversation(
        user1Id,
        user2Id,
        { limit, offset }
      );
      return c.json(conversation);
    } catch (error) {
      return c.json({
        error: error instanceof Error 
          ? error.message 
          : "Failed to retrieve conversation"
      }, 400);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(c: Context) {
    try {
      const { messageIds } = await c.req.json();
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return c.json({ error: "Invalid message IDs" }, 400);
      }
      const result = await messageService.markMessagesAsRead(messageIds);
      return c.json({ message: "Messages marked as read", count: result.length });
    } catch (error) {
      return c.json({
        error: error instanceof Error 
          ? error.message 
          : "Failed to mark messages as read"
      }, 400);
    }
  }

  // Delete a message
  async deleteMessage(c: Context) {
    try {
      const messageId = Number(c.req.param('messageId'));
      const deletedMessage = await messageService.deleteMessage(messageId);
     
      return deletedMessage.length
        ? c.json({ message: "Message deleted successfully" })
        : c.json({ error: "Message not found" }, 404);
    } catch (error) {
      return c.json({
        error: error instanceof Error 
          ? error.message 
          : "Failed to delete message"
      }, 400);
    }
  }

  // Count unread messages
  async countUnreadMessages(c: Context) {
    try {
      const userId = Number(c.req.param('userId'));
      const unreadCount = await messageService.countUnreadMessages(userId);
     
      return c.json({ unreadCount });
    } catch (error) {
      return c.json({
        error: error instanceof Error 
          ? error.message 
          : "Failed to count unread messages"
      }, 400);
    }
  }
}

export const messageController = new MessageController();