import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { FeedbackController } from "./feedback.controller";
import { feedbackSchema, feedbackUpdateSchema } from "./validator";

export const feedbackRouter = new Hono();

// Logging middleware
feedbackRouter.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} - ${ms}ms`);
});

// Main routes
feedbackRouter.get("/", FeedbackController.getAll);
feedbackRouter.get("/:id", FeedbackController.getById);
feedbackRouter.get("/session/:session_id", FeedbackController.getBySession);
feedbackRouter.get("/user/:user_id", FeedbackController.getByUser);

feedbackRouter.post(
  "/",
  zValidator("json", feedbackSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, 400);
    }
  }),
  FeedbackController.create
);

feedbackRouter.put(
  "/:id",
  zValidator("json", feedbackUpdateSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: "Validation failed",
        details: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, 400);
    }
  }),
  FeedbackController.update
);

feedbackRouter.delete("/:id", FeedbackController.delete);

export default feedbackRouter;