// timeSlot.router.ts (Routes Definition)

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { TimeSlotController } from './timeSlot.controller';
import { 
  createTimeSlotsSchema, 
  updateTimeSlotSchema,
  getAvailableSlotsSchema
} from './timeSlot.validator';

export const timeSlotRouter = new Hono();

// Create time slots for a therapist
timeSlotRouter.post(
  '/:therapistId/slots',
  zValidator('json', createTimeSlotsSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }), 
  TimeSlotController.createSlots
);

// Get time slots for a therapist on a specific date
timeSlotRouter.get(
  '/:therapistId/slots/:date',
  TimeSlotController.getSlots
);

// Update a specific time slot
timeSlotRouter.patch(
  '/slots/:slotId',
  zValidator('json', updateTimeSlotSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }),
  TimeSlotController.updateSlot
);

// Delete a time slot
timeSlotRouter.delete(
  '/slots/:slotId',
  TimeSlotController.deleteSlot
);

// Get available slots between dates
timeSlotRouter.get(
  '/:therapistId/available',
  zValidator('query', getAvailableSlotsSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error.issues, 400);
    }
  }),
  TimeSlotController.getAvailableSlots
);

export default timeSlotRouter;