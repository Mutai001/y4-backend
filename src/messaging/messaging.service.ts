import { eq, desc } from "drizzle-orm";
import { db } from "../drizzle/db";
import { messages, TIMessages, TSMessages } from "../drizzle/schema";

export class MessageService {
  // Send a new message
  async sendMessage(messageData: TIMessages) {
    const result = await db.insert(messages).values(messageData).returning();
    return result[0];
  }

  // Get messages by user ID (sent or received)
  async getUserMessages(userId: number, options?: { 
    limit?: number, 
    offset?: number, 
    sent?: boolean 
  }) {
    const { limit = 50, offset = 0, sent = false } = options || {};
    
    const query = sent 
      ? eq(messages.sender_id, userId)
      : eq(messages.receiver_id, userId);

    return await db.select()
      .from(messages)
      .where(query)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(messages.created_at));
  }

  // Get conversation between two users
  async getConversation(user1Id: number, user2Id: number, options?: {
    limit?: number,
    offset?: number
  }) {
    const { limit = 50, offset = 0 } = options || {};

    return await db.select()
      .from(messages)
      .where(
        `(sender_id = ${user1Id} AND receiver_id = ${user2Id}) OR ` +
        `(sender_id = ${user2Id} AND receiver_id = ${user1Id})`
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(messages.created_at));
  }

  // Mark messages as read
  async markMessagesAsRead(messageIds: number[]) {
    return await db.update(messages)
      .set({ 
        status: "Read", 
        is_read: true 
      })
      .where(eq(messages.id, messageIds));
  }

  // Delete a message
  async deleteMessage(messageId: number) {
    return await db.delete(messages)
      .where(eq(messages.id, messageId))
      .returning();
  }

  // Count unread messages for a user
  async countUnreadMessages(userId: number) {
    const result = await db.select({ 
      count: count() 
    })
      .from(messages)
      .where(
        and(
          eq(messages.receiver_id, userId),
          eq(messages.is_read, false)
        )
      );
    return result[0]?.count || 0;
  }
}

export const messageService = new MessageService();