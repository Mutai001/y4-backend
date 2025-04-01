import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { sessions } from "../drizzle/schema";
import { SessionInput, UpdateSessionInput } from "./validator";

export const sessionService = async (limit?: number) => {
  try {
    const query = db.query.sessions.findMany({
      ...(limit && { limit }),
      with: {
        booking: true,
        // therapist: true
      },
      orderBy: (sessions, { desc }) => [desc(sessions.created_at)]
    });
    
    return await query;
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    throw new Error("Failed to fetch sessions");
  }
};

export const getSessionService = async (id: number) => {
  try {
    return await db.query.sessions.findFirst({
      where: eq(sessions.id, id),
      with: {
        booking: true,
        // user: true, // Removed as it is not a valid property
        // therapist: true
      }
    });
  } catch (error: any) {
    console.error(`Error fetching session ${id}:`, error);
    throw new Error("Failed to fetch session");
  }
};

export const createSessionService = async (sessionData: SessionInput) => {
  try {
    const [result] = await db.insert(sessions)
      .values({
        ...sessionData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    return result;
  } catch (error: any) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session");
  }
};

export const updateSessionService = async (id: number, sessionData: UpdateSessionInput) => {
  try {
    const [result] = await db.update(sessions)
      .set({
        ...sessionData,
        updated_at: new Date()
      })
      .where(eq(sessions.id, id))
      .returning();
    
    return result;
  } catch (error: any) {
    console.error(`Error updating session ${id}:`, error);
    throw new Error("Failed to update session");
  }
};

export const deleteSessionService = async (id: number) => {
  try {
    const [result] = await db.delete(sessions)
      .where(eq(sessions.id, id))
      .returning({ id: sessions.id });
    
    return result;
  } catch (error: any) {
    console.error(`Error deleting session ${id}:`, error);
    throw new Error("Failed to delete session");
  }
};