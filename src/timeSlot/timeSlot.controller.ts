//timeSlot.controller.ts (Request Handling)

import { Context } from "hono";
import { TimeSlotService } from "./timeSlot.service";
import { handleError } from "../utils/errorHandler";

export class TimeSlotController {
  static async createSlots(c: Context) {
    try {
      const { therapistId } = c.req.param();
      const { date, slots } = await c.req.json();
      
      const parsedDate = new Date(date);
      const createdSlots = await TimeSlotService.createTimeSlots(
        Number(therapistId),
        parsedDate,
        slots
      );
      
      return c.json(createdSlots, 201);
    } catch (error) {
      return handleError(c, error, "Failed to create time slots");
    }
  }

  static async getSlots(c: Context) {
    try {
      const { therapistId, date } = c.req.param();
      const parsedDate = new Date(date);
      
      const slots = await TimeSlotService.getTimeSlots(
        Number(therapistId),
        parsedDate
      );
      
      return c.json(slots);
    } catch (error) {
      return handleError(c, error, "Failed to get time slots");
    }
  }

  static async updateSlot(c: Context) {
    try {
      const { slotId } = c.req.param();
      const updatedSlot = await TimeSlotService.updateTimeSlot(
        Number(slotId),
        await c.req.json()
      );
      
      return c.json(updatedSlot);
    } catch (error) {
      return handleError(c, error, "Failed to update time slot");
    }
  }

  static async deleteSlot(c: Context) {
    try {
      const { slotId } = c.req.param();
      const deletedSlot = await TimeSlotService.deleteTimeSlot(Number(slotId));
      
      return c.json(deletedSlot);
    } catch (error) {
      return handleError(c, error, "Failed to delete time slot");
    }
  }

  static async getAvailableSlots(c: Context) {
    try {
      const { therapistId } = c.req.param();
      const { startDate, endDate } = c.req.query();
      
      const slots = await TimeSlotService.getAvailableSlotsInRange(
        Number(therapistId),
        new Date(startDate),
        new Date(endDate)
      );
      
      return c.json(slots);
    } catch (error) {
      return handleError(c, error, "Failed to get available slots");
    }
  }
}