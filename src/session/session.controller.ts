import { Context } from "hono";
import {
  sessionService,
  getSessionService,
  createSessionService,
  updateSessionService,
  deleteSessionService
} from "./session.service";
import { z } from "zod";
import { sessionSchema, updateSessionSchema, SessionInput, UpdateSessionInput } from "./validator";

export const listsession = async (c: Context) => {
  try {
    const limit = Number(c.req.query('limit')) || undefined;
    const data = await sessionService(limit);
    
    if (!data || data.length === 0) {
      return c.json({ message: "No sessions found" }, 404);
    }
    
    return c.json({ data, count: data.length }, 200);
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return c.json({ 
      error: "Failed to fetch sessions",
      details: error.message 
    }, 500);
  }
};

export const getsession = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid session ID" }, 400);
  }

  try {
    const session = await getSessionService(id);
    
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    return c.json(session, 200);
  } catch (error: any) {
    console.error(`Error fetching session ${id}:`, error);
    return c.json({ 
      error: "Failed to fetch session",
      details: error.message 
    }, 500);
  }
};

export const createsession = async (c: Context) => {
  try {
    const rawData = await c.req.json();
    const validatedData: SessionInput = await sessionSchema.parseAsync(rawData);
    
    const result = await createSessionService(validatedData);
    
    return c.json({ 
      message: "Session created successfully",
      data: validatedData 
    }, 201);
  } catch (error: any) {
    console.error("Error creating session:", error);
    
    if (error instanceof z.ZodError) {
      return c.json({
        error: "Validation failed",
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          // removed 'received' as it does not exist on ZodIssue
        }))
      }, 400);
    }
    
    return c.json({ 
      error: "Failed to create session",
      details: error.message 
    }, 500);
  }
};

export const updatesession = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid session ID" }, 400);
  }

  try {
    const rawData = await c.req.json();
    const validatedData: UpdateSessionInput = await updateSessionSchema.parseAsync(rawData);
    
    const existingSession = await getSessionService(id);
    if (!existingSession) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const result = await updateSessionService(id, validatedData);
    
    return c.json({ 
      message: "Session updated successfully",
      data: { id, ...validatedData } 
    }, 200);
  } catch (error: any) {
    console.error(`Error updating session ${id}:`, error);
    
    if (error instanceof z.ZodError) {
      return c.json({
        error: "Validation failed",
        issues: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          // removed 'received' as it does not exist on ZodIssue
        }))
      }, 400);
    }
    
    return c.json({ 
      error: "Failed to update session",
      details: error.message 
    }, 500);
  }
};

export const deletesession = async (c: Context) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid session ID" }, 400);
  }

  try {
    const existingSession = await getSessionService(id);
    if (!existingSession) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const result = await deleteSessionService(id);
    
    return c.json({ 
      message: "Session deleted successfully",
      id 
    }, 200);
  } catch (error: any) {
    console.error(`Error deleting session ${id}:`, error);
    return c.json({ 
      error: "Failed to delete session",
      details: error.message 
    }, 500);
  }
};