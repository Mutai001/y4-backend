import { Hono } from "hono";
import { listsession, getsession, createsession, updatesession, deletesession } from "./session.controller";
import { zValidator } from "@hono/zod-validator";
import { sessionSchema } from "./validator";
import { adminRoleAuth } from "../middleware/bearAuth";
import { therapistRoleAuth } from "../middleware/bearAuth";

export const sessionRouter = new Hono();

// Get all sessions
sessionRouter.get("/", listsession);

// Get a single session by ID
sessionRouter.get("/:id", getsession);

// Create a session with validation
sessionRouter.post("/", zValidator('json', sessionSchema, (result, c) => {
    if (!result.success) {
        return c.json(result.error, 400);
    }
}), createsession);

// Update a session
sessionRouter.put("/:id", updatesession);

// Delete a session (restricted to admin or therapist role)
sessionRouter.delete("/:id", 
    // therapistRoleAuth, adminRoleAuth, 
    deletesession);
