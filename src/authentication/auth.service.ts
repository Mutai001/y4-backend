//auth.service.ts
import {Authentication, users,TIAuthentication, TIUsers  } from "../drizzle/schema";
import db from "../drizzle/db";
import { sql } from "drizzle-orm";
 
 
export const createAuthUserService = async (user:  TIUsers & { password: string }): Promise<string | null> => {
    try {
        // Insert into Users table
        const createdUser = await db.insert(users).values({
          full_name: user.full_name,
          email: user.email,
          contact_phone: user.contact_phone,
          address: user.address,
          role: user.role,
    
        }).returning({ id: users.id});
 
        // Ensure the user was created and the id is retrieved
        if (!createdUser || !createdUser[0] || !createdUser[0].id) {
            throw new Error("Failed to create user in users table");
        }
 
        const userId = createdUser[0].id;
 
        // Insert into Auth table
        await db.insert(Authentication).values({
            user_id: userId,
            password: user.password,
            role: user.role === 'user' || user.role === 'admin' || user.role === 'therapist' ? user.role : 'user',
            email: user.email
        });
 
        return "User created successfully";
    } catch (error) {
        console.error("Error creating user in the database:", error);
        return null;
    }
};
 
 
export const userLoginService = async (user: TIAuthentication) => {
    const { email,password } = user;
    return await db.query.Authentication.findFirst({
        columns: {
            email: true,
            role: true,
            password: true
        }, where: sql` ${Authentication.email} = ${email}`,
        with: {
            user: {
                columns: {
                    full_name: true,
                    contact_phone: true,
                   address: true,
                    id: true
                }
            }
        }
    })
}
 