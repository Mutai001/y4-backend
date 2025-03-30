import { Hono } from "hono";
import { listdiagnostics, getdiagnostics, creatediagnostics, updatediagnostics, deletediagnostics } from "./diagnostics.controller";
import { zValidator } from "@hono/zod-validator";
import { diagnosticSchema } from "./validator"; 
import { adminRoleAuth } from "../middleware/bearAuth";
import { therapistRoleAuth } from "../middleware/bearAuth";

export const diagnosticRouter = new Hono();

// Get all diagnostics
diagnosticRouter.get("/", adminRoleAuth, listdiagnostics);

// Get a single diagnostic record by ID
diagnosticRouter.get("/:id", adminRoleAuth, getdiagnostics);

// Create a diagnostic record
diagnosticRouter.post(
  "/",
  zValidator("json", diagnosticSchema, (result, c) => {
    if (!result.success) {
      return c.json(result.error, 400);
    }
  }),
  creatediagnostics
);

// Update a diagnostic record
diagnosticRouter.put("/:id", updatediagnostics);

// Delete a diagnostic record (only therapists can delete)
diagnosticRouter.delete("/:id", therapistRoleAuth, deletediagnostics);
