import { Context } from "hono";
import {
  getAvailableTimeSlotsService,
  getAvailableTimeSlotService,
  createAvailableTimeSlotService,
  updateAvailableTimeSlotService,
  deleteAvailableTimeSlotService
} from "./timeSlot.service";

// ✅ Get all available time slots
// export const listAvailableTimeSlots = async (c: Context) => {
//   try {
//     const limit = Number(c.req.query("limit")) || undefined;
//     const timeSlots = await getAvailableTimeSlotsService(limit);

//     if (!timeSlots || timeSlots.length === 0) {
//       return c.json({ message: "No available time slots found" }, 404);
//     }

//     return c.json(timeSlots, 200);
//   } catch (error: any) {
//     return c.json({ error: error.message }, 500);
//   }
// };
export const listAvailableTimeSlots = async (c: Context) => {
  try {
    const timeSlots = await getAvailableTimeSlotsService();

    if (!timeSlots.length) {
      return c.json({ message: "No available time slots found", data: [] }, 200);
    }

    return c.json({ message: "Available time slots retrieved", data: timeSlots }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};



// ✅ Get a single time slot by ID
export const getSingleTimeSlot = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  const timeSlot = await getAvailableTimeSlotService(id);
  if (!timeSlot) {
    return c.json({ error: "Time Slot not found" }, 404);
  }
  return c.json(timeSlot, 200);
};

// ✅ Create a new time slot
export const createAvailableTimeSlot = async (c: Context) => {
  try {
    const timeSlot = await c.req.json();
    const createdTimeSlot = await createAvailableTimeSlotService(timeSlot);

    return c.json({ message: "Time Slot created successfully", data: createdTimeSlot }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// ✅ Update an existing time slot by ID
export const updateAvailableTimeSlot = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const updatedData = await c.req.json();
    const updatedTimeSlot = await updateAvailableTimeSlotService(id, updatedData);

    if (!updatedTimeSlot) {
      return c.json({ error: "Time Slot not updated or not found" }, 404);
    }

    return c.json({ message: "Time Slot updated successfully", data: updatedTimeSlot }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

// ✅ Delete a time slot by ID
export const deleteAvailableTimeSlot = async (c: Context) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);

  try {
    const deleted = await deleteAvailableTimeSlotService(id);
    if (!deleted) return c.json({ error: "Time Slot not deleted or not found" }, 404);

    return c.json({ message: "Time Slot deleted successfully" }, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};
