import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BookingsController } from "./bookings.controller";
import { bookingsSchema } from "./validator";

export const bookingsRouter = new Hono();

// Logging middleware
bookingsRouter.use("*", async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`);
  await next();
});

// Routes
bookingsRouter.get("/", BookingsController.getAll);
bookingsRouter.get("/:id", BookingsController.getById);

bookingsRouter.post(
  "/",
  zValidator("json", bookingsSchema, (result, c) => {
    if (!result.success) {
      console.error("Validation Errors:", result.error.errors);
      return c.json({
        success: false,
        error: "Validation failed",
        details: result.error.errors
      }, 400);
    }
  }),
  BookingsController.create
);

bookingsRouter.put("/:id", BookingsController.update);
bookingsRouter.delete("/:id", BookingsController.delete);
bookingsRouter.get("/check-availability/:slot_id", BookingsController.checkSlotAvailability);
bookingsRouter.get("/therapist/:therapist_id", BookingsController.getBookingsByTherapist);

export default bookingsRouter;