import { Context } from "hono";
import {
  getAvailableTimeSlotsService,
  getAvailableTimeSlotService,
  createAvailableTimeSlotService,
  updateAvailableTimeSlotService,
  deleteAvailableTimeSlotService
} from "./timeSlot.service";

// Controller to get all available time slots
export const listAvailableTimeSlots = async (c: Context) => {
  try {
    const limit = Number(c.req.query('limit'));
    const timeSlots = await getAvailableTimeSlotsService(limit);
    if (timeSlots == null || timeSlots.length === 0) {
      return c.text("No available time slots found", 404);
    }
    return c.json(timeSlots, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

// Controller to get a single time slot by ID
export const getAvailableTimeSlot = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const timeSlot = await getAvailableTimeSlotService(id);
  if (!timeSlot) {
    return c.text("Time Slot not found", 404);
  }
  return c.json(timeSlot, 200);
};

// Controller to create a new time slot
export const createAvailableTimeSlot = async (c: Context) => {
  try {
    const timeSlot = await c.req.json();
    const createdTimeSlot = await createAvailableTimeSlotService(timeSlot);
    if (!createdTimeSlot) return c.text("Time Slot not created", 404);
    return c.json({ msg: createdTimeSlot }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

// Controller to update an existing time slot by ID
export const updateAvailableTimeSlot = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  const timeSlot = await c.req.json();
  try {
    const timeSlotToUpdate = await getAvailableTimeSlotService(id);
    if (!timeSlotToUpdate) return c.text("Time Slot not found", 404);
    const res = await updateAvailableTimeSlotService(id, timeSlot);
    if (!res) return c.text("Time Slot not updated", 404);

    return c.json({ msg: res }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

// Controller to delete a time slot by ID
export const deleteAvailableTimeSlot = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.text("Invalid ID", 400);

  try {
    const timeSlot = await getAvailableTimeSlotService(id);
    if (!timeSlot) return c.text("Time Slot not found", 404);
    const res = await deleteAvailableTimeSlotService(id);
    if (!res) return c.text("Time Slot not deleted", 404);

    return c.json({ msg: res }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
