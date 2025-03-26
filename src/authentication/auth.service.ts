// auth.service.ts
import { authentication, users, TIAuthentication, TIUsers } from "../drizzle/schema";
import db from "../drizzle/db";
import { sql, eq } from "drizzle-orm";

export const createAuthUserService = async (user: TIUsers & { password: string }): Promise<string | null> => {
    try {
        // Check if user already exists
        const existingUser = await db.select().from(users)
            .where(eq(users.email, user.email))
            .limit(1);

        if (existingUser.length > 0) {
            return null; // User already exists
        }

        // Insert into Users table
        const createdUser = await db.insert(users).values({
            full_name: user.full_name,
            email: user.email,
            contact_phone: user.contact_phone,
            address: user.address,
            role: user.role || "patient", // Default to patient if no role specified
            specialization: user.specialization, // Optional for therapists
            experience_years: user.experience_years, // Optional for therapists
        }).returning({ id: users.id });

        // Ensure the user was created and the id is retrieved
        if (!createdUser || !createdUser[0] || !createdUser[0].id) {
            throw new Error("Failed to create user in users table");
        }

        const userId = createdUser[0].id;

        // Insert into Auth table
        await db.insert(authentication).values({
            user_id: userId,
            password: user.password,
            email: user.email,
            role: user.role || "patient"
        });

        return "User created successfully";
    } catch (error) {
        console.error("Error creating user in the database:", error);
        return null;
    }
};

export const userLoginService = async (user: { email: string, password: string }) => {
    return await db.query.authentication.findFirst({
        columns: {
            email: true,
            role: true,
            password: true,
            user_id: true
        },
        where: sql`${authentication.email} = ${user.email}`,
        with: {
            user: {
                columns: {
                    id: true,
                    full_name: true,
                    email: true,
                    contact_phone: true,
                    address: true,
                    role: true
                }
            }
        }
    });
};

export const getUserByEmailService = async (email: string) => {
    return await db.query.users.findFirst({
        where: sql`${users.email} = ${email}`
    });
};