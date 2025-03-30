import { Hono } from "hono";
import { listresourcess, getresourcess, createresourcess, updateresourcess, deleteresourcess } from "./resources.controller";
import { zValidator } from "@hono/zod-validator";
import { resourcesSchema } from "./validator";
// import { adminRoleAuth } from '../middleware/bearAuth';

export const resourcesRouter = new Hono();

// Get all resources
resourcesRouter.get("/", 
    // adminRoleAuth, 
    listresourcess);

// Get a single resource by ID
resourcesRouter.get("/:id",
    //  adminRoleAuth, 
     getresourcess);

// Create a resource
resourcesRouter.post("/", zValidator('json', resourcesSchema, (result, c) => {
    if (!result.success) {
        return c.json(result.error, 400);
    }
}), createresourcess);

// Update a resource
resourcesRouter.put("/:id", updateresourcess);

// Delete a resource
resourcesRouter.delete("/:id", 
    // adminRoleAuth,
     deleteresourcess);
