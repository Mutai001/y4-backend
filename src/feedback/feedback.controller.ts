import { Context } from "hono";
import { FeedbackService } from "./feedback.service";
import { feedbackSchema, feedbackUpdateSchema } from "./validator";
import type { FeedbackSchema, FeedbackUpdateSchema } from "./validator";

export const FeedbackController = {
  async getAll(c: Context) {
    try {
      const limit = c.req.query('limit') ? Number(c.req.query('limit')) : undefined;
      const feedbacks = await FeedbackService.getAll(limit);
      return c.json({ success: true, data: feedbacks });
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const); // Using const assertion for status codes
    }
  },

  async getById(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ 
        success: false, 
        error: 'Invalid ID format' 
      }, 400 as const);

      const feedback = await FeedbackService.getById(id);
      return c.json({ success: true, data: feedback });
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      const status = error instanceof Error && error.message.includes('not found') 
        ? 404 as const 
        : 500 as const;
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, status);
    }
  },

  async create(c: Context) {
    try {
      const rawData = await c.req.json();
      const feedbackData = feedbackSchema.parse(rawData);
      
      const newFeedback = await FeedbackService.create(feedbackData);
      return c.json({
        success: true,
        data: newFeedback,
        message: 'Feedback created successfully'
      }, 201 as const);
    } catch (error) {
      console.error('Failed to create feedback:', error);
      
      let status: 400 | 404 | 500 = 400;
      let errorMessage = 'Failed to create feedback';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) status = 404;
        if (error.message.includes('Database error')) status = 500;
        errorMessage = error.message;
      }
      
      return c.json({ 
        success: false, 
        error: errorMessage 
      }, status);
    }
  },

  async update(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ 
        success: false, 
        error: 'Invalid ID format' 
      }, 400 as const);

      const rawData = await c.req.json();
      const updateData = feedbackUpdateSchema.parse(rawData);

      const updatedFeedback = await FeedbackService.update(id, updateData);
      return c.json({
        success: true,
        data: updatedFeedback,
        message: 'Feedback updated successfully'
      });
    } catch (error) {
      console.error('Failed to update feedback:', error);
      const status = error instanceof Error && error.message.includes('not found') 
        ? 404 as const 
        : 400 as const;
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, status);
    }
  },

  async delete(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id)) return c.json({ 
        success: false, 
        error: 'Invalid ID format' 
      }, 400 as const);

      const deletedFeedback = await FeedbackService.delete(id);
      return c.json({
        success: true,
        data: deletedFeedback,
        message: 'Feedback deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      const status = error instanceof Error && error.message.includes('not found') 
        ? 404 as const 
        : 400 as const;
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, status);
    }
  },

  async getBySession(c: Context) {
    try {
      const sessionId = Number(c.req.param('session_id'));
      if (isNaN(sessionId)) return c.json({ 
        success: false, 
        error: 'Invalid session ID' 
      }, 400 as const);

      const feedbacks = await FeedbackService.getFeedbackBySession(sessionId);
      return c.json({ success: true, data: feedbacks });
    } catch (error) {
      console.error('Failed to fetch session feedback:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const);
    }
  },

  async getByUser(c: Context) {
    try {
      const userId = Number(c.req.param('user_id'));
      if (isNaN(userId)) return c.json({ 
        success: false, 
        error: 'Invalid user ID' 
      }, 400 as const);

      const feedbacks = await FeedbackService.getFeedbackByUser(userId);
      return c.json({ success: true, data: feedbacks });
    } catch (error) {
      console.error('Failed to fetch user feedback:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Database error'
      }, 500 as const);
    }
  }
};