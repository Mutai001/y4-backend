import { db } from "../drizzle/db";
import { eq } from "drizzle-orm";
import { feedback, sessions, users } from "../drizzle/schema";
import type { FeedbackSchema, FeedbackUpdateSchema } from "./validator";

export const FeedbackService = {
  async validateFeedbackData(feedbackData: FeedbackSchema) {
    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, feedbackData.user_id),
    });
    if (!user) throw new Error(`User ${feedbackData.user_id} not found`);

    // Check if session exists
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, feedbackData.session_id),
    });
    if (!session) throw new Error(`Session ${feedbackData.session_id} not found`);
  },

  async create(feedbackData: FeedbackSchema) {
    await this.validateFeedbackData(feedbackData);

    const [newFeedback] = await db.insert(feedback)
      .values(feedbackData)
      .returning();

    return newFeedback;
  },

  async getAll(limit?: number) {
    return db.query.feedback.findMany({
      limit: limit,
      orderBy: (feedback, { desc }) => [desc(feedback.created_at)],
      with: {
        user: true,
        session: {
          with: {
            booking: {
              with: {
                therapist: true
              }
            }
          }
        }
      }
    });
  },

  async getById(id: number) {
    const feedbacks = await db.query.feedback.findFirst({
      where: eq(feedback.id, id),
      with: {
        user: true,
        session: {
          with: {
            booking: {
              with: {
                therapist: true
              }
            }
          }
        }
      }
    });
    if (!feedback) throw new Error('Feedback not found');
    return feedback;
  },

  async update(id: number, feedbackData: FeedbackUpdateSchema) {
    const [updatedFeedback] = await db.update(feedback)
      .set(feedbackData)
      .where(eq(feedback.id, id))
      .returning();
    return updatedFeedback;
  },

  async delete(id: number) {
    const [deletedFeedback] = await db.delete(feedback)
      .where(eq(feedback.id, id))
      .returning();
    return deletedFeedback;
  },

  async getFeedbackBySession(sessionId: number) {
    return db.query.feedback.findMany({
      where: eq(feedback.session_id, sessionId),
      with: {
        user: true
      }
    });
  },

  async getFeedbackByUser(userId: number) {
    return db.query.feedback.findMany({
      where: eq(feedback.user_id, userId),
      with: {
        session: {
          with: {
            booking: {
              with: {
                therapist: true
              }
            }
          }
        }
      }
    });
  }
};